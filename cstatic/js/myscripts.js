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
    let logo1_light = document.getElementsByName("logo1_light");
    let logo1_dark = document.getElementsByName("logo1_dark");
    for (let i = 0; i < logo1_light.length; i++) {
      logo1_light[i].hidden = true;
    }
    for (let i = 0; i < logo1_dark.length; i++) {
      logo1_dark[i].hidden = false;
    }
  }
}
detectColorScheme();

/////////////////////////////////////////////////////////////////////////////////
// Button toggle a <div>
/////////////////////////////////////////////////////////////////////////////////
const targetDiv_div = document.getElementById("toggleDiv_div");
const targetDiv_btn = document.getElementById("toggleDiv_btn");
if (targetDiv_btn !== null) {
  targetDiv_btn.onclick = function() {
    if (targetDiv_div.style.display !== "none") {
      targetDiv_div.style.display = "none";
    } else {
      targetDiv_div.style.display = "block";
    }
  };
}

/////////////////////////////////////////////////////////////////////////////////
// Password eye toggling
/////////////////////////////////////////////////////////////////////////////////
const togglePassword = document.querySelector("#togglePassword");
const password1 = document.querySelector("#inputPassword");
if (togglePassword !== null) {
  togglePassword.addEventListener("click", function() {
    // toggle the type attribute
    const type = password1.getAttribute("type") === "password" ? "text" : "password";
    password1.setAttribute("type", type);
    // toggle the eye icon
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
  });
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
const page_language = document.documentElement.lang

// Cookie banner
function closeCookieBanner() {
  if (page_language == "fr") {
    sendMessageOnPage("Préférence de cookie enregistrée.");
  } else if (page_language == "en") {
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
// Add search items to dropdown menu dynamically
/////////////////////////////////////////////////////////////////////////////////
function createListSearchResults(obj_list) {
  let innerHTML = ``;
  let title = '';
  for (let i = 0; i < obj_list.length; i++) {
    title = obj_list[i][0] + "&#10;" + obj_list[i][1];
    innerHTML += `
      <div class="row">
        <a class="dropdown-item" title="${title}" href="#">
          <div class="d-flex flex-wrap align-items-center">
            <div class="col-12 text-truncate search_suggest_title" >${obj_list[i][0]}</div>
            <div class="col-9 search_suggest_date">${obj_list[i][1]}</div>
            <div class="col-3 search_suggest_date">${obj_list[i][1]}</div>
          </div>
        </a>
        <hr class="dropdown-divider" />
      </div>
    `;
  }
  changeDivInnerHtml('search_suggest', innerHTML)
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
// 
/////////////////////////////////////////////////////////////////////////////////