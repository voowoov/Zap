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
/////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////
//
/////////////////////////////////////////////////////////////////////////////////
function throttle(func, delay) {
  let lastCall = 0;

  return function(...args) {
    const now = Date.now();

    if (now - lastCall < delay) {
      return;
    }

    lastCall = now;
    return func.apply(this, args);
  };
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