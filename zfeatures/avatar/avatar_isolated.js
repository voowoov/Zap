let canvas_dimension = 235
let canvas_width = canvas_dimension
let canvas_height = canvas_dimension
let canvasOffsetX = canvas_width/2
let canvasOffsetY = canvas_height/2
let canvas = document.getElementById("canvasAvatarSelection")
let ctx = canvas.getContext('2d')
let cameraOffset = { x: canvasOffsetX, y: canvasOffsetY }
let cameraZoom = 1
let MAX_ZOOM
let MIN_ZOOM
let SCROLL_SENSITIVITY = 0.0005

let buttonSubmitAvatar = document.getElementById("buttonSubmitAvatar")
let buttonSubmitAvatar2 = document.getElementById("buttonSubmitAvatar2")
let initialAvatarSVG = document.getElementById("initialAvatarSVG")

var input = document.getElementById('inputImgFileAvatar');
var img = new Image;
input.addEventListener('change', handleFiles);  
let imgoffsetX, imgoffsetY;
function handleFiles(e) {
  img.src = URL.createObjectURL(e.target.files[0]);
  img.onload = function() {
    buttonSubmitAvatar.disabled = false;
    buttonSubmitAvatar2.disabled = false;
    initialAvatarSVG.remove();
    imgoffsetX=-img.width/2;
    imgoffsetY=-img.height/2;
    max_img_dimension = Math.max(img.width, img.height);
    cameraZoom = canvas_dimension/max_img_dimension;
    MAX_ZOOM = cameraZoom*20
    MIN_ZOOM = cameraZoom
    canvas.addEventListener('mousedown', onPointerDown)
    canvas.addEventListener('touchstart', (e) => handleTouch(e, onPointerDown))
    window.addEventListener('mouseup', onPointerUp)
    canvas.addEventListener('touchend',  (e) => handleTouch(e, onPointerUp))
    canvas.addEventListener('mousemove', onPointerMove)
    canvas.addEventListener('touchmove', (e) => handleTouch(e, onPointerMove))
    canvas.addEventListener('wheel', (e) => adjustZoom(e.deltaY*SCROLL_SENSITIVITY))
    // Ready, set, go
    draw()
  }
}

// var img = new Image;
// img.src = "https://akm-img-a-in.tosshub.com/indiatoday/images/story/202105/Capture_27_1200x768.png?size=690:388";

function draw()
{
  canvas.width = canvas_width
  canvas.height = canvas_height

  limitCameraOffset()
  // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
  ctx.translate( canvasOffsetX, canvasOffsetY )
  ctx.scale(cameraZoom, cameraZoom)
  // console.log(cameraZoom)
  ctx.translate( -canvasOffsetX + cameraOffset.x, -canvasOffsetY + cameraOffset.y )
  ctx.clearRect(0,0, canvas.width, canvas.height)
  ctx.drawImage(img, imgoffsetX, imgoffsetY);
  
  requestAnimationFrame( draw )
}

//  custom limit camera off image edges
function limitCameraOffset(e)
{
  cameraOffset.x = Math.min(cameraOffset.x, canvasOffsetX-(canvasOffsetX/cameraZoom-max_img_dimension/2))
  cameraOffset.x = Math.max(cameraOffset.x, canvasOffsetX+(canvasOffsetX/cameraZoom-max_img_dimension/2))
  cameraOffset.y = Math.min(cameraOffset.y, canvasOffsetY-(canvasOffsetY/cameraZoom-max_img_dimension/2))
  cameraOffset.y = Math.max(cameraOffset.y, canvasOffsetY+(canvasOffsetY/cameraZoom-max_img_dimension/2))
}

// Gets the relevant location from a mouse or single touch event
function getEventLocation(e)
{
  if (e.touches && e.touches.length == 1)
  {
    return { x:e.touches[0].clientX, y: e.touches[0].clientY }
  }
  else if (e.clientX && e.clientY)
  {
    return { x: e.clientX, y: e.clientY }        
  }
}

let isDragging = false
let dragStart = { x: 0, y: 0 }

function onPointerDown(e)
{
  isDragging = true
  dragStart.x = getEventLocation(e).x/cameraZoom - cameraOffset.x
  dragStart.y = getEventLocation(e).y/cameraZoom - cameraOffset.y
}

function onPointerUp(e)
{
  isDragging = false
  initialPinchDistance = null
  lastZoom = cameraZoom
}

function onPointerMove(e)
{
  if (isDragging)
  {
    cameraOffset.x = getEventLocation(e).x/cameraZoom - dragStart.x
    cameraOffset.y = getEventLocation(e).y/cameraZoom - dragStart.y
  }
}

function handleTouch(e, singleTouchHandler)
{
  if ( e.touches.length <= 1) // 1 fingers or 0 at touchend
  {
    singleTouchHandler(e)
  }
  else if (e.type == "touchmove" && e.touches.length == 2)
  {
    isDragging = false
    handlePinch(e)
  }
}

let initialPinchDistance = null
let lastZoom = cameraZoom

function handlePinch(e)
{
  e.preventDefault()
  
  let touch1 = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  let touch2 = { x: e.touches[1].clientX, y: e.touches[1].clientY }
  
  // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
  let currentDistance = (touch1.x - touch2.x)**2 + (touch1.y - touch2.y)**2
  
  if (initialPinchDistance == null)
  {
    initialPinchDistance = currentDistance
  }
  else
  {
    adjustZoom( null, currentDistance/initialPinchDistance )
  }
}

function adjustZoom(zoomAmount, zoomFactor)
{
  if (!isDragging)
  {
    if (zoomAmount)
    {
      cameraZoom -= cameraZoom*zoomAmount
      lastZoom = cameraZoom
    }
    else if (zoomFactor)
    {
      cameraZoom = zoomFactor*lastZoom
    }
    
    cameraZoom = Math.min( cameraZoom, MAX_ZOOM )
    cameraZoom = Math.max( cameraZoom, MIN_ZOOM )

  }
}

// Prevent body scrolling (overflow) when mouse cursor is inside the canvas
let body_element=document.getElementById("bodyAvatarSelection")
canvas.addEventListener("mouseleave", function (event) {
  body_element.classList.remove("stop-scrolling");
}, false);
canvas.addEventListener("mouseover", function (event) {
  body_element.classList.add("stop-scrolling");
}, false);

// Get result avatar image before sending the Form to the server
function save_image() {
  let avatarImgRes = document.getElementById("avatarImgRes")
  var imgsrc = canvas.toDataURL("avatar_img_res/bitmap");
  avatarImgRes.src = imgsrc
  let avatar_img_form_input = document.getElementById("avatarImgFormInput")
  // buttonSubmitAvatar.disabled = true; // prevent double click on button
  // avatar_img_form_input.src = imgsrc
}
