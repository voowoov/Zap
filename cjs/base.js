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

function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    };
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    };
  };
  return "";
};

/////////////////////////////////////////////////////////////////////////////////
// Cookie banner and custom options
/////////////////////////////////////////////////////////////////////////////////
(function() {
  const cookiesBannerDiv = document.getElementById("cookiesBannerDiv");
  if (cookiesBannerDiv) {
    function closeCookieBanner() {
      if (cookiesBannerDiv.style.display !== "none") {
        cookiesBannerDiv.style.display = "none";
      } else {
        cookiesBannerDiv.style.display = "block";
      };
    };
    document.getElementById("cookiesAcceptAllBtn").addEventListener('click', throttle(function() {
      setCookie("cookie_pref", "111", 120);
      closeCookieBanner();
    }, 1000));
    // Cookie custom options
    document.getElementById("cookiesCustomAllBtn").addEventListener('click', throttle(function() {
      setCookie("cookie_pref", "111", 120);
      closeCookieBanner();
    }, 1000));
    document.getElementById("cookiesCustomOptBtn").addEventListener('click', throttle(function() {
      let cookiePrefTemp = (document.getElementById("switchCookie2").checked) ? '1' : '0';
      cookiePrefTemp += (document.getElementById("switchCookie3").checked) ? '1' : '0';
      cookiePrefTemp += (document.getElementById("switchCookie4").checked) ? '1' : '0';
      setCookie("cookie_pref", cookiePrefTemp, 120);
      closeCookieBanner();
    }, 1000));
  };
})();
// Cookie banner


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
//
/////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////
//
/////////////////////////////////////////////////////////////////////////////////


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