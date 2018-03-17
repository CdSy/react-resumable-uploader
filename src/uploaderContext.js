import React, { Component } from 'react';
import PropTypes from 'prop-types';

const uploaderContext = (WrappedComponent) => {
  class ContextProvider extends Component {
    render() {
      return (<WrappedComponent {...this.props} {...this.context} />);
    }
  }

  ContextProvider.contextTypes = {
    submit: PropTypes.func.isRequired,
    resume: PropTypes.func.isRequired,
    pause: PropTypes.func.isRequired,
    stop: PropTypes.func.isRequired
  };

  return ContextProvider;
};

export default uploaderContext;
