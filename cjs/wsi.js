import setupWsiSearch from './search.js';
import setupWsiFileUpload from './filespro.js';


/////////////////////////////////////////////////////////////////////////////////
//    check whether to load search
/////////////////////////////////////////////////////////////////////////////////
if (document.querySelector('.navSearchMain')) {
  var searchFunctions = setupWsiSearch();
}

/////////////////////////////////////////////////////////////////////////////////
//    check whether to load filespro
/////////////////////////////////////////////////////////////////////////////////
if (document.querySelector('.fileUploadSendBtn') || document.querySelector('.fileUploadSendAvatarBtn')) {
  var fileUploadFunctions = setupWsiFileUpload();
}

/////////////////////////////////////////////////////////////////////////////////
//    wsi
/////////////////////////////////////////////////////////////////////////////////
// localStorage of the browser is used to store the last tabId in a single char
// get the next wsiCurrentTabId in storage, single character
export let wsiCurrentTabId = localStorage.getItem('wsiCurrentTabId');
if (wsiCurrentTabId !== null) {
  let nextTabId = wsiCurrentTabId.charCodeAt(0) + 1;
  //   33; // '!' to  126; // '~'
  if (nextTabId > 126) {
    nextTabId = 33;
  }
  localStorage.setItem('wsiCurrentTabId', String.fromCharCode(nextTabId));
} else {
  wsiCurrentTabId = String.fromCharCode(33);
  localStorage.setItem('wsiCurrentTabId', wsiCurrentTabId);
}

function handleWsEvent(event) {
  switch (event.type) {
    case 'onopen':
      console.log('WebSocket is open');
      if (typeof fileUploadFunctions !== 'undefined') {
        fileUploadFunctions.wsiToFilesproAskForListOfFiles();
      }
      break;
    case 'onclose':
      console.log('WebSocket is closed');
      break;
    case 'onerror':
      console.log('WebSocket encountered an error');
      break;
    case 'onmessage':
      console.log('WSI Received message:', event.data);
      if (event.data.length > 2) {
        let message = event.data.substring(2)
        if (event.data[1] == wsiCurrentTabId) {
          switch (event.data[0]) {
            case 's':
              // check if the module is loaded
              if (typeof searchFunctions !== 'undefined') {
                searchFunctions.showSearchResults(message);
              }
            case 'f':
              if (typeof fileUploadFunctions !== 'undefined') {
                fileUploadFunctions.wsiToFilesproMessageReceived(message);
              }
          }
        }
      }
      break;
    default:
  }
}

const websocketUrl = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') +
  window.location.host + '/wsi/';
let wsworker;
let gsocket;
let useSharedWorker = !!window.SharedWorker; // is supported

export function wsiOpenSharedSocket() {
  if (typeof wsworker === 'undefined') {
    if (useSharedWorker) {
      wsworker = new SharedWorker('/static/js/sharedWorker.js');

      wsworker.port.onmessage = function(e) {
        handleWsEvent(e.data);
      };

      wsworker.port.start();

      wsworker.port.postMessage({
        command: 'connect',
        url: websocketUrl
      });
    } else {
      initiateWebsocketFallback();
    }
    window.addEventListener('beforeunload', function() {
      if (useSharedWorker) {
        wsworker.port.postMessage({
          command: 'removePort'
        });
      } else {
        gsocket.close()
      }
    });
  }
}

function initiateWebsocketFallback() {
  gsocket = new WebSocket(websocketUrl);

  gsocket.onopen = function() {
    handleWsEvent({
      type: 'onopen'
    });
  };

  gsocket.onmessage = function(e) {
    handleWsEvent({
      type: 'onmessage',
      data: e.data
    });
  };

  gsocket.onerror = function() {
    handleWsEvent({
      type: 'onerror'
    });
  };

  gsocket.onclose = function() {
    handleWsEvent({
      type: 'onclose'
    });
  };
}

export function wsiSend(message) {
  if (useSharedWorker) {
    wsworker.port.postMessage({
      command: 'send',
      message: message
    });
  } else if (gsocket && gsocket.readyState === WebSocket.OPEN) {
    gsocket.send(message);
  }
  if (message.length < 100) {
    console.log("WSI Sending: " + message)
  }
}

export function wsiReconnect() {
  if (useSharedWorker) {
    wsworker.port.postMessage({
      command: 'reconnect',
      url: websocketUrl
    });
  } else if (gsocket && gsocket.readyState === WebSocket.OPEN) {
    gsocket.close();
    gsocket = null;
    initiateWebsocketFallback();
  }
}