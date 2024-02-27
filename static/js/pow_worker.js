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

/***/ "../cjs/pow_worker.js":
/*!****************************!*\
  !*** ../cjs/pow_worker.js ***!
  \****************************/
/***/ (() => {

eval("////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////\r\n// Proof of work\r\n////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////\r\n\r\nimportScripts('https://cdnjs.cloudflare.com/ajax/libs/jsSHA/3.3.1/sha256.min.js');\r\n\r\nself.onmessage = function(event) {\r\n  let difficulty = parseInt(event.data.charAt(0))\r\n  var challenge = event.data.substring(1);\r\n  let firstCharacters = '0'.repeat(difficulty);\r\n  var answer = 0;\r\n  var hash = '';\r\n  do {\r\n    var shaObj = new jsSHA(\"SHA-256\", \"TEXT\");\r\n    shaObj.update(challenge + answer);\r\n    hash = shaObj.getHash(\"HEX\");\r\n    answer++;\r\n  } while (hash.substring(0, difficulty) !== firstCharacters); // Adjust difficulty as needed\r\n  postMessage(answer - 1);\r\n};\n\n//# sourceURL=webpack://zap/../cjs/pow_worker.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["../cjs/pow_worker.js"]();
/******/ 	
/******/ })()
;