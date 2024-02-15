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

/***/ "../cjs/images.js":
/*!************************!*\
  !*** ../cjs/images.js ***!
  \************************/
/***/ (() => {

eval("/////////////////////////////////////////////////////////////////////////////////\r\n//  ImageViewer\r\n/////////////////////////////////////////////////////////////////////////////////\r\n(function() {\r\n  const canvas = document.querySelector('.image_viewer_canvas');\r\n  if (canvas) {\r\n    let ctx = canvas.getContext('2d');\r\n    const SCROLL_SENSITIVITY = 0.0005;\r\n    let canvas_width, canvas_height, canvas2X, canvas2Y, img2X, img2Y;\r\n    let camera;\r\n    let scaleZ, MAX_SCALE, MIN_SCALE;\r\n    let limitingDimensionIsX;\r\n\r\n    let img = new Image;\r\n    if (protectedUri) {\r\n      img.src = protectedUri;\r\n    }\r\n    img.onload = function() {\r\n      img2X = img.width / 2;\r\n      img2Y = img.height / 2;\r\n\r\n      // wait a bit for the canvas\r\n      setTimeout(function() {\r\n        updateCanvasVariables();\r\n        canvas.addEventListener('mousedown', onPointerDown);\r\n        canvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown));\r\n        window.addEventListener('mouseup', onPointerUp);\r\n        canvas.addEventListener('touchend', (e) => handleTouch(e, onPointerUp));\r\n        canvas.addEventListener('mousemove', onPointerMove);\r\n        canvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove));\r\n        canvas.addEventListener('wheel', (e) => adjustZoom(e.deltaY * SCROLL_SENSITIVITY));\r\n        draw();\r\n      }, 0); // Delay in milliseconds \r\n    };\r\n\r\n    function updateCanvasVariables() {\r\n      canvas_width = canvas.offsetWidth;\r\n      canvas_height = canvas.offsetHeight;\r\n      canvas2X = canvas_width / 2;\r\n      canvas2Y = canvas_height / 2;\r\n      camera = {\r\n        x: canvas2X,\r\n        y: canvas2Y\r\n      };\r\n      limitingDimensionIsX = canvas_width / img.width < canvas_height / img.height ? true : false;\r\n      scaleZ = limitingDimensionIsX ? canvas_width / img.width : canvas_height / img.height;\r\n      MAX_SCALE = scaleZ * 20;\r\n      MIN_SCALE = scaleZ;\r\n      // Fill the canvas with the red color\r\n\r\n    }\r\n\r\n    window.addEventListener('resize', function(event) {\r\n      updateCanvasVariables();\r\n    });\r\n\r\n    function draw() {\r\n      canvas.width = canvas_width;\r\n      canvas.height = canvas_height;\r\n      limitcamera();\r\n      ctx.fillStyle = 'rgb(145, 145, 145)'; // background color\r\n      ctx.fillRect(0, 0, canvas.width, canvas.height);\r\n      // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at\r\n      ctx.translate(canvas2X, canvas2Y);\r\n      ctx.scale(scaleZ, scaleZ);\r\n      ctx.translate(-canvas2X + camera.x, -canvas2Y + camera.y);\r\n      ctx.drawImage(img, -img2X, -img2Y);\r\n      setTimeout(function() {\r\n        requestAnimationFrame(draw);\r\n      }, 50); // Delay in milliseconds\r\n    };\r\n\r\n    //  custom limit camera off image edges\r\n    function limitcamera(e) {\r\n      if (!limitingDimensionIsX && img.width * scaleZ < canvas.width) {\r\n        camera.x = Math.min(camera.x, canvas2X + (canvas2X / scaleZ - img2X));\r\n        camera.x = Math.max(camera.x, canvas2X - (canvas2X / scaleZ - img2X));\r\n        camera.y = Math.min(camera.y, canvas2Y - (canvas2Y / scaleZ - img2Y));\r\n        camera.y = Math.max(camera.y, canvas2Y + (canvas2Y / scaleZ - img2Y));\r\n      } else if (limitingDimensionIsX && img.height * scaleZ < canvas.height) {\r\n        camera.x = Math.min(camera.x, canvas2X - (canvas2X / scaleZ - img2X));\r\n        camera.x = Math.max(camera.x, canvas2X + (canvas2X / scaleZ - img2X));\r\n        camera.y = Math.min(camera.y, canvas2Y + (canvas2Y / scaleZ - img2Y));\r\n        camera.y = Math.max(camera.y, canvas2Y - (canvas2Y / scaleZ - img2Y));\r\n      } else {\r\n        camera.x = Math.min(camera.x, canvas2X - (canvas2X / scaleZ - img2X));\r\n        camera.x = Math.max(camera.x, canvas2X + (canvas2X / scaleZ - img2X));\r\n        camera.y = Math.min(camera.y, canvas2Y - (canvas2Y / scaleZ - img2Y));\r\n        camera.y = Math.max(camera.y, canvas2Y + (canvas2Y / scaleZ - img2Y));\r\n      };\r\n    };\r\n\r\n    // Gets the relevant location from a mouse or single touch event\r\n    function getEventLocation(e) {\r\n      if (e.touches && e.touches.length == 1) {\r\n        return {\r\n          x: e.touches[0].clientX,\r\n          y: e.touches[0].clientY\r\n        };\r\n      } else if (e.clientX && e.clientY) {\r\n        return {\r\n          x: e.clientX,\r\n          y: e.clientY\r\n        };\r\n      };\r\n    };\r\n\r\n    let isDragging = false;\r\n    let dragStart = {\r\n      x: 0,\r\n      y: 0\r\n    };\r\n\r\n    function onPointerDown(e) {\r\n      isDragging = true;\r\n      dragStart.x = getEventLocation(e).x / scaleZ - camera.x;\r\n      dragStart.y = getEventLocation(e).y / scaleZ - camera.y;\r\n    };\r\n\r\n    function onPointerUp(e) {\r\n      isDragging = false;\r\n      initialPinchDistance = null;\r\n      lastZoom = scaleZ;\r\n    };\r\n\r\n    function onPointerMove(e) {\r\n      if (isDragging) {\r\n        camera.x = getEventLocation(e).x / scaleZ - dragStart.x;\r\n        camera.y = getEventLocation(e).y / scaleZ - dragStart.y;\r\n      };\r\n    };\r\n\r\n    function handleTouch(e, singleTouchHandler) {\r\n      if (e.touches.length <= 1) // 1 fingers or 0 at touchend\r\n      {\r\n        singleTouchHandler(e);\r\n      } else if (e.type == \"touchmove\" && e.touches.length == 2) {\r\n        isDragging = false;\r\n        handlePinch(e);\r\n      };\r\n    };\r\n\r\n    let initialPinchDistance = null;\r\n    let lastZoom = scaleZ;\r\n\r\n    function handlePinch(e) {\r\n      e.preventDefault();\r\n\r\n      let touch1 = {\r\n        x: e.touches[0].clientX,\r\n        y: e.touches[0].clientY\r\n      };\r\n      let touch2 = {\r\n        x: e.touches[1].clientX,\r\n        y: e.touches[1].clientY\r\n      };\r\n\r\n      // This is distance squared, but no need for an expensive sqrt as it's only used in ratio\r\n      let currentDistance = (touch1.x - touch2.x) ** 2 + (touch1.y - touch2.y) ** 2;\r\n\r\n      if (initialPinchDistance == null) {\r\n        initialPinchDistance = currentDistance;\r\n      } else {\r\n        adjustZoom(null, currentDistance / initialPinchDistance);\r\n      }\r\n    }\r\n\r\n    function adjustZoom(zoomAmount, zoomFactor) {\r\n      if (!isDragging) {\r\n        if (zoomAmount) {\r\n          scaleZ -= scaleZ * zoomAmount;\r\n          lastZoom = scaleZ;\r\n        } else if (zoomFactor) {\r\n          scaleZ = zoomFactor * lastZoom;\r\n        };\r\n        scaleZ = Math.min(scaleZ, MAX_SCALE);\r\n        scaleZ = Math.max(scaleZ, MIN_SCALE);\r\n      };\r\n    };\r\n\r\n    const imageViewerCanvasContainer = document.querySelector('.image_viewer_canvas_container');\r\n\r\n    function preventScroll(e) {\r\n      e.preventDefault();\r\n    }\r\n    canvas.addEventListener(\"mouseover\", function(event) {\r\n      imageViewerCanvasContainer.addEventListener('wheel', preventScroll, { passive: false });\r\n    }, false);\r\n    canvas.addEventListener(\"mouseleave\", function(event) {\r\n      imageViewerCanvasContainer.removeEventListener('wheel', preventScroll, { passive: false });\r\n    }, false);\r\n    canvas.addEventListener(\"touchstart\", function(event) {\r\n      imageViewerCanvasContainer.addEventListener('touchmove', preventScroll, { passive: false });\r\n    }, false);\r\n    canvas.addEventListener(\"touchend\", function(event) {\r\n      imageViewerCanvasContainer.removeEventListener('touchmove', preventScroll, { passive: false });\r\n    }, false);\r\n\r\n\r\n    /////////////////////////////////////////////////////////////////////////////////\r\n    //  Avatar functions\r\n    /////////////////////////////////////////////////////////////////////////////////\r\n    const imageViewerFileChooseBtn = document.querySelector('.imageViewerFileChooseBtn');\r\n\r\n    if (imageViewerFileChooseBtn) {\r\n\r\n      const fileUploadSendAvatarBtn = document.querySelector('.fileUploadSendAvatarBtn');\r\n      const imageViewerFileChooseBtn = document.querySelector('.imageViewerFileChooseBtn');\r\n      const imageViewerFileRealInput = document.querySelector('.imageViewerFileRealInput');\r\n      const fileUploadLogTxt = document.querySelector('.fileUploadLogTxt');\r\n      const imageViewerInitialImage = document.querySelector('.imageViewerInitialImage');\r\n\r\n      imageViewerFileChooseBtn.addEventListener('click', function() {\r\n        imageViewerFileRealInput.click();\r\n      });\r\n\r\n      imageViewerFileRealInput.onchange = function(e) {\r\n        let file = e.target.files[0];\r\n        if (file.type.startsWith('image/')) {\r\n          img.src = URL.createObjectURL(file);\r\n          imageViewerInitialImage.hidden = true;\r\n          fileUploadSendAvatarBtn.disabled = false;\r\n          if (document.documentElement.lang == \"fr\") {\r\n            fileUploadLogTxt.innerHTML = '\\uD83E\\uDD1A' + ' Centrer et zoomer votre avatar.';\r\n          } else {\r\n            fileUploadLogTxt.innerHTML = '\\uD83E\\uDD1A' + ' Center and scale your avatar.';\r\n          };\r\n        };\r\n      };\r\n    };\r\n  };\r\n})();\n\n//# sourceURL=webpack://zap/../cjs/images.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["../cjs/images.js"]();
/******/ 	
/******/ })()
;