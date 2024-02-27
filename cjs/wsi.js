import setupWsiSearch from './search.js';
import setupWsiFileUpload from './filespro.js';
import setupWsiChat from './chat.js';


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
      console.log('WebSocket is open');
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
    case 'onclose':
      console.log('WebSocket is closed');
      break;
    case 'onerror':
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

const websocketUrl = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') +
  window.location.host + '/wsi/';
let wsworker;
let gsocket;
let useSharedWorker = !!window.SharedWorker; // is supported

export function wsiOpenSharedSocket() {
  if (typeof wsworker === 'undefined') {
    console.log("Opening web socket")
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
    };
    window.addEventListener('beforeunload', function() {
      if (useSharedWorker) {
        wsworker.port.postMessage({
          command: 'removePort'
        });
      } else {
        gsocket.close();
      };
    });
  };
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
  if (useSharedWorker) {
    wsworker.port.postMessage({
      command: 'send',
      message: message
    });
  } else if (gsocket && gsocket.readyState === WebSocket.OPEN) {
    gsocket.send(message);
  };
  message.length < 100 ? console.log("WSI Sending: " + message) : null;
};

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
  };
};