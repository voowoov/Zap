/////////////////////////////////////////////////////////////////////////////////
//  ImageViewer
/////////////////////////////////////////////////////////////////////////////////
(function() {
  var page_url = window.location.href;
  // console.log(page_url, page_url[8]) // this is to disallow stealing for another website
  function is_valid_website() {
    return page_url[8] == "2";
  }
  const canvas = document.querySelector('.image_viewer_canvas');
  if (canvas && is_valid_website()) { // this is to disallow stealing for another website
    let ctx = canvas.getContext('2d', { willReadFrequently: true });
    const SCROLL_SENSITIVITY = 0.0005;
    let canvas_width, canvas_height, canvas2X, canvas2Y, img2X, img2Y;
    let rect;
    let camera;
    let scaleZ, MAX_SCALE, MIN_SCALE;
    let limitingDimensionIsX;
    let canvasTop = document.createElement('canvas');
    canvasTop.style.backgroundColor = 'transparent';
    canvasTop.style.pointerEvents = 'none';
    canvasTop.style.position = 'absolute';
    canvas.parentNode.appendChild(canvasTop);
    let ctx2 = canvasTop.getContext('2d');

    let img = new Image;
    if (protectedUri) {
      img.src = protectedUri;
    }
    img.onload = function() {
      img2X = img.width / 2;
      img2Y = img.height / 2;
      updateCanvasVariables();
      canvas.addEventListener('mousedown', onPointerDown);
      canvas.addEventListener('touchstart', onPointerDown);
      window.addEventListener('mouseup', onPointerUp);
      canvas.addEventListener('touchend', onPointerUp);
      canvas.addEventListener('mousemove', onPointerMove);
      canvas.addEventListener('touchmove', onPointerMove);
      canvas.addEventListener('wheel', onWheel);
      canvas.addEventListener('contextmenu', event => event.preventDefault());
      requestAnimationFrame(draw);
      initImageInfo();
    };

    function updateCanvasVariables() {
      canvas_width = canvas.offsetWidth;
      canvas_height = canvas.offsetHeight;

      canvasTop.width = canvas_width;
      canvasTop.height = canvas_height;
      canvasTop.style.top = canvas.offsetTop + 'px';
      canvasTop.style.left = canvas.offsetLeft + 'px';

      rect = canvas.getBoundingClientRect();
      canvas2X = canvas_width / 2;
      canvas2Y = canvas_height / 2;
      camera = {
        x: canvas2X,
        y: canvas2Y
      };
      limitingDimensionIsX = canvas_width / img.width < canvas_height / img.height ? true : false;
      scaleZ = limitingDimensionIsX ? canvas_width / img.width : canvas_height / img.height;
      MAX_SCALE = scaleZ * 20;
      MIN_SCALE = scaleZ * 0.75;
      scaleZ = scaleZ * .9;
    }

    window.addEventListener('resize', function(event) {
      updateCanvasVariables();
      requestAnimationFrame(draw);
    });

    function draw() {
      canvas.width = canvas_width;
      canvas.height = canvas_height;
      limitcamera();
      ctx.fillStyle = 'rgb(145, 145, 145)'; // background color
      ctx.fillRect(0, 0, canvas_width, canvas_height);
      // Translate to the canvas centre before zooming - so you'll always zoom on what you're looking directly at
      ctx.translate(canvas2X, canvas2Y);
      ctx.scale(scaleZ, scaleZ);
      ctx.translate(-canvas2X + camera.x, -canvas2Y + camera.y);
      ctx.drawImage(img, -img2X, -img2Y);

      ctx2.fillRect(0, 0, canvas_width, canvas_height);
      ctx2.translate(canvas2X, canvas2Y);
      ctx2.scale(scaleZ, scaleZ);
      ctx2.translate(-canvas2X + camera.x, -canvas2Y + camera.y);
      update_top_canvas();

    };

    //  custom limit camera off image edges
    function limitcamera(e) {
      camera.x = Math.max(camera.x, canvas2X - (canvas2X / scaleZ + img2X - 10));
      camera.x = Math.min(camera.x, canvas2X + (canvas2X / scaleZ + img2X - 10));
      camera.y = Math.max(camera.y, canvas2Y - (canvas2Y / scaleZ + img2Y - 10));
      camera.y = Math.min(camera.y, canvas2Y + (canvas2Y / scaleZ + img2Y - 10));
    };


    let isDragging = false;
    let initialPinchDistance = null;
    let initialScale;
    let pointerX, pointerY, distPinch, lastX, lastY;

    function onPointerDown(e) {
      if (!(e.type == "mousedown" && e.button == 2)) { // right click
        e.preventDefault();
        isDragging = true;
        calculatePointer(e);
        lastX = pointerX;
        lastY = pointerY;
        initialPinchDistance = distPinch;
        initialScale = scaleZ;
      }
    }

    function onPointerUp(e) {
      if (!(e.type == "touchend" && e.touches.length >= 2)) {
        isDragging = false;
        initialPinchDistance = null;
      }
    }

    function onPointerMove(e) {
      calculatePointer(e);
      if (isDragging) {
        camera.x += (pointerX - lastX) / scaleZ;
        camera.y += (pointerY - lastY) / scaleZ;
        lastX = pointerX;
        lastY = pointerY;
        requestAnimationFrame(draw);
      };
      ///// pinch scaling
      if (e.type == "touchmove" && e.touches.length == 2) {
        // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
        adjustZoom(e, null, distPinch / initialPinchDistance);
        requestAnimationFrame(draw);
      }
    };

    function onWheel(e) {
      adjustZoom(e, e.deltaY * SCROLL_SENSITIVITY), null;
      requestAnimationFrame(draw);
    };

    function adjustZoom(e, zoomAmount, zoomFactor) {
      let oldScale = scaleZ;
      if (zoomAmount) {
        scaleZ -= scaleZ * zoomAmount;
      } else if (zoomFactor) {
        scaleZ = zoomFactor * initialScale;
      };
      scaleZ = Math.max(Math.min(scaleZ, MAX_SCALE), MIN_SCALE);
      calculatePointer(e);
      camera.x = camera.x - (pointerX - rect.left - canvas2X) * (1 / oldScale - 1 / scaleZ);
      camera.y = camera.y - (pointerY - rect.top - canvas2Y) * (1 / oldScale - 1 / scaleZ);
    };

    function calculatePointer(e) {
      if (e.type == "touchstart" || e.type == "touchmove") {
        switch (e.touches.length) {
          case 1:
            pointerX = e.touches[0].clientX;
            pointerY = e.touches[0].clientY;
            break;
          case 2:
            pointerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            pointerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
            distPinch = (e.touches[0].clientX - e.touches[1].clientX) ** 2 + (e.touches[0].clientY - e.touches[1].clientY) ** 2;
            break;
        }
      } else {
        pointerX = e.clientX;
        pointerY = e.clientY;
      }
    }


    const imageViewerCanvasContainer = document.querySelector('.image_viewer_canvas_container');

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


    /////////////////////////////////////////////////////////////////////////////////
    //  Avatar functions
    /////////////////////////////////////////////////////////////////////////////////
    const imageViewerFileChooseBtn = document.querySelector('.imageViewerFileChooseBtn');

    if (imageViewerFileChooseBtn) {

      const fileUploadSendAvatarBtn = document.querySelector('.fileUploadSendAvatarBtn');
      const imageViewerFileChooseBtn = document.querySelector('.imageViewerFileChooseBtn');
      const imageViewerFileRealInput = document.querySelector('.imageViewerFileRealInput');
      const fileUploadLogTxt = document.querySelector('.fileUploadLogTxt');
      const imageViewerInitialImage = document.querySelector('.imageViewerInitialImage');

      imageViewerFileChooseBtn.addEventListener('click', function() {
        imageViewerFileRealInput.click();
      });

      imageViewerFileRealInput.onchange = function(e) {
        if (imageViewerFileRealInput.value !== '') {
          let file = e.target.files[0];
          if (file.type.startsWith('image/')) {
            img.src = URL.createObjectURL(file);
            imageViewerInitialImage.hidden = true;
            fileUploadSendAvatarBtn.disabled = false;
            fileUploadLogTxt.innerHTML = '\uD83E\uDD1A ' + (document.documentElement.lang == "fr" ? "Veuillez centrer et zoomer votre avatar avant de le sauvegarder." : "Please center and scale your avatar before saving it.");
          };
          imageViewerFileRealInput.value = "";
        }
      };
    };


    /////////////////////////////////////////////////////////////////////////////////
    //  Image Data Tool
    /////////////////////////////////////////////////////////////////////////////////

    const imageInfo = document.querySelector('.imageInfo');

    function initImageInfo() {
      if (imageInfo) {
        const imageInfoName = document.createElement('div');
        imageInfoName.className = 'imageInfoS';
        let slug = window.location.href.split('/').pop();
        let colonPosition = slug.indexOf(':');
        let image_name = slug.substring(4, colonPosition);
        imageInfoName.innerHTML = `${image_name}`;
        imageInfoName.style = "padding-right: 2ch;"
        imageInfo.appendChild(imageInfoName);
        const imageInfoSize = document.createElement('div');
        imageInfoSize.className = 'imageInfoS';
        imageInfoSize.style = "padding-right: 2ch;"
        imageInfoSize.innerHTML = `${img.width} x ${img.height}`;
        imageInfo.appendChild(imageInfoSize);
        let zoomScale = document.createElement('div');
        zoomScale.className = 'imageInfoS';
        zoomScale.style = "width: 9ch";
        imageInfo.appendChild(zoomScale);
        let Coordi = document.createElement('div');
        let imageX = document.createElement('div');
        imageX.className = 'imageInfoS';
        imageX.style = "width: 8ch";
        Coordi.appendChild(imageX);
        let imageY = document.createElement('div');
        imageY.className = 'imageInfoS';
        imageY.style = "width: 8ch";
        Coordi.appendChild(imageY);
        imageInfo.appendChild(Coordi);
        let Colori = document.createElement('div');
        let imageR = document.createElement('div');
        imageR.className = 'imageInfoS';
        Colori.appendChild(imageR);
        let imageG = document.createElement('div');
        imageG.className = 'imageInfoS';
        Colori.appendChild(imageG);
        let imageB = document.createElement('div');
        imageB.className = 'imageInfoS';
        imageB.style = "padding-right: 3ch;"
        Colori.appendChild(imageB);
        imageInfo.appendChild(Colori);
        canvas.addEventListener('mousemove', function(e) { setImageData(e); });
        canvas.addEventListener('wheel', function(e) { setImageData(e); });
        canvas.addEventListener('touchstart', function(e) { setImageData(e, true); });
        canvas.addEventListener('touchmove', function(e) { setImageData(e); });
        canvas.addEventListener('mousedown', function(e) { setColorRef(e); });

        function setImageData(e, force = false) {
          calculatePointer(e);
          let x = (pointerX - rect.left - canvas2X) / scaleZ - (-canvas2X + camera.x) + img.width / 2;
          let y = (pointerY - rect.top - canvas2Y) / scaleZ - (-canvas2Y + camera.y) + img.height / 2;
          if (x >= 0 && x < img.width && y >= 0 && y < img.height) {
            let imageData = ctx.getImageData((pointerX - rect.left - 0.1), (pointerY - rect.top - 0.1), 1, 1).data;
            zoomScale.innerHTML = `1: ${(1/scaleZ).toFixed(3)}`;
            if (!isDragging || force && e.touches.length == 1) {
              imageX.innerHTML = `X: ${Math.trunc(x)}`;
              imageY.innerHTML = `Y: ${Math.trunc(y)}`;
              imageR.innerHTML = `R: ${imageData[0]}`; // Red
              imageG.innerHTML = `G: ${imageData[1]}`; // Green
              imageB.innerHTML = `B: ${imageData[2]}`; // Blue
            }
          } else {
            outOfRangeImageData();
          }
        }
        document.body.addEventListener('mouseleave', function() {
          outOfRangeImageData();
        });

        function outOfRangeImageData() {
          zoomScale.innerHTML = `1: ${(1/scaleZ).toFixed(3)}`;
          imageX.innerHTML = `X:`;
          imageY.innerHTML = `Y:`;
          imageR.innerHTML = `R:`;
          imageG.innerHTML = `G:`;
          imageB.innerHTML = `B:`;
        }
        outOfRangeImageData();

        function setColorRef(e) {
          if (e.button == 2) { // right click
            calculatePointer(e);
            let x = (pointerX - rect.left - canvas2X) / scaleZ - (-canvas2X + camera.x) + img.width / 2;
            let y = (pointerY - rect.top - canvas2Y) / scaleZ - (-canvas2Y + camera.y) + img.height / 2;
            if (x >= 0 && x < img.width && y >= 0 && y < img.height) {
              let imageData = ctx.getImageData((pointerX - rect.left - 0.1), (pointerY - rect.top - 0.1), 1, 1).data;
              colorRef[0] = imageData[0];
              colorRef[1] = imageData[1];
              colorRef[2] = imageData[2];
            } else {
              colorRef[0] = -1000;
            }
            requestAnimationFrame(draw);
          }
        }
      }
    }
    /////////////////////////////////////////////////////////////////////////////////
    //  Image data tool - selection by color
    /////////////////////////////////////////////////////////////////////////////////
    let colorRef = [-1000, 0, 0];
    let colorRange = 10;

    function update_top_canvas() {
      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      let noise_color, noise_alpha;
      for (let i = 0; i < imageData.data.length; i += 4) {
        noise_color = Math.floor(Math.random() * 256);
        noise_alpha = Math.floor(128 + Math.random() * 128);
        if (imageData.data[i] > (colorRef[0] - colorRange) && imageData.data[i] < (colorRef[0] + colorRange) && imageData.data[i + 1] > (colorRef[1] - colorRange) && imageData.data[i + 1] < (colorRef[1] + colorRange) && imageData.data[i + 2] > (colorRef[2] - colorRange) && imageData.data[i + 2] < (colorRef[2] + colorRange)) {
          imageData.data[i] = noise_color; // Red
          imageData.data[i + 1] = noise_color; // Green
          imageData.data[i + 2] = noise_color; // Blue
          imageData.data[i + 3] = noise_alpha; // Alpha
        }
      }
      console.log('updating_top_canvas')
      ctx2.putImageData(imageData, 0, 0);
    }
  };
})();