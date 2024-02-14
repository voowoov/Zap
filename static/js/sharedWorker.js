/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../cjs/sharedWorker.js":
/*!******************************!*\
  !*** ../cjs/sharedWorker.js ***!
  \******************************/
/***/ (() => {

eval("let wsocket;\r\nlet ports = [];\r\n\r\nself.onconnect = function(e) {\r\n  let port = e.ports[0];\r\n\r\n  ports.push(port);\r\n  console.log('New port connected:', ports.length, 'ports now connected');\r\n\r\n  port.onmessage = function(e) {\r\n    if (e.data.command === 'connect') {\r\n      if (typeof wsocket === 'undefined') {\r\n        connect(e.data.url);\r\n      } else if (wsocket.readyState === WebSocket.CLOSED) {\r\n        connect(e.data.url);\r\n      };\r\n    } else if (e.data.command === 'send') {\r\n      send(e.data.message);\r\n    } else if (e.data.command === 'reconnect') {\r\n      wsocket.close();\r\n      wsocket = null;\r\n      connect(e.data.url);\r\n    } else if (e.data.command === 'removePort') {\r\n      let index = ports.indexOf(port);\r\n      if (index !== -1) {\r\n        ports.splice(index, 1);\r\n        console.log('Port disconnected. Total ports:', ports.length);\r\n      };\r\n      if (ports.length === 0) {\r\n        wsocket.close();\r\n      };\r\n    };\r\n  };\r\n\r\n  function connect(url) {\r\n    wsocket = new WebSocket(url);\r\n\r\n    wsocket.onopen = function() {\r\n      broadcast({ type: 'onopen' });\r\n    };\r\n\r\n    wsocket.onmessage = function(e) {\r\n      broadcast({ type: 'onmessage', data: e.data });\r\n    };\r\n\r\n    wsocket.onerror = function() {\r\n      broadcast({ type: 'onerror' });\r\n    };\r\n\r\n    wsocket.onclose = function() {\r\n      broadcast({ type: 'onclose' });\r\n    };\r\n  };\r\n\r\n  function send(message) {\r\n    if (wsocket && wsocket.readyState === WebSocket.OPEN) {\r\n      wsocket.send(message);\r\n    };\r\n  };\r\n\r\n  function broadcast(message) {\r\n    ports.forEach(function(port) {\r\n      port.postMessage(message);\r\n    });\r\n  };\r\n};\n\n//# sourceURL=webpack://zap/../cjs/sharedWorker.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["../cjs/sharedWorker.js"]();
/******/ 	
/******/ })()
;