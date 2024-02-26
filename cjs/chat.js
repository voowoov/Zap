window.addEventListener('resize', function() {
  // If the height of the viewport is reduced, the keyboard is probably visible
  var isKeyboardVisible = window.innerHeight < window.outerHeight;
});

console.log(navigator.userAgent)

console.log(window.devicePixelRatio)

var deviceWidth = screen.width * window.devicePixelRatio;
var deviceHeight = screen.height * window.devicePixelRatio;

console.log(window.devicePixelRatio, deviceWidth, deviceHeight)