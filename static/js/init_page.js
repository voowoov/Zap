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

/***/ "../cjs/init_page.js":
/*!***************************!*\
  !*** ../cjs/init_page.js ***!
  \***************************/
/***/ (() => {

eval("let nC = (m, s) => m.includes(s) ? m.charAt(m.indexOf(s) + s.length) : \"A\";\r\nlet th = nC(document.cookie, \"eme=\");\r\nth = th == \"A\" ? window.matchMedia ? window.matchMedia(\"(prefers-color-scheme: dark)\").matches ? 1 : 0 : 0 : th == \"d\" ? 1 : 0;\r\nif (th) { document.documentElement.setAttribute(\"color_theme\", \"dark\"); };\n\n//# sourceURL=webpack://zap/../cjs/init_page.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["../cjs/init_page.js"]();
/******/ 	
/******/ })()
;