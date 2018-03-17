import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Uploader from './uploader';

const indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB ||
                  window.OIndexedDB || window.msIndexedDB;

if (!indexedDB) {
  alert("Your browser doesn't support a stable version of IndexedDB. Please update your browser");
}

if (!window.Worker) {
  alert("Your browser doesn't support Web Worker. Please update your browser");
}

class UploaderProvider extends Component {
  uploader = null;

  componentDidMount = () => {
    if (window.Worker && indexedDB) {
      this.uploader = new Uploader({
        onProgress: this.props.onProgress,
        onError: this.props.onError,
        complete: this.props.complete,
        ...this.props.params
      });
    }
  }

  getChildContext = () => {
    let context;

    if (window.Worker && indexedDB) {
      context = {
        submit: this.submit,
        resume: this.resume,
        pause: this.pause,
        stop: this.stop
      };
    } else {
      const errorMessage = `
        fileuploader did not initialized!
        Your browser does not support Web Worker or IndexedDB`;

      context = {
        submit: () => console.log(errorMessage),
        resume: () => console.log(errorMessage),
        pause: () => console.log(errorMessage),
        stop: () => console.log(errorMessage)
      };
    }

    return context;
  }

  submit = (files, url) => {
    this.uploader.send(files, url);
  }

  resume = (index) => {
    return this.uploader.resume(index);
  }

  pause = (index) => {
    return this.uploader.pause(index);
  }

  stop = (index) => {
    return this.uploader.stop(index);
  }

  render() {
    return (
      <React.Fragment>
        { this.props.children }
      </ React.Fragment>
    );
  }
}

UploaderProvider.childContextTypes = {
  submit: PropTypes.func.isRequired,
  resume: PropTypes.func.isRequired,
  pause: PropTypes.func.isRequired,
  stop: PropTypes.func.isRequired
};

export default UploaderProvider;
