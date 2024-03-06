(function() {
  let element = document.getElementById('your-id');
  if (element) {
    // Your code here
  };
})();

/////////////////////////////////////////////////////////////////////////////////
// Determine dark or light theme for raster images
/////////////////////////////////////////////////////////////////////////////////
(function() {
  let theme = "";
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
    case "Auto" || "":
      if (!window.matchMedia) {
        return false;
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        //OS theme setting detected as dark
        theme = "dark";
      };
      document.getElementById("jsddnavthemeauto").classList.add("disabled");
      break;
    default:
  }
  if (theme == "dark") {
    document.querySelectorAll('.Logo1Light').forEach(function(element) {
      element.style.display = 'none';
    });
    document.querySelectorAll('.Logo1Dark').forEach(function(element) {
      element.style.display = 'block';
    });
    //// for bootstrap theme
    document.body.dataset.bsTheme = 'dark';
  }
})();

/////////////////////////////////////////////////////////////////////////////////
// Get page language from html header
/////////////////////////////////////////////////////////////////////////////////
const pageLanguage = document.documentElement.lang;

/////////////////////////////////////////////////////////////////////////////////
// Button toggle container display
// Parent class  toggleDisplayCtnWithBtn, childs  toggleDisplayCtn and toggleDisplayBtn
/////////////////////////////////////////////////////////////////////////////////
(function() {
  const toggleDisplayCtnWithBtn_List = document.querySelectorAll(".toggleDisplayCtnWithBtn");
  if (toggleDisplayCtnWithBtn_List) {
    for (let item of toggleDisplayCtnWithBtn_List) {
      const toggleDisplayCtn = item.querySelector(".toggleDisplayCtn");
      const toggleDisplayBtn = item.querySelector(".toggleDisplayBtn");
      if (toggleDisplayBtn !== null && toggleDisplayCtn !== null) {
        toggleDisplayBtn.addEventListener('click', throttle(function() {
          if (toggleDisplayCtn.style.display !== "none") {
            toggleDisplayCtn.style.display = "none";
          } else {
            toggleDisplayCtn.style.display = "block";
          }
        }, 1000));
      };
    };
  };
})();


/////////////////////////////////////////////////////////////////////////////////
// Keep horizontal scroll to the right in tables
/////////////////////////////////////////////////////////////////////////////////
(function() {
  const tableScrollRight_Lists = document.querySelectorAll(".tableScrollRight");
  if (tableScrollRight_Lists.length > 0) {
    function setTableScrollRight() {
      for (let i = 0; i < tableScrollRight_Lists.length; i++) {
        tableScrollRight_Lists[i].scrollLeft = tableScrollRight_Lists[i].scrollWidth;
      };
    };
    setTableScrollRight();
    window.addEventListener('resize', function() {
      setTableScrollRight();
    });
  };
})();


/////////////////////////////////////////////////////////////////////////////////
// Make entire table row a link
/////////////////////////////////////////////////////////////////////////////////
(function() {
  let rows = document.querySelectorAll('entireTableRowIsLink');
  if (rows) {
    rows.forEach(function(row) {
      row.addEventListener('click', throttle(function() {
        window.location.href = row.getAttribute('data-href');
      }, 1000));
    });
  };
})();


/////////////////////////////////////////////////////////////////////////////////
// Cookie functions
/////////////////////////////////////////////////////////////////////////////////

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 86400000));
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};

function getCookie(cookieNameEndsBy) {
  let cookieStr = document.cookie;
  let startIndex = cookieStr.indexOf(cookieNameEndsBy)
  if (startIndex > 0) {
    startIndex += cookieNameEndsBy.length + 1;
  } else {
    return "";
  }
  let endIndex = cookieStr.indexOf(";", startIndex);
  return cookieStr.substring(startIndex, endIndex > 0 ? endIndex : cookieStr.length);
}

/////////////////////////////////////////////////////////////////////////////////
// Back-to-top button functions
/////////////////////////////////////////////////////////////////////////////////
(function() {
  let btnBackToTop = document.querySelector('.btnBackToTop');
  if (btnBackToTop) {
    window.onscroll = function() {
      scrollTresholdDetectFunction();
    };

    function scrollTresholdDetectFunction() {
      let scroolTrigger = 200;
      if (document.body.scrollTop > scroolTrigger || document.documentElement.scrollTop > scroolTrigger) {
        btnBackToTop.style.opacity = '0.85';
      } else {
        btnBackToTop.style.opacity = '0';
      };
    };
    btnBackToTop.addEventListener('click', throttle(function() {
      window.scrollTo({
        left: 0,
        top: 0,
        behavior: "smooth"
      });
    }, 1000));
  };
})();


/////////////////////////////////////////////////////////////////////////////////
//    navbar swipe link string with touch, mouse wheel or drag
/////////////////////////////////////////////////////////////////////////////////
(function() {
  const navbarSwipeMenu = document.querySelector('.navlinkbarswipe');
  if (navbarSwipeMenu) {
    navbarSwipeMenu.addEventListener("wheel", event => {
      // event.stopPropagation();
      // event.preventDefault();
      navbarSwipeMenu.scrollLeft += event.deltaY / 5;
    }, { passive: true });

    // mouse click-drag-release scroll horizontally
    navbarSwipeMenu.addEventListener("mousedown", event => {
      let preventClickTreshold = false;
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
      navbarSwipeMenu.addEventListener("click", throttle(handlePreventLinkClick, 1000));

      function handleNavSwipeMouseup(event) {
        setTimeout(function() {
          document.removeEventListener("mousemove", handleNavSwipeMousemove);
          document.removeEventListener("mouseup", handleNavSwipeMouseup);
          navbarSwipeMenu.removeEventListener("click", handlePreventLinkClick);
        }, 0);
      }
      document.addEventListener("mouseup", handleNavSwipeMouseup);
    });
  };
})();

/////////////////////////////////////////////////////////////////////////////////
//  close open bs dropdown menus with escape key
/////////////////////////////////////////////////////////////////////////////////
window.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    // Get all shown dropdown elements
    const dropdowns = document.querySelectorAll('.dropdown-menu.show');
    // Loop through each dropdown and remove the 'show' class
    for (let i = 0; i < dropdowns.length; i++) {
      dropdowns[i].classList.remove('show');
      // Get the button that controls this dropdown
      const button = dropdowns[i].parentNode.querySelector('[aria-expanded]');
      if (button) {
        // Set 'aria-expanded' to 'false'
        button.setAttribute('aria-expanded', 'false');
      };
    };
  };
});


/////////////////////////////////////////////////////////////////////////////////
//
/////////////////////////////////////////////////////////////////////////////////
export function throttle(func, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall < delay) { return; }
    lastCall = now;
    return func.apply(this, args);
  };
}


/////////////////////////////////////////////////////////////////////////////////
// Cookie banner and custom options
/////////////////////////////////////////////////////////////////////////////////
(function() {
    // get the cookie_pref cookie, default ""
    function getCookie(cookieNameEndsBy) {
      let cookieStr = document.cookie;
      let startIndex = cookieStr.indexOf(cookieNameEndsBy)
      if (startIndex > 0) {
        startIndex += cookieNameEndsBy.length + 1;
      } else {
        return "";
      }
      let endIndex = cookieStr.indexOf(";", startIndex);
      return cookieStr.substring(startIndex, endIndex > 0 ? endIndex : cookieStr.length);
    }

    function getCookiePrefCookie() { return getCookie("ie_pref") }

    let cookie_pref = getCookiePrefCookie()

    let cookiePolicyURL = (pageLanguage == "fr" ? "/legal/cookie-policy" : "/legal/cookie-policy")
    let cookieBannerHTML = `
    <div class="cookiesBannerDiv container-fluid p-0">
      <div class="text_color cookie_banner p-3">
        <div class="row">
          <div class="h5">${(pageLanguage == "fr" ? "Votre Confidentialité" : "Your Privacy")}</div>
        </div>
        <div class="row">
          <div class="d-flex flex-wrap justify-content-between" style="max-width: 1000px">
            <div class="me-2 mb-2" style="max-width: 550px">
              ${(pageLanguage == "fr" ? "By clicking “Accept all cookies”, you agree Zap can store cookies on your device and disclose information in accordance with our " : "By clicking “Accept all cookies”, you agree Zap can store cookies on your device and disclose information in accordance with our ")}
              <a href="${cookiePolicyURL}">${(pageLanguage == "fr" ? "Politique cookies" : "Cookie Policy")}</a>.
            </div>
            <div>
              <button type="button" class="btn btn-primary mt-2 me-2" style="width: 160px" id="cookiesAcceptAllBtn"
                data-bs-toggle="" data-bs-target="#"> ${(pageLanguage == "fr" ? "Accepter tous les cookies" : "Accept all cookies")}</button>
                <button type="button" class="btn btn-secondary mt-2 cookieSettingsBtn" style="width: 160px">${(pageLanguage == "fr" ? "Paramètres cookies" : "Cookies Settings")}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    `

    function cookieOptionsHTML(_cookie_pref) {
      return `
  <div class="modal" id="cookieSettingsModal" tabindex="-1" aria-labelledby="cookieSettingsModalLabel" aria-hidden="true"
    role="dialog">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content p-2">
        <div class="modal-header border-0">
          <h5 class="modal-title" id="cookieSettingsModalLabel">${(pageLanguage == "fr" ? "Paramètres cookies" : "Cookies Settings")}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="">
            ${(pageLanguage == "fr" ? 
            `
            When you visit any of our websites, it may store or retrieve information on your browser, mostly in the form
            of cookies. This information might be about you, your preferences or your device
            and is mostly used to make the site work as you expect it to. The information does not usually directly
            identify you, but it can give you a more personalized web experience. Because we
            respect your right to privacy, you can choose not to allow some types of cookies. Click on the different
            category headings to find out more and manage your preferences. Please note, blocking
            some types of cookies may impact your experience of the site and the services we are able to offer.
            `
            : 
            `
            When you visit any of our websites, it may store or retrieve information on your browser, mostly in the form
            of cookies. This information might be about you, your preferences or your device
            and is mostly used to make the site work as you expect it to. The information does not usually directly
            identify you, but it can give you a more personalized web experience. Because we
            respect your right to privacy, you can choose not to allow some types of cookies. Click on the different
            category headings to find out more and manage your preferences. Please note, blocking
            some types of cookies may impact your experience of the site and the services we are able to offer.
            `
            )}
            <a href="${cookiePolicyURL}">${(pageLanguage == "fr" ? "Politiquee cookies" : "Cookie Policy")}</a>.
          </div>
          <div class="p-0 pt-3 pb-1 d-flex justify-content-between align-items-center">
            <div>
              <a class="btn p-0 d-flex justify-content-start align-items-center" data-bs-toggle="collapse"
                href="#collapseCookieInfo1" role="button" aria-expanded="false" aria-controls="collapseCookieInfo1">
                <span class="me-2">${(pageLanguage == "fr" ? "Strictly Necessary" : "Strictly Necessary")}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                  class="bi bi-question-circle-fill mt-1" viewBox="0 0 16 16">
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.496 6.033h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247zm2.325 6.443c.61 0 1.029-.394 1.029-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94 0 .533.425.927 1.01.927z" />
                </svg>
              </a>
            </div>
            <div class="form-check form-switch" style="transform: scale(1.5)">
              <input class="form-check-input" type="checkbox" id="switchCookie1" name="darkmode" value="yes" checked
                disabled />
            </div>
          </div>
          <div class="collapse" id="collapseCookieInfo1">
            <div class="card card-body p-0 border-0">
              ${(pageLanguage == "fr" ? 
              `
              These cookies are necessary for our website to function properly and cannot be switched off in our systems.
              They are usually only set in response to actions made by you which amount to a
              request for services, such as setting your privacy preferences, logging in or filling in forms or where
              they're essential to provide you with a service you have requested. You cannot
              opt-out of these cookies. You can set your browser to block or alert you about these cookies, but if you do,
              some parts of the site will not then work. These cookies do not store any
              personally identifiable information.
              `
              : 
              `
              These cookies are necessary for our website to function properly and cannot be switched off in our systems.
              They are usually only set in response to actions made by you which amount to a
              request for services, such as setting your privacy preferences, logging in or filling in forms or where
              they're essential to provide you with a service you have requested. You cannot
              opt-out of these cookies. You can set your browser to block or alert you about these cookies, but if you do,
              some parts of the site will not then work. These cookies do not store any
              personally identifiable information.
              `
            )}
            </div>
          </div>
          <div class="p-0 pt-3 pb-1 d-flex justify-content-between align-items-center">
            <div>
              <a class="btn p-0 d-flex justify-content-start align-items-center" data-bs-toggle="collapse"
                href="#collapseCookieInfo2" role="button" aria-expanded="false" aria-controls="collapseCookieInfo2">
                <span class="me-2">${(pageLanguage == "fr" ? "Performance Cookies" : "Performance Cookies")}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                  class="bi bi-question-circle-fill mt-1" viewBox="0 0 16 16">
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.496 6.033h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247zm2.325 6.443c.61 0 1.029-.394 1.029-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94 0 .533.425.927 1.01.927z" />
                </svg>
              </a>
            </div>
            <div class="form-check form-switch" style="transform: scale(1.5)">
              <input class="form-check-input" type="checkbox" id="switchCookie2" name="darkmode" value="yes"
              ${(_cookie_pref[0] == "1" ? "checked" : "")} />
            </div>
          </div>
          <div class="collapse" id="collapseCookieInfo2">
            <div class="card card-body p-0 border-0">
              ${(pageLanguage == "fr" ? 
              `
              These cookies allow us to count visits and traffic sources so we can measure and improve the performance of
              our site. They help us to know which pages are the most and least popular and
              see how visitors move around the site, which helps us optimize your experience. All information these
              cookies collect is aggregated and therefore anonymous. If you do not allow these
              cookies we will not be able to use your data in this way.
              `
              : 
              `
              These cookies allow us to count visits and traffic sources so we can measure and improve the performance of
              our site. They help us to know which pages are the most and least popular and
              see how visitors move around the site, which helps us optimize your experience. All information these
              cookies collect is aggregated and therefore anonymous. If you do not allow these
              cookies we will not be able to use your data in this way.
              `
              )}
            </div>
            <a href="${cookiePolicyURL}">${(pageLanguage == "fr" ? "Cookie details" : "Cookie details")}</a>.
          </div>
          <div class="p-0 pt-3 pb-1 d-flex justify-content-between align-items-center">
            <div>
              <a class="btn p-0 d-flex justify-content-start align-items-center" data-bs-toggle="collapse"
                href="#collapseCookieInfo3" role="button" aria-expanded="false" aria-controls="collapseCookieInfo3">
                <span class="me-2">${(pageLanguage == "fr" ? "Functional Cookies" : "Functional Cookies")}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                  class="bi bi-question-circle-fill mt-1" viewBox="0 0 16 16">
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.496 6.033h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247zm2.325 6.443c.61 0 1.029-.394 1.029-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94 0 .533.425.927 1.01.927z" />
                </svg>
              </a>
            </div>
            <div class="form-check form-switch" style="transform: scale(1.5)">
              <input class="form-check-input" type="checkbox" id="switchCookie3" name="darkmode" value="yes"
              ${(_cookie_pref[1] == "1" ? "checked" : "")} />
            </div>
          </div>
          <div class="collapse" id="collapseCookieInfo3">
            <div class="card card-body p-0 border-0">
              ${(pageLanguage == "fr" ? 
              `
              These cookies enable the website to provide enhanced functionality and personalization. They may be set by
                us or by third party providers whose services we have added to our pages. If you
                do not allow these cookies then some or all of these services may not function properly.
              `
              : 
              `
              These cookies enable the website to provide enhanced functionality and personalization. They may be set by
                us or by third party providers whose services we have added to our pages. If you
                do not allow these cookies then some or all of these services may not function properly.
              `
              )}
            </div>
            <a href="${cookiePolicyURL}">${(pageLanguage == "fr" ? "Cookie details" : "Cookie details")}</a>
          </div>
          <div class="p-0 pt-3 pb-1 d-flex justify-content-between align-items-center">
            <div>
              <a class="btn p-0 d-flex justify-content-start align-items-center" data-bs-toggle="collapse"
                href="#collapseCookieInfo4" role="button" aria-expanded="false" aria-controls="collapseCookieInfo4">
                <span class="me-2">${(pageLanguage == "fr" ? "Targeting Cookies" : "Targeting Cookies")}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                  class="bi bi-question-circle-fill mt-1" viewBox="0 0 16 16">
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.496 6.033h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247zm2.325 6.443c.61 0 1.029-.394 1.029-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94 0 .533.425.927 1.01.927z" />
                </svg>
              </a>
            </div>
            <div class="form-check form-switch" style="transform: scale(1.5)">
              <input class="form-check-input" type="checkbox" id="switchCookie4" name="darkmode" value="yes"
              ${(_cookie_pref[2] == "1" ? "checked" : "")} />
            </div>
          </div>
          <div class="collapse" id="collapseCookieInfo4">
            <div class="card card-body p-0 border-0">
              ${(pageLanguage == "fr" ? 
              `
              These cookies may be set through our site by our advertising partners. They may be used by those companies
              to build a profile of your interests and show you relevant adverts on other
              sites. They do not store directly personal information but are based on uniquely identifying your browser
              and internet device. If you do not allow these cookies, you will experience less
              targeted advertising.
              `
              : 
              `
              These cookies may be set through our site by our advertising partners. They may be used by those companies
              to build a profile of your interests and show you relevant adverts on other
              sites. They do not store directly personal information but are based on uniquely identifying your browser
              and internet device. If you do not allow these cookies, you will experience less
              targeted advertising.
              `
              )}
            </div>
            <a href=""${cookiePolicyURL}"">${(pageLanguage == "fr" ? "Cookie details" : "Cookie details")}</a>
          </div>
        </div>
        <div class="modal-footer border-0">
          <button type="button" class="btn btn-primary" id="cookiesCustomOptBtn"
            data-bs-dismiss="modal">${(pageLanguage == "fr" ? "Confirm my choices" : "Confirm my choices")}</button>
          <button type="button" class="btn btn-secondary" id="cookiesCustomAllBtn"
            data-bs-dismiss="modal">${(pageLanguage == "fr" ? "Accept all cookies" : "Accept all cookies")}</button>
          <button type="button" class="btn me-auto" style="background-color: transparent; color: blue"
            data-bs-dismiss="modal">${(pageLanguage == "fr" ? "Cancel" : "Cancel")}</button>
        </div>
      </div>
    </div>
  </div>
  `
  }
  ///// Cookie preference options
  const cookieBannerParent = document.createElement('div');
  document.body.appendChild(cookieBannerParent);
  const cookieOptionsParent = document.createElement('div');
  document.body.appendChild(cookieOptionsParent);
  let myModal;

  function showCookieOptionsModal() {
    cookie_pref = getCookiePrefCookie();
    let cookie_pref_modal = /^[01]{3}$/.test(cookie_pref) ? cookie_pref : "000";
    cookieOptionsParent.innerHTML = cookieOptionsHTML(cookie_pref_modal);

    let modalElement = document.getElementById("cookieSettingsModal");
    myModal = new bootstrap.Modal(modalElement, { backdrop: "static" });
    myModal.show();

    const cookiesCustomOptBtn = document.getElementById("cookiesCustomOptBtn");

    function handleClickOptBtn() {
      let cookiePrefTemp = (document.getElementById("switchCookie2").checked) ? '1' : '0';
      cookiePrefTemp += (document.getElementById("switchCookie3").checked) ? '1' : '0';
      cookiePrefTemp += (document.getElementById("switchCookie4").checked) ? '1' : '0';
      setCookie("cookie_pref", cookiePrefTemp, 120);
      myModal.hide();
      closeCookieBanner();
      cookiesCustomOptBtn.removeEventListener('click', handleClickOptBtn); // Remove the event listener
    }
    cookiesCustomOptBtn.addEventListener('click', throttle(handleClickOptBtn), 1000);

    const cookiesCustomAllBtn = document.getElementById("cookiesCustomAllBtn");

    function handleClickAllBtn() {
      setCookie("cookie_pref", "111", 120);
      myModal.hide();
      closeCookieBanner();
      cookiesCustomAllBtn.removeEventListener('click', handleClickAllBtn); // Remove the event listener
    }
    cookiesCustomAllBtn.addEventListener('click', throttle(handleClickAllBtn), 1000);
  };

  ///// check if not (length 3 and 0s or 1s), meaning the cookie is not good
  if (!(/^[01]{3}$/.test(cookie_pref))) {
    //// show cookie banner
    cookieBannerParent.innerHTML = cookieBannerHTML;
    document.getElementById("cookiesAcceptAllBtn").addEventListener('click', throttle(function() {
      setCookie("cookie_pref", "111", 120);
      closeCookieBanner();
    }, 1000));
  }

  function closeCookieBanner() {
    cookieBannerParent.innerHTML = "";
  };

  ///// cookie settings link
  document.querySelectorAll('.cookieSettingsBtn').forEach((element) => {
    element.addEventListener('click', throttle((event) => {
      showCookieOptionsModal()
    }, 1000));
  });
})();




/////////////////////////////////////////////////////////////////////////////////
//
/////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////
//
/////////////////////////////////////////////////////////////////////////////////