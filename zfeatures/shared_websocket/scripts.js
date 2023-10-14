/////////////////////////////////////////////////////////////////////////////////
//    Shared worker websocket
/////////////////////////////////////////////////////////////////////////////////

// get the next wsTabId in storage, single character
var wsTabId = localStorage.getItem('wsTabId');
if (wsTabId !== null) {
  nextTabId = wsTabId.charCodeAt(0) + 1;
  //   33; // '!' to  126; // '~'
  if (nextTabId > 126) {
    nextTabId = 33;
  }
  localStorage.setItem('wsTabId', String.fromCharCode(nextTabId));
} else {
  wsTabId = String.fromCharCode(33);
  localStorage.setItem('wsTabId', wsTabId);
}


const websocketUrl = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') +
  window.location.host + '/' +
  pageLanguage + '/ws/debo/';
let wsworker;
let gsocket;
let useSharedWorker = !!window.SharedWorker; // is supported

if (useSharedWorker) {
  wsworker = new SharedWorker('/static/js/sharedWorker.js');

  wsworker.port.onmessage = function(e) {
    handleWsEvent(e.data);
  };

  wsworker.port.start();

  wsworker.port.postMessage({ command: 'connect', url: websocketUrl });
} else {
  initiateWebsocketFallback();
}

function initiateWebsocketFallback() {
  gsocket = new WebSocket(websocketUrl);

  gsocket.onopen = function() {
    handleWsEvent({ type: 'open' });
  };

  gsocket.onmessage = function(e) {
    handleWsEvent({ type: 'message', data: e.data });
  };

  gsocket.onerror = function() {
    handleWsEvent({ type: 'error' });
  };

  gsocket.onclose = function() {
    handleWsEvent({ type: 'close' });
  };
}

function wsSend(message) {
  if (useSharedWorker) {
    wsworker.port.postMessage({ command: 'send', message: message });
  } else if (gsocket && gsocket.readyState === WebSocket.OPEN) {
    gsocket.send(message);
  }
}

function wsReconnect() {
  if (useSharedWorker) {
    wsworker.port.postMessage({ command: 'reconnect', url: websocketUrl });
  } else if (gsocket && gsocket.readyState === WebSocket.OPEN) {
    gsocket.close();
    gsocket = null;
    initiateWebsocketFallback();
  }
}

function handleWsEvent(event) {
  switch (event.type) {
    case 'message':
      console.log('Received message:', event.data);
      break;
    case 'open':
      console.log('WebSocket is open');
      break;
    case 'close':
      console.log('WebSocket is closed');
      break;
    case 'error':
      console.log('WebSocket encountered an error');
      break;
  }
}
window.addEventListener('beforeunload', function() {
  if (useSharedWorker) {
    wsworker.port.postMessage({ command: 'removePort' });

  }
});