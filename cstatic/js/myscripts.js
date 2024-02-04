// Test
// window.alert(5 + 6);


/////////////////////////////////////////////////////////////////////////////////
// Determine dark or light theme for raster images
/////////////////////////////////////////////////////////////////////////////////
function detectColorScheme() {
  var theme = "";
  //local storage is used to override OS theme settings
  switch (getCookie("theme")) {
    case "light":
      document.getElementById("jsddnavthemelight").classList.add("disabled");
      break;
    case "dark":
      theme = "dark";
      document.getElementById("jsddnavthemedark").classList.add("disabled");
      break;
    case "Auto":
      document.getElementById("jsddnavthemeauto").classList.add("disabled");
      break;
    case "":
      if (!window.matchMedia) {
        return false;
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        //OS theme setting detected as dark
        theme = "dark";
      }
      document.getElementById("jsddnavthemeauto").classList.add("disabled");
      break;
    default:
  }
  if (theme == "dark") {
    $(".Logo1Light").css("display", "none");
    $(".Logo1Dark").css("display", "block");
  }
}
detectColorScheme();

/////////////////////////////////////////////////////////////////////////////////
// Get page language from html header
/////////////////////////////////////////////////////////////////////////////////
const pageLanguage = document.documentElement.lang;

/////////////////////////////////////////////////////////////////////////////////
// Button toggle container display
// Parent class  toggleDisplayCtnWithBtn, childs  toggleDisplayCtn and toggleDisplayBtn
/////////////////////////////////////////////////////////////////////////////////
const toggleDisplayCtnWithBtn_List = document.getElementsByClassName("toggleDisplayCtnWithBtn");
for (var i = 0; i < toggleDisplayCtnWithBtn_List.length; i++) {
  const toggleDisplayCtn = toggleDisplayCtnWithBtn_List[i].getElementsByClassName("toggleDisplayCtn")[0];
  const toggleDisplayBtn = toggleDisplayCtnWithBtn_List[i].getElementsByClassName("toggleDisplayBtn")[0];
  if (toggleDisplayBtn !== null && toggleDisplayCtn !== null) {
    toggleDisplayBtn.onclick = function() {
      if (toggleDisplayCtn.style.display !== "none") {
        toggleDisplayCtn.style.display = "none";
      } else {
        toggleDisplayCtn.style.display = "block";
      }
    };
  }
}

/////////////////////////////////////////////////////////////////////////////////
// Password eye toggling
/////////////////////////////////////////////////////////////////////////////////
const toggleDisplayPasswordWithBtn_List = document.getElementsByClassName("toggleDisplayPasswordWithBtn");
for (var i = 0; i < toggleDisplayPasswordWithBtn_List.length; i++) {
  const toggleDisplayPassword = toggleDisplayPasswordWithBtn_List[i].getElementsByClassName("toggleDisplayPassword")[0];
  const toggleDisplayPassBtn = toggleDisplayPasswordWithBtn_List[i].getElementsByClassName("toggleDisplayPassBtn")[0];
  if (toggleDisplayPassword !== null !== null && toggleDisplayPassBtn) {
    toggleDisplayPassBtn.onclick = function() {
      // toggle the type attribute
      const type = toggleDisplayPassword.getAttribute("type") === "password" ? "text" : "password";
      toggleDisplayPassword.setAttribute("type", type);
      // toggle the eye icon
      this.classList.toggle('fa-eye');
      this.classList.toggle('fa-eye-slash');
    };
  }
}

/////////////////////////////////////////////////////////////////////////////////
// Keep horizontal scroll to the right in tables
/////////////////////////////////////////////////////////////////////////////////
const tableScrollRight_Lists = document.getElementsByClassName("tableScrollRight");
if (tableScrollRight_Lists.length > 0) {

  window.onload = (event) => {
    setTableScrollRight()
  };

  $(window).resize(function() {
    setTableScrollRight()
  });

  function setTableScrollRight() {
    for (var i = 0; i < tableScrollRight_Lists.length; i++) {
      tableScrollRight_Lists[i].scrollLeft = tableScrollRight_Lists[i].scrollWidth;
    }
  }
}


/////////////////////////////////////////////////////////////////////////////////
// Make entire table row a link
/////////////////////////////////////////////////////////////////////////////////
$(document).ready(function($) {
  $(".entireTableRowIsLink").click(function() {
    window.document.location = $(this).data("href");
  });
});


/////////////////////////////////////////////////////////////////////////////////
// Cookie functions
/////////////////////////////////////////////////////////////////////////////////

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 86400000));
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

/////////////////////////////////////////////////////////////////////////////////
// Cookie banner and custom options
/////////////////////////////////////////////////////////////////////////////////
// Cookie banner
const cookiesBannerDiv = document.getElementById("cookiesBannerDiv");

function closeCookieBanner() {
  if (cookiesBannerDiv.style.display !== "none") {
    cookiesBannerDiv.style.display = "none";
  } else {
    cookiesBannerDiv.style.display = "block";
  }
}
$("#cookiesAcceptAllBtn").click(function() {
  setCookie("cookie_pref", "111", 120);
  closeCookieBanner();
});

// Cookie custom options
$("#cookiesCustomAllBtn").click(function() {
  setCookie("cookie_pref", "111", 120);
  closeCookieBanner();
});
$("#cookiesCustomOptBtn").click(function() {
  let cookiePrefTemp = (document.getElementById("switchCookie2").checked) ? '1' : '0';
  cookiePrefTemp += (document.getElementById("switchCookie3").checked) ? '1' : '0';
  cookiePrefTemp += (document.getElementById("switchCookie4").checked) ? '1' : '0';
  setCookie("cookie_pref", cookiePrefTemp, 120);
  closeCookieBanner();
});


/////////////////////////////////////////////////////////////////////////////////
// Back-to-top button functions
/////////////////////////////////////////////////////////////////////////////////

var btnBackToTop = document.getElementById("btnBackToTop");
if (btnBackToTop) {
  window.onscroll = function() {
    scrollTresholdDetectFunction()
  };

  function scrollTresholdDetectFunction() {
    let scroolTrigger = 200;
    if (document.body.scrollTop > scroolTrigger || document.documentElement.scrollTop > scroolTrigger) {
      btnBackToTop.style.opacity = '0.85';
    } else {
      btnBackToTop.style.opacity = '0';
    }
  }

  function backToTopFunction() {
    window.scrollTo({
      left: 0,
      top: 0,
      behavior: "smooth"
    })
  }
}

/////////////////////////////////////////////////////////////////////////////////
// Chat Host list, begin chat
/////////////////////////////////////////////////////////////////////////////////
function loadChatPrepare() {
  ////// fetch chat data on server
  var urlInitChat = JSON.parse(document.getElementById('url-init-chat').textContent);
  csrf_token = $('input[name="csrfmiddlewaretoken"]').val();
  let formData = new FormData();
  formData.append("csrfmiddlewaretoken", csrf_token);
  fetch(urlInitChat, {
      method: 'POST',
      body: formData,
    }).then(response => response.json())
    .then(response => {
      createListChatHosts(response);
      toggleChatPrepare();
    })
}

const chatPrepareDiv = document.getElementById("chat-prepare");

function createListChatHosts(json) {
  var listChatStaff = json.chat_staff_list
  var is_authenticated = json.is_authenticated
  let innerHTML = ``
  if (listChatStaff.length > 0) {
    innerHTML += `
      <div class="d-flex justify-content-between mb-2">
        <span class="fs-6">Online:</span>
        <span class="fs-6">Select</span>
      </div>
    `;
    for (let i = 0; i < listChatStaff.length; i++) {
      innerHTML += `
        <div class="container p-0 m-0 mb-2">
          <div class="row p-0 m-0">
            <label class="form-check-label p-0 m-0" for="flexRadioChatHost${i}">
              <div class="d-flex align-items-center p-0 m-0">
                <div class="col-3">
                  <img src="${listChatStaff[i][1]}" width="40px" alt="Avatar" style="border-radius: 50%;">
                </div>
                <div class="col-7">
                  <div class="fs-6">${listChatStaff[i][2]}</div>
                  <div class="fs-6">${listChatStaff[i][3]}</div>
                </div>
                <div class="col-1 form-check d-flex justify-content-end">
                  <input class="form-check-input" type="radio" name="flexRadioChatHost" id="flexRadioChatHost${i}" value="${listChatStaff[i][0]}">
                </div>
              </div>
            </label>
          </div>
        </div>
        <div class="row p-0 m-0">
      `;
    }
    if (!is_authenticated) {
      innerHTML += `
          <div>Name:</div>
          <input type="text" id="anonymous_chat_client_name" name="anonymous_chat_client_name" maxlength="255"><br>
          <div>Organisation:</div>
          <input type="text" id="anonymous_chat_client_desc" name="anonymous_chat_client_desc" maxlength="255"><br>
      `;
    }

    innerHTML += `
          <div>Subject:</div>
          <input type="text" id="chat_subject" name="chat_subject" maxlength="255"><br>
        </div>
        <div class="row p-0 m-0">
          <button class=""  onclick="startChat()" title="start chat">Start chat</button>
        </div>
    `;
  }
  chatPrepareDiv.innerHTML = innerHTML;
}

function toggleChatPrepare() {
  chatPrepareDiv.classList.toggle("is-active");
}

/////////// open new tab OR focus on existing tab   ////////////
var windowTabChat = null;

function startChat(button) {
  ////// fetch open the chat window
  var urlSaveChat = JSON.parse(document.getElementById('url-save-chat').textContent);
  var urlStartChat = JSON.parse(document.getElementById('url-start-chat').textContent);
  var chat_host_id = null;
  var anonymous_chat_client_name = null;
  var anonymous_chat_client_desc = null;
  var chat_subject = null;
  var slides = document.getElementsByName("flexRadioChatHost");
  for (var i = 0; i < slides.length; i++) {
    if (slides.item(i).checked) {
      chat_host_id = slides.item(i).value;
    };
  }
  try {
    anonymous_chat_client_name = document.getElementById('anonymous_chat_client_name').value;
    anonymous_chat_client_desc = document.getElementById('anonymous_chat_client_desc').value;
  } catch {}
  chat_subject = document.getElementById('chat_subject').value;
  csrf_token = $('input[name="csrfmiddlewaretoken"]').val();
  let formData = new FormData();
  formData.append("csrfmiddlewaretoken", csrf_token);
  if (chat_host_id != null && chat_subject != "") {
    if (anonymous_chat_client_name == null || anonymous_chat_client_name != null && anonymous_chat_client_name != "" && chat_subject != "") {
      formData.append("chat_host_id", chat_host_id);
      formData.append("anonymous_chat_client_name", anonymous_chat_client_name);
      formData.append("anonymous_chat_client_desc", anonymous_chat_client_desc);
      formData.append("chat_subject", chat_subject);
      fetch(urlSaveChat, {
          method: 'POST',
          body: formData,
        }).then(response => response.json())
        .then(response => {
          if (response.result == "success") {
            urlStartChat = urlStartChat.slice(0, -2); // remove last 2 characters, 0/
            urlStartChat += response.chat_session_id + '/'
              // open a new tab, always reuse the same window for chat
            if (windowTabChat == null || windowTabChat.closed) {
              windowTabChat = window.open(urlStartChat, 'windowTabChat');
            } else {
              windowTabChat.location.href = urlStartChat;
              windowTabChat.focus();
            }
            toggleChatPrepare();
          }
        })
    };
  };
}

/////////////////////////////////////////////////////////////////////////////////
//    navbar swipe link string with touch, mouse wheel or drag
/////////////////////////////////////////////////////////////////////////////////
const navbarSwipeMenu = document.getElementById("navbarSwipeMenu");
// mouse wheel scroll horizontally
navbarSwipeMenu.addEventListener("wheel", event => {
  event.preventDefault();
  navbarSwipeMenu.scrollLeft += event.deltaY / 5;
});

// mouse click-drag-release scroll horizontally
navbarSwipeMenu.addEventListener("mousedown", event => {
  let preventClickTreshold = false
  let navswipeStartPosition = event.clientX;
  let navswipeStartScrollLeft = navbarSwipeMenu.scrollLeft;

  function handleNavSwipeMousemove(event) {
    const displacementInPixels = navswipeStartPosition - event.clientX;
    navbarSwipeMenu.scrollLeft = navswipeStartScrollLeft + displacementInPixels;
    if (Math.abs(displacementInPixels) > 2) {
      preventClickTreshold = true;
    }
  }
  document.addEventListener("mousemove", handleNavSwipeMousemove);

  function handlePreventLinkClick(event) {
    if (preventClickTreshold) {
      event.preventDefault();
    }
  }
  navbarSwipeMenu.addEventListener("click", handlePreventLinkClick);

  function handleNavSwipeMouseup(event) {
    setTimeout(function() {
      document.removeEventListener("mousemove", handleNavSwipeMousemove);
      document.removeEventListener("mouseup", handleNavSwipeMouseup);
      navbarSwipeMenu.removeEventListener("click", handlePreventLinkClick);
    }, 0);
  }
  document.addEventListener("mouseup", handleNavSwipeMouseup);

});


/////////////////////////////////////////////////////////////////////////////////
//    
//    Navbar Search Box
//    
/////////////////////////////////////////////////////////////////////////////////

var screenWidthLg = 992; // Replace with your value

const navSearchTriggerBtn = document.getElementsByClassName('btn_nav__search')[0];
const navSearchMain = document.getElementsByClassName('navSearchMain')[0];
// Fill the div with HTML code
let navSearchPlaceHolder;
if (pageLanguage == "fr") {
  navSearchPlaceHolder = "Rechercher";
} else {
  navSearchPlaceHolder = "Search";
}
navSearchMain.innerHTML = `
  <div class="d-flex flex-column align-items-center text_color">
    <div class="navSearchBoxDiv0">
      <div class="d-flex d-sm-none navSearchBtnBack navSearchBtnRound" type="button">
        <svg width="30" height="30">
          <use href="/static/images/icons/arrowb.svg#img"></use>
        </svg>
      </div>
      <div class="navSearchBoxDiv1">
        <div class=" navSearchBoxDiv2">
          <input class="navSearchInputTxt" type="text" placeholder="${navSearchPlaceHolder}" maxlength="50"/>
        </div>
        <div class="navSearchBtnEnter" type="button">
          <svg width="18" height="18">
            <use href="/static/images/icons/search.svg#img"></use>
          </svg>
        </div>
        <svg class="navSearchIconLoupe" width="14" height="14">
          <use href="/static/images/icons/search.svg#img"></use>
        </svg>
        <div class="navSearchBtnClearX navSearchBtnRound" type="button">
          <svg width="20" height="20">
            <use href="/static/images/icons/x-lg.svg#img"></use>
          </svg>
        </div>
      </div>
    </div>
    <div class="navSearchResDiv0">
    </div>
  </div>
`;

// For each one, get a second level of elements by class name within the iteration
const navSearchInputTxt = navSearchMain.getElementsByClassName('navSearchInputTxt')[0];
const navSearchIconLoupe = navSearchMain.getElementsByClassName('navSearchIconLoupe')[0];
const navSearchBtnClearX = navSearchMain.getElementsByClassName('navSearchBtnClearX')[0];
const navSearchBtnEnter = navSearchMain.getElementsByClassName('navSearchBtnEnter')[0];
const navSearchBtnBack = navSearchMain.getElementsByClassName('navSearchBtnBack')[0];
const navSearchBoxDiv0 = navSearchMain.getElementsByClassName('navSearchBoxDiv0')[0];
const navSearchBoxDiv2 = navSearchMain.getElementsByClassName('navSearchBoxDiv2')[0];
const navSearchResDiv0 = navSearchMain.getElementsByClassName('navSearchResDiv0')[0];

function showSearchControl() {
  navSearchIconLoupe.style.display = "block";
  navSearchBoxDiv2.style.marginLeft = '0';
  navSearchBoxDiv2.style.paddingLeft = '25px';
  navSearchBoxDiv2.style.border = '1px solid var(--color-searchborderselect)';
  navSearchResDiv0.style.display = 'block';
  if (!window.matchMedia('(min-width: ' + screenWidthLg + 'px)').matches) {
    navSearchMain.style.display = "block";
  }
  navSearchInputTxt.focus();
  navSearchTriggerBtn.setAttribute('aria-expanded', 'true');
  // hide the main page scroll bar under a certain screen width
  if (window.innerWidth < 620) {
    document.body.style.overflowY = 'hidden';
  }
  openSharedSocket();
  sendWSnavSearchMessage();
}

function hideSearchControl() {
  navSearchIconLoupe.style.display = "none";
  navSearchBoxDiv2.style.marginLeft = '25px';
  navSearchBoxDiv2.style.paddingLeft = '0';
  navSearchBoxDiv2.style.border = '1px solid var(--color-searchbutton)';
  navSearchResDiv0.style.display = 'none';
  if (!window.matchMedia('(min-width: ' + screenWidthLg + 'px)').matches) {
    navSearchMain.style.display = "none";
  }
  navSearchInputTxt.blur();
  navSearchTriggerBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflowY = 'auto';
}

var activatedSearchResults = false;

function activateSearchBox() {
  activatedSearchResults = true;
  showSearchControl();

  // Unhide navSearchBtnClearX if there is text inside the input field
  if (navSearchInputTxt.value !== "") {
    navSearchBtnClearX.style.display = "flex";
  }

  function deactivateSearchBox() {
    activatedSearchResults = false;
    navSearchInputTxt.removeEventListener('input', handleInputTextChange);
    navSearchBtnClearX.removeEventListener('mousedown', handlePreventXbuttonFocusLoss);
    navSearchBtnClearX.removeEventListener('mouseup', handleClickOnXbutton);
    navSearchMain.removeEventListener('mousedown', handlePreventLeavingInput);
    navSearchMain.removeEventListener('wheel', handleScrollingFromMainCtn);
    document.removeEventListener('mousedown', handleClickedOutside);
    document.removeEventListener('keydown', handleEscapeKeydown);
    navSearchBtnBack.removeEventListener('click', handleBackButtonClick);
    navSearchTriggerBtn.removeEventListener('click', handleSearchTriggerBtnClick);
    hideSearchControl();
  }

  function handleInputTextChange(event) {
    // Unhide navSearchBtnClearX if there is text inside the input field
    if (this.value !== "") {
      navSearchBtnClearX.style.display = "flex";
    } else {
      // Hide navSearchBtnClearX if the input field is empty
      navSearchBtnClearX.style.display = "none";
    }
    sendWSnavSearchMessage()
  }
  navSearchInputTxt.addEventListener('input', handleInputTextChange);

  function handlePreventXbuttonFocusLoss(event) {
    event.preventDefault();
    event.stopPropagation();
  }
  navSearchBtnClearX.addEventListener('mousedown', handlePreventXbuttonFocusLoss);

  function handleClickOnXbutton(event) {
    navSearchInputTxt.value = "";
    navSearchInputTxt.focus();
    navSearchBtnClearX.style.display = "none";
    sendWSnavSearchMessage()
  }
  navSearchBtnClearX.addEventListener('mouseup', handleClickOnXbutton);

  function handlePreventLeavingInput(event) {
    if (event.target !== navSearchInputTxt) {
      event.preventDefault();
    }
  }
  navSearchMain.addEventListener('mousedown', handlePreventLeavingInput);

  function handleScrollingFromMainCtn(event) {
    var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
    navSearchResDiv0.scrollTop -= (delta * 30);
    event.preventDefault();
  }
  navSearchMain.addEventListener('wheel', handleScrollingFromMainCtn);

  function handleClickedOutside(event) {
    let clickedOnScrollbar = document.documentElement.clientWidth <= event.clientX;
    if (!clickedOnScrollbar &&
      !navSearchMain.contains(event.target) &&
      !navSearchResDiv0.contains(event.target) &&
      !navSearchTriggerBtn.contains(event.target)) {
      // The click occurred outside of both elements
      deactivateSearchBox();
    }
  }
  document.addEventListener('mousedown', handleClickedOutside);

  function handleEscapeKeydown(event) {
    if (event.key === 'Escape') {
      deactivateSearchBox();
    }
  }
  document.addEventListener('keydown', handleEscapeKeydown);

  function handleBackButtonClick(event) {
    deactivateSearchBox();
  }
  navSearchBtnBack.addEventListener("click", handleBackButtonClick);

  function handleSearchTriggerBtnClick(event) {
    if (navSearchTriggerBtn.getAttribute('aria-expanded') === 'true') {
      deactivateSearchBox();
    }
  }
  navSearchTriggerBtn.addEventListener("click", handleSearchTriggerBtnClick);

}

navSearchInputTxt.addEventListener("mousedown", function() {
  if (!activatedSearchResults) {
    activateSearchBox();
  }
});

navSearchBtnEnter.addEventListener("click", function() {
  console.log("search button click")
});

navSearchTriggerBtn.addEventListener('click', function() {
  if (navSearchTriggerBtn.getAttribute('aria-expanded') === 'false') {
    if (!activatedSearchResults) {
      activateSearchBox();
    }
  }
});

// Change the display based on windows width
function setSearchBoxDisplayPerScreenWidth() {
  if (window.matchMedia('(min-width: ' + screenWidthLg + 'px)').matches) {
    navSearchMain.style.display = "block";
  } else {
    if (navSearchMain.style.display == "block" &&
      navSearchResDiv0.style.display == "none") {
      navSearchMain.style.display = "none";
    }
  }
}
navSearchMain.style.display = "none";
navSearchResDiv0.style.display = "none";
setSearchBoxDisplayPerScreenWidth()

window.addEventListener('resize', function() {
  setSearchBoxDisplayPerScreenWidth();
});




/////////////////////////////////////////////////////////////////////////////////
//    Shared worker websocket
/////////////////////////////////////////////////////////////////////////////////

// get the next wsTabId in storage, single character
var wsTabId = localStorage.getItem('wsTabId');
if (wsTabId !== null) {
  nextTabId = wsTabId.charCodeAt(0) + 1;
  //   33; // '!' to  126; // '~'
  if (nextTabId > 126) {
    nextTabId = 33;
  }
  localStorage.setItem('wsTabId', String.fromCharCode(nextTabId));
} else {
  wsTabId = String.fromCharCode(33);
  localStorage.setItem('wsTabId', wsTabId);
}

const websocketUrl = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') +
  window.location.host + '/wsi/';
let wsworker;
let gsocket;
let useSharedWorker = !!window.SharedWorker; // is supported

function openSharedSocket() {
  if (typeof wsworker === 'undefined') {
    if (useSharedWorker) {
      wsworker = new SharedWorker('/static/js/sharedWorker.js');

      wsworker.port.onmessage = function(e) {
        handleWsEvent(e.data);
      };

      wsworker.port.start();

      wsworker.port.postMessage({
        command: 'connect',
        url: websocketUrl
      });
    } else {
      initiateWebsocketFallback();
    }
    window.addEventListener('beforeunload', function() {
      if (useSharedWorker) {
        wsworker.port.postMessage({
          command: 'removePort'
        });
      } else {
        gsocket.close()
      }
    });
  }
}

function initiateWebsocketFallback() {
  gsocket = new WebSocket(websocketUrl);

  gsocket.onopen = function() {
    handleWsEvent({
      type: 'open'
    });
  };

  gsocket.onmessage = function(e) {
    handleWsEvent({
      type: 'message',
      data: e.data
    });
  };

  gsocket.onerror = function() {
    handleWsEvent({
      type: 'error'
    });
  };

  gsocket.onclose = function() {
    handleWsEvent({
      type: 'close'
    });
  };
}

function wsSend(message) {
  if (useSharedWorker) {
    wsworker.port.postMessage({
      command: 'send',
      message: message
    });
  } else if (gsocket && gsocket.readyState === WebSocket.OPEN) {
    gsocket.send(message);
  }
}

function wsReconnect() {
  if (useSharedWorker) {
    wsworker.port.postMessage({
      command: 'reconnect',
      url: websocketUrl
    });
  } else if (gsocket && gsocket.readyState === WebSocket.OPEN) {
    gsocket.close();
    gsocket = null;
    initiateWebsocketFallback();
  }
}

function handleWsEvent(event) {
  switch (event.type) {
    case 'message':
      console.log('Received message:', event.data);
      if (event.data.length > 1) {
        switch (event.data[0]) {
          case 's':
            if (event.data[1] == wsTabId) {
              navSearchStartTimer = performance.now();
              showWSnavSearchResults(event.data.substring(2));
              break;
            }
          case 'f':
            if (event.data.slice(1) == 'continue') {
              sendWSsendFilePartialUpload();
              break;
            }
        }
      }
      break;
    case 'open':
      console.log('WebSocket is open');
      if (document.activeElement === navSearchInputTxt) {
        sendWSnavSearchMessage();
      }
      break;
    case 'close':
      console.log('WebSocket is closed');
      break;
    case 'error':
      console.log('WebSocket encountered an error');
      break;
    default:

  }
}

// /////////////////////////////////////////////////////////////////////////////////
// //  Nav Search websocket
// /////////////////////////////////////////////////////////////////////////////////

function showWSnavSearchResults(message) {
  var jsonArray = JSON.parse(message);
  var ul = document.createElement("ul");
  for (var i = 0; i < jsonArray.length; i++) {
    // Create a list item element
    var li = document.createElement("li");
    // Set the content of the list item to the name and age of each person
    li.innerHTML = jsonArray[i].title + " (" + jsonArray[i].vote + ")";
    // Append the list item to the list
    ul.appendChild(li);
  }
  navSearchResDiv0.innerHTML = "";
  navSearchResDiv0.appendChild(ul);

  let timeDiff = performance.now() - navSearchStartTimer;
  console.log(`${timeDiff} ms.`);
}

function sendWSnavSearchMessage_() {
  navSearchStartTimer = performance.now();
  wsSend('s' + wsTabId + navSearchInputTxt.value);
}


function debounce(func, delay) {
  let lastCallTime = 0;
  let timeoutId;

  return function() {
    const context = this;
    const args = arguments;
    const now = Date.now();

    clearTimeout(timeoutId);

    if (now - lastCallTime < delay) {
      timeoutId = setTimeout(() => {
        lastCallTime = Date.now();
        func.apply(context, args);
      }, delay - (now - lastCallTime));
    } else {
      lastCallTime = now;
      func.apply(context, args);
    }
  }
}
const sendWSnavSearchMessage = debounce(sendWSnavSearchMessage_, 400);

/////////////////////////////////////////////////////////////////////////////////
//  File uploads
/////////////////////////////////////////////////////////////////////////////////
openSharedSocket();

const fileStatusBar = document.getElementById('fileUploadStatus')
const fileChunkSize = 1990; // Size of chunks
const fileMaxNbChunks = 5;
const filePartialSize = fileChunkSize * fileMaxNbChunks; // Size of chunks
let filePortionStep = 0;
let filePortionsArray = [];

function sendWSinitiateFileUpload() {
  var x = document.getElementById("fileUploadInput");
  if ('files' in x) {
    if (x.files.length == 1) {
      var file = x.files[0];
      if (is_valid_filename(file.name)) {
        filePortionStep = 0
        filePortionsArray = dividePortionsArray(file.size, filePartialSize);
        fileStatusBar.innerHTML = '0 %';
        wsSend('f' + wsTabId + JSON.stringify({ file_name: file.name, file_size: file.size }));
      } else {
        alert("invalid file name")
      }
    }
  }
}

function sendWSsendFilePartialUpload() {
  const file = document.getElementById('fileUploadInput').files[0]; // Get file from file input
  var chunksNb = Math.ceil(filePortionsArray[filePortionStep][2] / fileChunkSize); // Number of chunks
  var chunkId = 0; // Start with the first chunk

  function readNextChunk() {
    return new Promise((resolve, reject) => {
      if (chunkId < chunksNb) {
        var start = filePortionsArray[filePortionStep][0] + chunkId * fileChunkSize;
        var end = Math.min(start + fileChunkSize, filePortionsArray[filePortionStep][1] + 1);
        var blob = file.slice(start, end); // Create a blob representing the chunk
        var reader = new FileReader();
        reader.onloadend = function(evt) {
          if (evt.target.readyState == FileReader.DONE) { // When the chunk is read
            // make the byte array with [Chunk id (4 bytes int) + File byte array (rest of the bytes)]
            var buffer = new ArrayBuffer(4),
              view = new DataView(buffer);
            view.setInt32(0, chunkId, true);
            var resultByteLength = evt.target.result.byteLength,
              arrayBuffer = new Uint8Array(view.byteLength + resultByteLength);
            arrayBuffer.set(new Uint8Array(view.buffer));
            arrayBuffer.set(new Uint8Array(evt.target.result), view.byteLength);
            wsSend(arrayBuffer);
            chunkId++;
            resolve(readNextChunk()); // Resolve the promise with the next recursive call
          }
        };
        reader.readAsArrayBuffer(blob);
      } else {
        resolve(); // Resolve the promise when there are no more chunks to read
      }
    });
  }
  readNextChunk().then(() => {
    filePortionStep++;
    fileStatusBar.innerHTML = Math.floor(filePortionStep / filePortionsArray.length * 100).toString() + ' %';
  });
}

function is_valid_filename(filename) {
  // Check if filename starts with alphanumeric or underscore, followed by alphanumeric, underscore, hyphen, and contains only one dot
  // Check if extension is alphanumeric
  let filenameRegex = /^\w[\w\s-]*\.\w+$/;
  if (!filenameRegex.test(filename)) {
    return false;
  }
  if (filename.length > 50) {
    return false;
  }
  // Check if extension is present and not too long
  let extension = filename.split('.').pop();
  if (!extension || extension.length < 3 || extension.length > 5) {
    return false;
  }
  return true;
}

// sets a 2d Array with start position, end position and length for each portion of the file
// ex 10 and 3 will output  [[0, 2, 3], [3, 5, 3], [6, 8, 3], [9, 9, 1]]
function dividePortionsArray(fullSize, partialSize) {
  var quotient = Math.floor(fullSize / partialSize);
  var remainder = fullSize % partialSize;
  var start = 0;
  var portions = [];
  for (var i = 0; i < quotient; i++) {
    var end = start + partialSize;
    portions.push([start, end - 1, partialSize]);
    start = end;
  }
  if (remainder != 0) {
    portions.push([start, start + remainder - 1, remainder]);
  }
  return portions;
}
/////////////////////////////////////////////////////////////////////////////////
//
/////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
//
/////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
//  close open bs dropdown menus with escape key
/////////////////////////////////////////////////////////////////////////////////
// window.addEventListener('keydown', function(event) {
//   if (event.key === 'Escape') {
//     // Get all shown dropdown elements
//     const dropdowns = document.querySelectorAll('.dropdown-menu.show');
//     // Loop through each dropdown and remove the 'show' class
//     for (var i = 0; i < dropdowns.length; i++) {
//       dropdowns[i].classList.remove('show');
//       // Get the button that controls this dropdown
//       const button = dropdowns[i].parentNode.querySelector('[aria-expanded]');
//       if (button) {
//         // Set 'aria-expanded' to 'false'
//         button.setAttribute('aria-expanded', 'false');
//       }
//     }
//   }
// });


/////////////////////////////////////////////////////////////////////////////////
//
/////////////////////////////////////////////////////////////////////////////////