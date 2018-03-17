import work from 'webworkify-webpack';
import crc32 from 'crc32';

class Uploader {
  constructor({onProgress, onError, complete, ...params}) {
    this.state.workerManager = work(require.resolve('./workersManager.worker.js'));
    this.state.workerManager.onmessage = this.onMessage;
    this.postMessage({payload: params, event: 'setParams'});
    this.onProgress = onProgress;
    this.onError = onError;
    this.complete = complete;
  }

  state = {
    uploadedFiles: [],
    workerManager: null
  };

  resume = (fileId) => {
    const idIsCorrect = this.verifyId(fileId);

    if (idIsCorrect) {
      this.postMessage({payload: fileId, event: 'resumeUpload'});
    }

    return idIsCorrect;
  }

  pause = (fileId) => {
    const idIsCorrect = this.verifyId(fileId);

    if (idIsCorrect) {
      this.postMessage({payload: fileId, event: 'pauseUpload'});
    }

    return idIsCorrect;
  }

  stop = (fileId) => {
    const idIsCorrect = this.verifyId(fileId);

    if (idIsCorrect) {
      this.postMessage({payload: fileId, event: 'stopUpload'});
    }

    return idIsCorrect;
  }

  send = (files, url) => {
    const post = [];

    files.forEach((file) => {
      const fileId = crc32(file.name + '-' + file.size + '-' + +file.lastModified);
      const isContain = this.state.uploadedFiles.findIndex((identifier) => identifier === fileId);

      if (isContain === -1) {
        this.state.uploadedFiles.push(fileId);
        post.push({id: fileId, data: file});
      } else {
        this.onError({
          identifier: file.name,
          error: {
            message: file.name + ' file already is loading',
            reason: ''
          }
        });
      }
    });

    (post.length && this.postMessage({
      payload: {
        files: post,
        url: url
      },
      event: 'setFiles'
    }));
  }

  postMessage = (data) => {
    this.state.workerManager.postMessage(data);
  }

  onMessage = (message) => {
    if (typeof this[message.data.event] === 'function') {
      this[message.data.event](message.data.payload);
    }
  }

  refreshUploadedFiles = (hashArray) => {
    this.state.uploadedFiles = [...new Set([...this.state.uploadedFiles, ...hashArray])];
  }

  verifyId = (id) => {
    const idIsCorrect = this.state.uploadedFiles.some((fileId) => fileId === id);

    if (!idIsCorrect) {
      this.onError({
        identifier: id,
        error: {
          message: 'invalid identifier, no such file',
          reason: ''
        }
      });
    }

    return idIsCorrect;
  }
}

export default Uploader;
