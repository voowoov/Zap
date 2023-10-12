let wsocket;

self.onconnect = function(e) {
  let port = e.ports[0];

  port.onmessage = function(e) {
    if (e.data.command === 'connect') {
      connect(e.data.url);
    } else if (e.data.command === 'send') {
      send(e.data.message);
    }
  }

  function connect(url) {
    wsocket = new WebSocket(url);

    wsocket.onopen = function() {
      port.postMessage({ type: 'open' });
    };

    wsocket.onmessage = function(e) {
      port.postMessage({ type: 'message', data: e.data });
    };

    wsocket.onerror = function() {
      port.postMessage({ type: 'error' });
    };

    wsocket.onclose = function() {
      port.postMessage({ type: 'close' });
    };
  }

  function send(message) {
    if (wsocket && wsocket.readyState === WebSocket.OPEN) {
      wsocket.send(message);
    }
  }
}