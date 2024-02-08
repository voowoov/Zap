let wsocket;
let ports = [];

self.onconnect = function(e) {
  let port = e.ports[0];

  ports.push(port);
  console.log('New port connected:', ports.length, 'ports now connected');

  port.onmessage = function(e) {
    if (e.data.command === 'connect') {
      if (typeof wsocket === 'undefined') {
        connect(e.data.url);
      } else if (wsocket.readyState === WebSocket.CLOSED) {
        connect(e.data.url);
      }
    } else if (e.data.command === 'send') {
      send(e.data.message);
    } else if (e.data.command === 'reconnect') {
      wsocket.close();
      wsocket = null;
      connect(e.data.url);
    } else if (e.data.command === 'removePort') {
      let index = ports.indexOf(port);
      if (index !== -1) {
        ports.splice(index, 1);
        console.log('Port disconnected. Total ports:', ports.length);
      }
      if (ports.length === 0) {
        wsocket.close();
      }
    }
  }

  function connect(url) {
    wsocket = new WebSocket(url);

    wsocket.onopen = function() {
      broadcast({ type: 'onopen' });
    };

    wsocket.onmessage = function(e) {
      broadcast({ type: 'onmessage', data: e.data });
    };

    wsocket.onerror = function() {
      broadcast({ type: 'onerror' });
    };

    wsocket.onclose = function() {
      broadcast({ type: 'onclose' });
    };
  }

  function send(message) {
    if (wsocket && wsocket.readyState === WebSocket.OPEN) {
      wsocket.send(message);
    }
  }

  function broadcast(message) {
    ports.forEach(function(port) {
      port.postMessage(message);
    });
  }
}