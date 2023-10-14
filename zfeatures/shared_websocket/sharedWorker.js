let wsocket;
let ports = [];

self.onconnect = function(e) {
  let port = e.ports[0];

  ports.push(port);
  console.log('New port connected:', ports.length, 'ports now connected');

  port.onmessage = function(e) {
      if (e.data.command === 'connect') {
        connect(e.data.url);
      } else if (e.data.command === 'send') {
        send(e.data.message);
      } else if (e.data.command === 'reconnect') {
        wsocket.close();
        wsocket = null;
        connect(e.data.url);
      } else if (e.data.command === 'removePort') {
        setTimeout(function() {
          removePort(port);
        }, 3000);
        a = 1;
      }
    }
    // for when closing a tab, the port of that tab gets removed from the list
  function removePort(port) {
    let index = ports.indexOf(port);
    if (index !== -1) {
      ports.splice(index, 1);
      console.log('Port disconnected. Total ports:', ports.length);
    }
  }

  function connect(url) {
    wsocket = new WebSocket(url);

    wsocket.onopen = function() {
      broadcast({ type: 'open' });
    };

    wsocket.onmessage = function(e) {
      broadcast({ type: 'message', data: e.data });
    };

    wsocket.onerror = function() {
      broadcast({ type: 'error' });
    };

    wsocket.onclose = function() {
      broadcast({ type: 'close' });
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