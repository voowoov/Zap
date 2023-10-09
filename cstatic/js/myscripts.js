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
    // Sets in <html> tag, activates CSS variables for dark color theme
    // document.documentElement.setAttribute("color_theme", "dark");

    // All logos color theme
    let Logo1Light = document.getElementsByName("Logo1Light");
    let Logo1Dark = document.getElementsByName("Logo1Dark");
    for (let i = 0; i < Logo1Light.length; i++) {
      Logo1Light[i].hidden = true;
    }
    for (let i = 0; i < Logo1Dark.length; i++) {
      Logo1Dark[i].hidden = false;
    }
  }
}
detectColorScheme();

/////////////////////////////////////////////////////////////////////////////////
// Get page language from html header
/////////////////////////////////////////////////////////////////////////////////
const pageLanguage = document.documentElement.lang

/////////////////////////////////////////////////////////////////////////////////
// Button toggle container display
// Parent class  toggleDisplayCtnWithBtn, childs  toggleDisplayCtn and toggleDisplayBtn
/////////////////////////////////////////////////////////////////////////////////
var toggleDisplayCtnWithBtn = document.getElementsByClassName("toggleDisplayCtnWithBtn");
for (var i = 0; i < toggleDisplayCtnWithBtn.length; i++) {
  let toggleDisplayCtn = toggleDisplayCtnWithBtn[i].getElementsByClassName("toggleDisplayCtn")[0];
  let toggleDisplayBtn = toggleDisplayCtnWithBtn[i].getElementsByClassName("toggleDisplayBtn")[0];
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
var toggleDisplayPasswordWithBtn = document.getElementsByClassName("toggleDisplayPasswordWithBtn");
for (var i = 0; i < toggleDisplayPasswordWithBtn.length; i++) {
  let toggleDisplayPassword = toggleDisplayPasswordWithBtn[i].getElementsByClassName("toggleDisplayPassword")[0];
  let toggleDisplayPassBtn = toggleDisplayPasswordWithBtn[i].getElementsByClassName("toggleDisplayPassBtn")[0];
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
$(window).resize(function() {
  horizontalScrollRight()
});
window.onload = (event) => {
  horizontalScrollRight()
};

function horizontalScrollRight() {
  var items = document.getElementsByClassName("tableScrollRight");
  for (var i = 0; i < items.length; i++) {
    items[i].scrollLeft = items[i].scrollWidth;
  }
}

/////////////////////////////////////////////////////////////////////////////////
// Make entire table row a link
/////////////////////////////////////////////////////////////////////////////////
$(document).ready(function($) {
  $(".table_row_link").click(function() {
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

// Cookie banner - set a cookie that stores cookie settings
const target_div_cookieBanner = document.getElementById("target_div_cookieBanner");
const target_btn_acceptAllCookies = document.getElementById("target_btn_acceptAllCookies");
const target_btn_customOptCookies = document.getElementById("target_btn_customOptCookies");
const target_btn_customAllCookies = document.getElementById("target_btn_customAllCookies");

// Cookie banner
function closeCookieBanner() {
  if (pageLanguage == "fr") {
    sendMessageOnPage("Préférence de cookie enregistrée.");
  } else if (pageLanguage == "en") {
    sendMessageOnPage("Your cookie preference was set.");
  }
  if (target_div_cookieBanner.style.display !== "none") {
    target_div_cookieBanner.style.display = "none";
  } else {
    target_div_cookieBanner.style.display = "block";
  }
}
if (target_btn_acceptAllCookies !== null) {
  target_btn_acceptAllCookies.onclick = function() {
    setCookie("cookie_pref", "111", 120);
    closeCookieBanner();
  };
}
// Cookie settings
if (target_btn_customOptCookies !== null) {
  target_btn_customOptCookies.onclick = function() {
    // alert(1);
    let cookie_pref_temp = (document.getElementById("switchCookie2").checked) ? '1' : '0';
    cookie_pref_temp += (document.getElementById("switchCookie3").checked) ? '1' : '0';
    cookie_pref_temp += (document.getElementById("switchCookie4").checked) ? '1' : '0';
    setCookie("cookie_pref", cookie_pref_temp, 120);
    closeCookieBanner();
  };
}
if (target_btn_customAllCookies !== null) {
  target_btn_customAllCookies.onclick = function() {
    setCookie("cookie_pref", "111", 120);
    closeCookieBanner();
  };
}

/////////////////////////////////////////////////////////////////////////////////
// sendMessageOnPage
/////////////////////////////////////////////////////////////////////////////////

function sendMessageOnPage(cmessage) {
  const newDiv = document.createElement("div");
  const newContent = document.createTextNode(cmessage);
  newDiv.appendChild(newContent);
  newDiv.style.position = "fixed";
  newDiv.style.backgroundColor = "#55FF55";
  newDiv.style.left = '10px';
  newDiv.style.top = '60px';
  newDiv.style.opacity = 1;
  var fadeEffect = setInterval(function() {
    if (newDiv.style.opacity > 0) {
      newDiv.style.opacity -= 0.04;
    } else {
      newDiv.remove();
      clearInterval(fadeEffect);
    }
  }, 200);
  document.body.insertBefore(newDiv, null);
}
// sendMessageOnPage("Cookie preference was set.")

/////////////////////////////////////////////////////////////////////////////////
//  changeDivInnerHtml
/////////////////////////////////////////////////////////////////////////////////
function changeDivInnerHtml(parentID, newInnerHTML) {
  const div = document.createElement('div');
  div.className = '';
  let innerHTML = ``;
  div.innerHTML = innerHTML + newInnerHTML;
  let parent_element = document.getElementById(parentID)
    //  remove all existing items
  while (parent_element.firstChild) {
    parent_element.firstChild.remove();
  }
  parent_element.appendChild(div);
}

/////////////////////////////////////////////////////////////////////////////////
// Back-to-top button functions
/////////////////////////////////////////////////////////////////////////////////

var btnBackToTop = document.getElementById("btnBackToTop");
if (btnBackToTop) {
  window.onscroll = function() {
    scrollfunction()
  };

  function scrollfunction() {
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
  changeDivInnerHtml('chat-prepare', innerHTML)
}

function toggleChatPrepare() {
  document.querySelector('#chat-prepare').classList.toggle("is-active");
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
    anonymous_chat_client_name = document.querySelector('#anonymous_chat_client_name').value;
    anonymous_chat_client_desc = document.querySelector('#anonymous_chat_client_desc').value;
  } catch {}
  chat_subject = document.querySelector('#chat_subject').value;
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
const navbarswipemenu = document.getElementById("navbarswipemenu");
// mouse wheel scroll horizontally
navbarswipemenu.addEventListener("wheel", event => {
  event.preventDefault();
  navbarswipemenu.scrollLeft += event.deltaY / 5;
});

// mouse click-drag-release scroll horizontally
let navswipeIsScrolling = false;
let navswipeIsDragging = false;
let navswipeStartPosition = 0;
let navswipeStartScrollLeft = 0;

navbarswipemenu.addEventListener("mousedown", event => {
  navswipeIsDragging = true;
  navswipeIsScrolling = false
  navswipeStartPosition = event.clientX;
  navswipeStartScrollLeft = navbarswipemenu.scrollLeft;
  document.addEventListener("mousemove", navswipemousemoveHandler);
  document.addEventListener("mouseup", navswipemouseupHandler);
});
navbarswipemenu.addEventListener("click", event => {
  if (navswipeIsScrolling) {
    event.preventDefault();
  }
});

function navswipemousemoveHandler(event) {
  if (navswipeIsDragging) {
    const displacementInPixels = navswipeStartPosition - event.clientX;
    navbarswipemenu.scrollLeft = navswipeStartScrollLeft + displacementInPixels;
    if (Math.abs(displacementInPixels) > 2) {
      navswipeIsScrolling = true;
    }
  }
}

function navswipemouseupHandler(event) {
  if (navswipeIsDragging) {
    navswipeIsDragging = false;
    document.removeEventListener("mousemove", navswipemousemoveHandler);
    document.removeEventListener("mouseup", navswipemouseupHandler);
  }
}


/////////////////////////////////////////////////////////////////////////////////
//    
//    Navbar Search Box
//    
/////////////////////////////////////////////////////////////////////////////////

var screenwidth_lg = 992; // Replace with your value

const searchtriggerbtn = document.getElementsByClassName('btn_nav__search')[0];
const searchboxmain = document.getElementsByClassName('searchboxmain')[0];
// Fill the div with HTML code
if (pageLanguage == "fr") {
  searchplaceholder = "Rechercher";
} else {
  searchplaceholder = "Search";
}
searchboxmain.innerHTML = `
  <div class="d-flex flex-column align-items-center text_color">
    <div class="searchboxctn0">
      <div class="d-flex d-sm-none searchbtnback searchbtnround" type="button">
        <svg width="30" height="30">
          <use href="/static/images/icons/arrowb.svg#img"></use>
        </svg>
      </div>
      <div class="searchboxctn1">
        <div class=" searchboxctn2">
          <input class="searchinputit" type="text" placeholder="${searchplaceholder}"
            oninput="sendWebSocketMessage()" />
        </div>
        <div class="searchbtnenter" type="button">
          <svg width="18" height="18">
            <use href="/static/images/icons/search.svg#img"></use>
          </svg>
        </div>
        <svg class="searchiconloupe" width="14" height="14">
          <use href="/static/images/icons/search.svg#img"></use>
        </svg>
        <div class="searchbtnx searchbtnround" type="button">
          <svg width="20" height="20">
            <use href="/static/images/icons/x-lg.svg#img"></use>
          </svg>
        </div>
      </div>
    </div>
    <div class="searchresctn0">
    </div>
  </div>
`;

// For each one, get a second level of elements by class name within the iteration
const searchinputit = searchboxmain.getElementsByClassName('searchinputit')[0];
const searchiconloupe = searchboxmain.getElementsByClassName('searchiconloupe')[0];
const searchbtnx = searchboxmain.getElementsByClassName('searchbtnx')[0];
const searchbtnenter = searchboxmain.getElementsByClassName('searchbtnenter')[0];
const searchbtnback = searchboxmain.getElementsByClassName('searchbtnback')[0];
const searchboxctn0 = searchboxmain.getElementsByClassName('searchboxctn0')[0];
const searchboxctn2 = searchboxmain.getElementsByClassName('searchboxctn2')[0];
const searchresctn0 = searchboxmain.getElementsByClassName('searchresctn0')[0];

function showSearchControl() {
  searchiconloupe.style.display = "block";
  searchboxctn2.style.marginLeft = '0';
  searchboxctn2.style.paddingLeft = '25px';
  searchboxctn2.style.border = '1px solid var(--color-searchborderselect)';
  searchresctn0.style.display = 'block';
  if (!window.matchMedia('(min-width: ' + screenwidth_lg + 'px)').matches) {
    searchboxmain.style.display = "block";
  }
  searchinputit.focus();
  searchtriggerbtn.setAttribute('aria-expanded', 'true');
  // hide the main page scroll bar under a certain screen width
  if (window.innerWidth < 620) {
    document.body.style.overflowY = 'hidden';
  }
}

function hideSearchControl() {
  searchiconloupe.style.display = "none";
  searchboxctn2.style.marginLeft = '25px';
  searchboxctn2.style.paddingLeft = '0';
  searchboxctn2.style.border = '1px solid var(--color-searchbutton)';
  searchresctn0.style.display = 'none';
  if (!window.matchMedia('(min-width: ' + screenwidth_lg + 'px)').matches) {
    searchboxmain.style.display = "none";
  }
  searchinputit.blur();
  searchtriggerbtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflowY = 'auto';
}

function activateSearchBox() {

  showSearchControl();

  // Unhide searchbtnx if there is text inside the input field
  if (searchinputit.value !== "") {
    searchbtnx.style.display = "flex";
  }
  if (window.getComputedStyle(searchresctn0).display === 'none') {
    showSearchResultsCtn();
  }

  function closeSearchResults() {
    document.removeEventListener('input', handleInputTextChange);
    document.removeEventListener('mousedown', handlePreventXbuttonFocusLoss);
    document.removeEventListener('mouseup', handleClickOnXbutton);
    document.removeEventListener('mousedown', handlePreventLeavingInput);
    document.removeEventListener('wheel', handleScrollingFromMainCtn);
    document.removeEventListener('mousedown', handleClickedOutside);
    document.removeEventListener('keydown', handleEscapeKeydown);
    document.removeEventListener('click', handleBackButtonClick);
    hideSearchControl();
  }

  function handleInputTextChange(event) {
    // Unhide searchbtnx if there is text inside the input field
    if (this.value !== "") {
      searchbtnx.style.display = "flex";
    } else {
      // Hide searchbtnx if the input field is empty
      searchbtnx.style.display = "none";
    }
  }
  searchinputit.addEventListener('input', handleInputTextChange);

  function handlePreventXbuttonFocusLoss(event) {
    event.preventDefault();
    event.stopPropagation();
  }
  searchbtnx.addEventListener('mousedown', handlePreventXbuttonFocusLoss);

  function handleClickOnXbutton(event) {
    // Empty the input element
    searchinputit.value = "";
    // Set the focus on the input element
    searchinputit.focus();
    searchinputit.dispatchEvent(new MouseEvent('mousedown'));
    searchbtnx.style.display = "none";
  }
  searchbtnx.addEventListener('mouseup', handleClickOnXbutton);

  function handlePreventLeavingInput(event) {
    if (event.target !== searchinputit) {
      event.preventDefault();
    }
  }
  searchboxctn2.addEventListener('mousedown', handlePreventLeavingInput);

  function handleScrollingFromMainCtn(event) {
    var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
    searchresctn0.scrollTop -= (delta * 30);
    event.preventDefault();
  }
  searchboxmain.addEventListener('wheel', handleScrollingFromMainCtn);

  function handleClickedOutside(event) {
    let clickedonscrollbar = document.documentElement.clientWidth <= event.clientX;
    if (!clickedonscrollbar &&
      !searchboxmain.contains(event.target) &&
      !searchresctn0.contains(event.target) &&
      !searchtriggerbtn.contains(event.target)) {
      // The click occurred outside of both elements
      closeSearchResults();
    }
  }
  document.addEventListener('mousedown', handleClickedOutside);

  function handleEscapeKeydown(event) {
    if (event.key === 'Escape') {
      closeSearchResults();
    }
  }
  document.addEventListener('keydown', handleEscapeKeydown);

  function handleBackButtonClick(event) {
    closeSearchResults();
  }
  searchbtnback.addEventListener("click", handleBackButtonClick);

}

searchinputit.addEventListener("mousedown", function() {
  activateSearchBox();
});

searchbtnenter.addEventListener("click", function() {
  console.log("search button click")
});

searchtriggerbtn.addEventListener('click', function() {
  if (searchtriggerbtn.getAttribute('aria-expanded') === 'false') {
    activateSearchBox();
  } else {
    hideSearchControl();
  }
});

// Change the display based on windows width
function setSearchBoxDisplayPerScreenWidth() {
  if (window.matchMedia('(min-width: ' + screenwidth_lg + 'px)').matches) {
    searchboxmain.style.display = "block";
  } else {
    if (searchboxmain.style.display == "block" &&
      searchresctn0.style.display == "none") {
      searchboxmain.style.display = "none";
    }
  }
}
searchboxmain.style.display = "none";
searchresctn0.style.display = "none";
setSearchBoxDisplayPerScreenWidth()

window.addEventListener('resize', function() {
  setSearchBoxDisplayPerScreenWidth();
});


/////////////////////////////////////////////////////////////////////////////////
//  Nav Search websocket
/////////////////////////////////////////////////////////////////////////////////
var websocketnavsearch; // Declare a global variable for the WebSocket object

function createWebSocketNavsearch() {
  const currentHttpProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
  websocketnavsearch = new WebSocket(
    currentHttpProtocol +
    window.location.host + '/' +
    pageLanguage + '/ws/search/'
  );
  // Handle WebSocket connection open event
  websocketnavsearch.onopen = function(event) {
    console.log('WebSocket connection established.');
  };

  // Handle WebSocket message received event
  websocketnavsearch.onmessage = function(event) {
    const message = event.data;
    handleWebSocketSearchResults(message);
  };

  // Handle WebSocket connection close event
  websocketnavsearch.onclose = function(event) {
    console.log('WebSocket connection closed.');
  };

  websocketnavsearch.onerror = function(event) {
    // Handle the error event
    console.log("WebSocket error: " + event.message);
  };
}

searchinputit.addEventListener("focus", function(event) {
  if (!websocketnavsearch) {
    createWebSocketNavsearch();
  }
});

// Send a WebSocket message to the Django consumer
function sendWebSocketMessage() {
  startTimerNavsearch = performance.now();
  // Send the input text as a WebSocket message
  websocketnavsearch.send(searchinputit.value);
}

// Handle WebSocket message search results received from the Django consumer
function handleWebSocketSearchResults(message) {
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
  searchresctn0.innerHTML = "";
  searchresctn0.appendChild(ul);

  let timeDiff = performance.now() - startTimerNavsearch;
  console.log(`${timeDiff} milliseconds to execute.`);
}


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