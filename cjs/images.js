const canvas = document.getElementById("image_viewer_canvas")
let ctx = canvas.getContext('2d')
const SCROLL_SENSITIVITY = 0.0005
let canvas_width, canvas_height, canvas2X, canvas2Y, img2X, img2Y;
let camera
let scaleZ, MAX_SCALE, MIN_SCALE
let limitingDimensionIsX

var img = new Image;
if (protectedUri) {
  img.src = protectedUri;
}
img.onload = function() {
  img2X = img.width / 2;
  img2Y = img.height / 2;

  // wait a bit for the canvas
  setTimeout(function() {
    updateCanvasVariables();
    canvas.addEventListener('mousedown', onPointerDown)
    canvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown))
    window.addEventListener('mouseup', onPointerUp)
    canvas.addEventListener('touchend', (e) => handleTouch(e, onPointerUp))
    canvas.addEventListener('mousemove', onPointerMove)
    canvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove))
    canvas.addEventListener('wheel', (e) => adjustZoom(e.deltaY * SCROLL_SENSITIVITY))
    draw()
  }, 0); // Delay in milliseconds 
}

function updateCanvasVariables() {
  canvas_width = canvas.offsetWidth;
  canvas_height = canvas.offsetHeight;
  canvas2X = canvas_width / 2
  canvas2Y = canvas_height / 2
  camera = {
    x: canvas2X,
    y: canvas2Y
  }
  limitingDimensionIsX = canvas_width / img.width < canvas_height / img.height ? true : false;
  scaleZ = limitingDimensionIsX ? canvas_width / img.width : canvas_height / img.height;
  MAX_SCALE = scaleZ * 20
  MIN_SCALE = scaleZ
    // Fill the canvas with the red color

}

window.addEventListener('resize', function(event) {
  updateCanvasVariables()
});

function draw() {
  canvas.width = canvas_width
  canvas.height = canvas_height
  limitcamera()
  ctx.fillStyle = 'rgb(145, 145, 145)'; // background color
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
  ctx.translate(canvas2X, canvas2Y)
  ctx.scale(scaleZ, scaleZ)
  ctx.translate(-canvas2X + camera.x, -canvas2Y + camera.y)
  ctx.drawImage(img, -img2X, -img2Y);
  setTimeout(function() {
    requestAnimationFrame(draw);
  }, 50); // Delay in milliseconds
}

//  custom limit camera off image edges
function limitcamera(e) {
  if (!limitingDimensionIsX && img.width * scaleZ < canvas.width) {
    camera.x = Math.min(camera.x, canvas2X + (canvas2X / scaleZ - img2X))
    camera.x = Math.max(camera.x, canvas2X - (canvas2X / scaleZ - img2X))
    camera.y = Math.min(camera.y, canvas2Y - (canvas2Y / scaleZ - img2Y))
    camera.y = Math.max(camera.y, canvas2Y + (canvas2Y / scaleZ - img2Y))
  } else if (limitingDimensionIsX && img.height * scaleZ < canvas.height) {
    camera.x = Math.min(camera.x, canvas2X - (canvas2X / scaleZ - img2X))
    camera.x = Math.max(camera.x, canvas2X + (canvas2X / scaleZ - img2X))
    camera.y = Math.min(camera.y, canvas2Y + (canvas2Y / scaleZ - img2Y))
    camera.y = Math.max(camera.y, canvas2Y - (canvas2Y / scaleZ - img2Y))
  } else {
    camera.x = Math.min(camera.x, canvas2X - (canvas2X / scaleZ - img2X))
    camera.x = Math.max(camera.x, canvas2X + (canvas2X / scaleZ - img2X))
    camera.y = Math.min(camera.y, canvas2Y - (canvas2Y / scaleZ - img2Y))
    camera.y = Math.max(camera.y, canvas2Y + (canvas2Y / scaleZ - img2Y))
  }
}

// Gets the relevant location from a mouse or single touch event
function getEventLocation(e) {
  if (e.touches && e.touches.length == 1) {
    return {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    }
  } else if (e.clientX && e.clientY) {
    return {
      x: e.clientX,
      y: e.clientY
    }
  }
}

let isDragging = false
let dragStart = {
  x: 0,
  y: 0
}

function onPointerDown(e) {
  isDragging = true
  dragStart.x = getEventLocation(e).x / scaleZ - camera.x
  dragStart.y = getEventLocation(e).y / scaleZ - camera.y
}

function onPointerUp(e) {
  isDragging = false
  initialPinchDistance = null
  lastZoom = scaleZ
}

function onPointerMove(e) {
  if (isDragging) {
    camera.x = getEventLocation(e).x / scaleZ - dragStart.x
    camera.y = getEventLocation(e).y / scaleZ - dragStart.y
  }
}

function handleTouch(e, singleTouchHandler) {
  if (e.touches.length <= 1) // 1 fingers or 0 at touchend
  {
    singleTouchHandler(e)
  } else if (e.type == "touchmove" && e.touches.length == 2) {
    isDragging = false
    handlePinch(e)
  }
}

let initialPinchDistance = null
let lastZoom = scaleZ

function handlePinch(e) {
  e.preventDefault()

  let touch1 = {
    x: e.touches[0].clientX,
    y: e.touches[0].clientY
  }
  let touch2 = {
    x: e.touches[1].clientX,
    y: e.touches[1].clientY
  }

  // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
  let currentDistance = (touch1.x - touch2.x) ** 2 + (touch1.y - touch2.y) ** 2

  if (initialPinchDistance == null) {
    initialPinchDistance = currentDistance
  } else {
    adjustZoom(null, currentDistance / initialPinchDistance)
  }
}

function adjustZoom(zoomAmount, zoomFactor) {
  if (!isDragging) {
    if (zoomAmount) {
      scaleZ -= scaleZ * zoomAmount
      lastZoom = scaleZ
    } else if (zoomFactor) {
      scaleZ = zoomFactor * lastZoom
    }

    scaleZ = Math.min(scaleZ, MAX_SCALE)
    scaleZ = Math.max(scaleZ, MIN_SCALE)

  }
}

const imageViewerCanvasContainer = document.getElementById("image_viewer_canvas_container");

function preventScroll(e) {
  e.preventDefault();
}
canvas.addEventListener("mouseover", function(event) {
  imageViewerCanvasContainer.addEventListener('wheel', preventScroll, { passive: false });
}, false);
canvas.addEventListener("mouseleave", function(event) {
  imageViewerCanvasContainer.removeEventListener('wheel', preventScroll, { passive: false });
}, false);
canvas.addEventListener("touchstart", function(event) {
  imageViewerCanvasContainer.addEventListener('touchmove', preventScroll, { passive: false });
}, false);
canvas.addEventListener("touchend", function(event) {
  imageViewerCanvasContainer.removeEventListener('touchmove', preventScroll, { passive: false });
}, false);

const imageViewerFileRealInput = document.getElementById('imageViewerFileRealInput');
const imageViewerFileChooseBtn = document.getElementById('imageViewerFileChooseBtn');
const imageViewerFileChoiceTxt = document.getElementById('imageViewerFileChoiceTxt');
const imageViewerFileSaveBtn = document.getElementById('imageViewerFileSaveBtn');
const imageViewerInitialImage = document.getElementById('image_viewer_initial_image');

imageViewerFileChooseBtn.addEventListener('click', function() {
  imageViewerFileRealInput.click();
});

imageViewerFileRealInput.onchange = function(e) {
  let file = e.target.files[0];
  if (file.type.startsWith('image/')) {
    img.src = URL.createObjectURL(file);
    imageViewerFileSaveBtn.disabled = false;
    imageViewerInitialImage.remove();
  } else {
    if (document.documentElement.lang == "fr") {
      imageViewerFileChoiceTxt.innerHTML = '\u26A0' + ' Ne correspond pas à une image.';
    } else {
      imageViewerFileChoiceTxt.innerHTML = '\u26A0' + ' Does not correspond to an image.';
    }
  }
};

imageViewerFileSaveBtn.addEventListener('click', function() {
  var imgsrc = canvas.toDataURL("image/png");
  var blob = dataURLtoBlob(imgsrc);
  var file = new File([blob], 'my_avatar.png', {
    type: "image/png",
    lastModified: new Date()
  });
  // console.log(file.size);
  // send image file to server with fetch
  csrf_token = $('input[name="csrfmiddlewaretoken"]').val();
  let formData = new FormData();
  formData.append('file', file);
  formData.append("csrfmiddlewaretoken", csrf_token);
  fetch(imageSaveUri, {
      method: 'POST',
      body: formData,
    }).then(response => response.json())
    .then(response => {
      console.log(response)
    })
});

// to transform a dataURL to a blob (no need to understand in detail)
function dataURLtoBlob(dataurl) {
  var arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {
    type: mime
  });
}


/////////////////////////////////////////////////////////////////////////////////
//
/////////////////////////////////////////////////////////////////////////////////