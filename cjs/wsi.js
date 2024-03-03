import setupWsiSearch from './search.js';
import setupWsiFileUpload from './filespro.js';
import setupWsiChat from './chat.js';

// setTimeout(function() {
//   wsiOpenWS();
// }, 0);
/////////////////////////////////////////////////////////////////////////////////
//    check whether to load search
/////////////////////////////////////////////////////////////////////////////////
if (document.querySelector('.navSearchMain')) {
  var searchFunctions = setupWsiSearch(); // keep at var so it goes in the module top level
};

/////////////////////////////////////////////////////////////////////////////////
//    check whether to load chat
/////////////////////////////////////////////////////////////////////////////////
if (document.querySelector('.fileUploadSendBtn') ||
  document.querySelector('.fileUploadSendAvatarBtn')) {
  var fileUploadFunctions = setupWsiFileUpload(); // keep at var so it goes in the module top level
};

/////////////////////////////////////////////////////////////////////////////////
//    check whether to load filespro
/////////////////////////////////////////////////////////////////////////////////
if (document.querySelector('.chatNav')) {
  var chatFunctions = setupWsiChat(); // keep at var so it goes in the module top level
};

/////////////////////////////////////////////////////////////////////////////////
//    wsi
/////////////////////////////////////////////////////////////////////////////////
const websocketUrl = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') +
  window.location.host + '/wsi/';
let wsworker;
let gsocket;
let useSharedWorker = !!window.SharedWorker; // is supported
let wsOpenedByMe = false;

// localStorage of the browser is used to store the last tabId in a single char
// get the next wsiCurrentTabId in storage, single character
export let wsiCurrentTabId = localStorage.getItem('wsiCurrentTabId');
if (wsiCurrentTabId !== null) {
  let nextTabId = wsiCurrentTabId.charCodeAt(0) + 1;
  //   33; // '!' to  126; // '~'
  if (nextTabId > 126) {
    nextTabId = 33;
  };
  localStorage.setItem('wsiCurrentTabId', String.fromCharCode(nextTabId));
} else {
  wsiCurrentTabId = String.fromCharCode(33);
  localStorage.setItem('wsiCurrentTabId', wsiCurrentTabId);
};

function handleWsEvent(event) {
  switch (event.type) {
    case 'onopen':
      if (wsOpenedByMe) {
        wsOpenedByMe = false;
        console.log('WebSocket is open');
        ///// does the following for every tab /////
        if (typeof searchFunctions !== 'undefined') {
          searchFunctions.makeSearchQuery();
        };
        if (typeof fileUploadFunctions !== 'undefined') {
          fileUploadFunctions.askForListOfFiles();
        };
        if (typeof chatFunctions !== 'undefined') {
          chatFunctions.askForListOfSessions();
        };
        break;
      }
    case 'onclose':
      removeWS()
      console.log('WebSocket is closed');
      break;
    case 'onerror':
      removeWS()
      console.log('WebSocket encountered an error');
      break;
    case 'onmessage':
      console.log('WSI Received message:', event.data);
      if (event.data.length > 2) {
        let message = event.data.substring(2);
        if (event.data[1] == wsiCurrentTabId) {
          switch (event.data[0]) {
            case 's':
              // check if the module is loaded
              if (typeof searchFunctions !== 'undefined') {
                searchFunctions.wsiToSearchMessageReceived(message);
              };
            case 'f':
              if (typeof fileUploadFunctions !== 'undefined') {
                fileUploadFunctions.wsiToFilesproMessageReceived(message);
              };
            case 'c':
              if (typeof chatFunctions !== 'undefined') {
                chatFunctions.wsiToChatMessageReceived(message);
              };
          };
        };
      };
      break;
    default:
  };
};

function removeWS() {
  if (typeof wsworker !== 'undefined') {
    wsworker.port.postMessage({
      command: 'removePort'
    });
    wsworker = undefined;
  }
  if (typeof gsocket !== 'undefined') {
    gsocket.close();
    gsocket = undefined;
  }
}

export function wsiOpenWS() {
  if (typeof wsworker === 'undefined' && typeof gsocket === 'undefined') {
    if (useSharedWorker) {
      console.log("Worker: Opening WS", "url: ", websocketUrl)
      wsworker = new SharedWorker('/static/js/sharedWorker.js');
      wsworker.port.onmessage = function(e) {
        handleWsEvent(e.data);
      };
      wsworker.port.start();
      wsworker.port.postMessage({
        command: 'connect',
        url: websocketUrl
      });
      wsOpenedByMe = true;
    } else {
      console.log("Fallback Opening WS", "url: ", websocketUrl)
      initiateWebsocketFallback();
      wsOpenedByMe = true;
    };
    if (wsOpenedByMe) {
      window.addEventListener('beforeunload', function() {
        removeWS();
      });
    }
  }
};

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
};

export function wsiSend(message) {
  if (typeof wsworker !== 'undefined') {
    wsworker.port.postMessage({
      command: 'send',
      message: message
    });
    message.length < 100 ? console.log("Worker: Sending: " + message) : null;
  } else if (typeof gsocket !== 'undefined' && gsocket.readyState === WebSocket.OPEN) {
    gsocket.send(message);
    message.length < 100 ? console.log("Fallback: Sending: " + message) : null;
  };
};

export function wsiReconnect() {
  if (useSharedWorker) {
    wsworker.port.postMessage({
      command: 'reconnect',
      url: websocketUrl
    });
  } else if (gsocket && gsocket.readyState === WebSocket.OPEN) {
    removeWS();
    initiateWebsocketFallback();
  };
};