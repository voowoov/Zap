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
  openNavSearchSocket();
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

function activateSearchBox() {

  showSearchControl();

  // Unhide navSearchBtnClearX if there is text inside the input field
  if (navSearchInputTxt.value !== "") {
    navSearchBtnClearX.style.display = "flex";
  }

  function deactivateSearchBox() {
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
  activateSearchBox();
});

navSearchBtnEnter.addEventListener("click", function() {
  console.log("search button click")
});

navSearchTriggerBtn.addEventListener('click', function() {
  if (navSearchTriggerBtn.getAttribute('aria-expanded') === 'false') {
    activateSearchBox();
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
//  Nav Search websocket
/////////////////////////////////////////////////////////////////////////////////

var nsws;

function openNavSearchSocket() {
  if (typeof nsws === 'undefined') {
    nsws = new WebSocket((window.location.protocol === 'https:' ? 'wss://' : 'ws://') +
      window.location.host + '/' +
      pageLanguage + '/ws/search/');
    nsws.onopen = function(e) {
      sendWSnavSearchMessage();
    }
    nsws.onmessage = function(e) {
      showWSnavSearchResults(e.data);
    };
    window.addEventListener('beforeunload', function(event) {
      nsws.close();
    });
  }
}

function sendWSnavSearchMessage() {
  navSearchStartTimer = performance.now();
  // Send the input text as a WebSocket message
  nsws.send(navSearchInputTxt.value);
}

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


/////////////////////////////////////////////////////////////////////////////////
// 
/////////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////////////////
// 
/////////////////////////////////////////////////////////////////////////////////

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