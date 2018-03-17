# React resumable uploader

## Introduce

This uploader is focused on uploading large files with the possibility of renewable download. This library is explicitly designed for modern browsers that support **IndexedDB**, **FileReader API** and **Web Workers API**. The upload of files occurs through the **WebSocket** and for this task the **socket.IO** library is used inside.

## Installation
```
npm install react-resumable-uploader -S
```
## To start
You need to import two components:

#### First component.
```
import { UploaderProvider } from  'react-resumable-uploader';
```
This component is the root one and it should be wrapped in a component that provides the OnProgress OnError methods. This is done so that you can use any tool to manage the state (Redux or Mobx).

This example uses Mobx :
```
import { UploaderProvider } from  'react-file-uploader';

@inject("uploaderStore", "messagesStore")
@observer
class  UploaderWrapper  extends  Component {
  onProgress  = (filesState) => {
    const { setChangedState } =  this.props.uploaderStore;
  
    setChangedState(filesState);
  }

  onError  = (error) => {
    const { setMessage } =  this.props.messagesStore;
  
    setMessage(error);
  }

  complete  = (file) => {
    //to do some action
  }

  render() {
    return (
      <UploaderProvider  
        {...this.props} //childrens and params
        onProgress={this.onProgress}
        onError={this.onError}
        complete={this.complete}/>
    );
  }
}
```
Then put it in the root of your application.</br>
For example:
```
class  App  extends  Component {
 render() {
   const  params  = {
     chunkSize:  5  *  1024  *  1024,
     maxConnectionAttempts:  5,
     fileThrottle:  300,
     mainThrottle:  300,
     url:  'ws://{hostname}/{endpoint}',
     events: {
       GET_LAST_CHUNK: 'get-last-chunk',
       SEND_NEXT_CHUNK: 'send-next-chunk',
       SEND_NEXT_CHUNK_SUCCESS: 'send-next-chunk-successful',
       SEND_FILE_SUCCESS: 'send-file-successful',
       CANCEL_UPLOAD: 'cancel-upload',
       SEND_CHUNK_AGAIN: 'send-chunk-again',
       ERROR: 'error',
     }
   };
   
   return (
     <UploaderWrapper  params={params}>
       <div  className="App">
         <Header/>
         <Menu/>
         <Main/>
       </div>
     </UploaderWrapper>
    );
  }
}
```
#### Second component.
```
import { uploaderContext } from  'react-resumable-uploader';
```
This component is a higher-order component (HOC) that provides methods **submit(files)**, **pause(fileId)**, **resume(fileId)**, **stop(fileId)**. It can be used anywhere in the application.</br>
For example:
 **If You use** `babel-plugin-transform-decorators-legacy`
```
import { uploaderContext } from  'react-resumable-uploader';

@uploaderContext
class  UploadManager  extends  Component {
  stop  = (fileId) => {
    return  this.props.stop(fileId);
  }
  
  pause  = (fileId) => {
    return  this.props.pause(fileId);
  }
  
  resume  = (fileId) => {
    return  this.props.resume(fileId);
  }

  render() {}
}

export  default  UploadManager;
```
or if you do not use decorators
```
export  default uploaderContext(UploadManager);
```


## API

Let's start with a description of the methods provided by the **uploaderContext** component:

|    Method     |  Parameters |             |
|---------------|-----------|-------------|
|stop |`fileId<string>`|Returns a boolean value if the action was successful|
|pause|`fileId<string>`|Returns a boolean value if the action was successful|
|resume|`fileId<string>`|Returns a boolean value if the action was successful|
|submit|`Array<File>, url<string>`||

Parameters for **UploaderProvider** component:

**Callbacks**

|   Parameter   |    Type    |      Arguments       |
|---------------|------------|-------------|
|onProgress - provides progress of file upload |`function`| `Array`**`<FileObject>`** [--see below](#fileObject)|
|onError |`function`| `errorObject` |
|complete |`function`| **`<FileObject>`** [--see below](#fileObject)|

**Object params**

|   Key   |    Type    |      Description       |
|---------------|------------|-------------|
|chunkSize |`byte number`| for example - 5 * 1024 * 1024 |
|maxConnectionAttempts |`number`|  |
|fileThrottle |`number<ms>`| to update the status of a single file |
|mainThrottle |`number<ms>`| to update the status of all files |
|url |`string`| 'ws://{hostname}/{endpoint}' Will be used for all files. Also you can pass URL for each file in the **submit** method  |
|events |`object`| Contains event names used to communicate using the web socket (are described below) |
|events.GET_LAST_CHUNK |`eventName<string> .emit() and .on()<number>`| sends an object of the form `{id: "fileId"}` Accepts data of type `last chunk<number>`|
|events.SEND_NEXT_CHUNK |`eventName<string> .emit() file chunk<object>`| Sends data of type **`<PostData>`** [--see below](#postData)|
events.SEND_NEXT_CHUNK_SUCCESS |`eventName<string> .on()`| sends the next piece on this event |
events.SEND_FILE_SUCCESS |`eventName<string> .on()`| Delete the file from the IndexDB on this event |
events.CANCEL_UPLOAD |`eventName<string> .emit()`| Sends `fileId<string>`. Notifies when the upload stops |
events.SEND_CHUNK_AGAIN |`eventName<string> .on()`| Starts the upload from the last successful piece |
events.ERROR |`eventName<string> .on()`| Accepts any errors from the server and calls **onError** callback |

#### <a id="postData" name="postData"></a>
<**PostData**> interface (Dispatched to the server)

|   Key   |    Type    |      Description       |
|---------------|------------|-------------|
|chunk |`<ArrayBuffer>`|  |
|fileId |`<string>`|  |
|chunkNum |`current chunk<number>`|  |
|chunkSize |`byteLength<number>`|  |
|type |`file type<string>`|  |
|name |`file name<string>`|  |
|isFinal |`<boolean>`| When the last chunk is sent it's **`true`**|

#### <a id="fileObject" name="fileObject"></a> 
<**FileObject**> interface (Passed to **onProgress** callback function)

|   Key   |    Type    |      Description       |
|---------------|------------|-------------|
|progress |`percent`|  |
|fileId |`<string>`|  |
|size |`file size<byte number>`|  |
|name |`file name<string>`|  |
|type |`file type<string>`|  |
|passedBytes |`byte number`|  |
|currentChunk |`number`|  |
|isFinal |`<boolean>`|  |


## Utils

`import {getFileSize, getFileName, getFileFormat} from  'react-resumable-uploader';`

getFileSize(bytes) - translate bytes in a human-readable form;</br>
getFileName(name|string) - translate name in a human-readable form;</br>
getFileFormat(name|string) - returns file extension;


## License
MIT
