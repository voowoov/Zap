import { wsiOpenOrAccessSharedSocket, wsiSend, wsiCurrentTabId } from './wsi.js';
import { throttle } from './base.js';

/////////////////////////////////////////////////////////////////////////////////
//  Search
/////////////////////////////////////////////////////////////////////////////////

export default function setupWsiSearch() {
  const pageLanguage = document.documentElement.lang;

  let screenWidthLg = 992; // Replace with your value
  let navSearchStartTimer;

  /////////////////////////////////////////////////////////////////////////////////
  //  HTML code for search
  /////////////////////////////////////////////////////////////////////////////////
  let navSearchPlaceHolder;
  navSearchPlaceHolder = pageLanguage == "fr" ? "Rechercher" : "Search"
  const navSearchMain = document.querySelector('.navSearchMain');
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
          <input class="navSearchInputTxt" name="search_field" type="text" placeholder="${navSearchPlaceHolder}" maxlength="50"/>
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
  </div>`;

  const navSearchTriggerBtn = document.querySelector('.btn_nav__search');
  const navSearchInputTxt = navSearchMain.querySelector('.navSearchInputTxt');
  const navSearchIconLoupe = navSearchMain.querySelector('.navSearchIconLoupe');
  const navSearchBtnClearX = navSearchMain.querySelector('.navSearchBtnClearX');
  const navSearchBtnEnter = navSearchMain.querySelector('.navSearchBtnEnter');
  const navSearchBtnBack = navSearchMain.querySelector('.navSearchBtnBack');
  const navSearchBoxDiv2 = navSearchMain.querySelector('.navSearchBoxDiv2');
  const navSearchResDiv0 = navSearchMain.querySelector('.navSearchResDiv0');

  /////////////////////////////////////////////////////////////////////////////////
  //  Hide and Show search controls and results
  /////////////////////////////////////////////////////////////////////////////////
  function showSearchControl() {
    navSearchIconLoupe.style.display = "block";
    navSearchBoxDiv2.style.marginLeft = '0';
    navSearchBoxDiv2.style.paddingLeft = '25px';
    navSearchBoxDiv2.style.border = '1px solid var(--color-searchborderselect)';
    navSearchResDiv0.style.display = 'block';
    if (!window.matchMedia('(min-width: ' + screenWidthLg + 'px)').matches) {
      navSearchMain.style.display = "block";
    };
    navSearchInputTxt.focus();
    navSearchTriggerBtn.setAttribute('aria-expanded', 'true');

    // hide the main page scroll bar under a certain screen width
    if (window.innerWidth < 620) {
      document.body.style.overflowY = 'hidden';
    };
    // Unhide navSearchBtnClearX if there is text inside the input field
    if (navSearchInputTxt.value !== "") {
      navSearchBtnClearX.style.display = "flex";
    }
    wsiOpenOrAccessSharedSocket();
    searchQuery()
  }

  function hideSearchControl() {
    navSearchIconLoupe.style.display = "none";
    navSearchBoxDiv2.style.marginLeft = '25px';
    navSearchBoxDiv2.style.paddingLeft = '0';
    navSearchBoxDiv2.style.border = '1px solid var(--color-searchbutton)';
    navSearchResDiv0.style.display = 'none';
    if (!window.matchMedia('(min-width: ' + screenWidthLg + 'px)').matches) {
      navSearchMain.style.display = "none";
    };
    navSearchInputTxt.blur();
    navSearchTriggerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflowY = 'auto';
  };

  /////////////////////////////////////////////////////////////////////////////////
  //  Event listeners
  /////////////////////////////////////////////////////////////////////////////////
  function handleInputTextChange(event) {
    // Unhide navSearchBtnClearX if there is text inside the input field
    if (this.value !== "") {
      navSearchBtnClearX.style.display = "flex";
    } else {
      // Hide navSearchBtnClearX if the input field is empty
      navSearchBtnClearX.style.display = "none";
    };
    searchQuery();
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
    searchQuery();
  };
  navSearchBtnClearX.addEventListener('mouseup', handleClickOnXbutton);

  function handlePreventLeavingInput(event) {
    if (event.target !== navSearchInputTxt) {
      event.preventDefault();
    };
  };
  navSearchMain.addEventListener('mousedown', handlePreventLeavingInput);

  function handleScrollingFromMainCtn(event) {
    let delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
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
      hideSearchControl();
    };
  };
  document.addEventListener('mousedown', handleClickedOutside);

  function handleEscapeKeydown(event) {
    if (event.key === 'Escape') {
      hideSearchControl();
    };
  };
  document.addEventListener('keydown', handleEscapeKeydown);

  function handleBackButtonClick(event) {
    hideSearchControl();
  };
  navSearchBtnBack.addEventListener("click", throttle(handleBackButtonClick, 1000));

  navSearchInputTxt.addEventListener("mousedown", function() {
    if (navSearchTriggerBtn.getAttribute('aria-expanded') === 'false') {
      showSearchControl();
    };
  });

  navSearchBtnEnter.addEventListener("click", throttle(function() {
    console.log("search button click");
  }, 1000));

  navSearchTriggerBtn.addEventListener('click', function() {
    if (navSearchTriggerBtn.getAttribute('aria-expanded') === 'false') {
      showSearchControl();
    } else if (navSearchTriggerBtn.getAttribute('aria-expanded') === 'true') {
      hideSearchControl();
    };
  });

  /////////////////////////////////////////////////////////////////////////////////
  // Change the display based on windows width
  /////////////////////////////////////////////////////////////////////////////////

  function setSearchBoxDisplayPerScreenWidth() {
    if (window.matchMedia('(min-width: ' + screenWidthLg + 'px)').matches) {
      navSearchMain.style.display = "block";
    } else {
      if (navSearchMain.style.display == "block" &&
        navSearchResDiv0.style.display == "none") {
        navSearchMain.style.display = "none";
      };
    };
  };
  navSearchMain.style.display = "none";
  navSearchResDiv0.style.display = "none";
  setSearchBoxDisplayPerScreenWidth();

  window.addEventListener('resize', function() {
    setSearchBoxDisplayPerScreenWidth();
  });

  /////////////////////////////////////////////////////////////////////////////////
  //  Show results from received data
  /////////////////////////////////////////////////////////////////////////////////

  function showSearchResults(fullDict) {
    let query = fullDict["q"];
    let resultArray = fullDict["r"];
    let ul = document.createElement("ul");
    // ul.innerHTML = query
    for (let i = 0; i < resultArray.length; i++) {
      let li = document.createElement("li");
      li.innerHTML = resultArray[i].title + " (" + resultArray[i].vote + ")";
      ul.appendChild(li);
    };
    navSearchResDiv0.innerHTML = "";
    navSearchResDiv0.appendChild(ul);
    // console.log("show")
  };

  /////////////////////////////////////////////////////////////////////////////////
  //    previous search remembering to avoid sending a query
  /////////////////////////////////////////////////////////////////////////////////

  let previousSearches = []; // array of dicts

  function getPreviousSearchResult(query) {
    let index = previousSearches.findIndex(dict => dict["q"] === query);
    if (index !== -1) {
      return previousSearches[index]
    } else {
      return null;
    }
  }

  function setPreviousSearchResult(jsonObject) {
    let dict = JSON.parse(jsonObject);
    let query = dict["q"];
    if (!previousSearches.some(dict => dict["q"] === query)) {
      // Add newElement at index 1 and push the others to the right, keep element 0
      previousSearches.splice(1, 0, dict);
      if (previousSearches.length > 50) {
        array.pop();
      }
    }
  }

  /////////////////////////////////////////////////////////////////////////////////
  //    send search query logic
  /////////////////////////////////////////////////////////////////////////////////

  function makeSearchQuery() {
    let query = navSearchInputTxt.value;
    let existingSearch = getPreviousSearchResult(query);
    if (existingSearch == null) {
      navSearchStartTimer = performance.now();
      wsiSend('s' + wsiCurrentTabId + query);
    } else {
      showSearchResults(existingSearch);
    }
  }

  const searchQuery = debounce_search(makeSearchQuery, 400);

  function debounce_search(func, delay) {
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
      };
    };
  };

  function wsiToSearchReceivedResult(jsonObject) {
    setPreviousSearchResult(jsonObject);
    showSearchResults(JSON.parse(jsonObject));
  }

  /////////////////////////////////////////////////////////////////////////////////
  //    exported functions (through the main function)
  /////////////////////////////////////////////////////////////////////////////////
  return {
    makeSearchQuery: makeSearchQuery,
    wsiToSearchReceivedResult: wsiToSearchReceivedResult
  };
};

/////////////////////////////////////////////////////////////////////////////////
//    
/////////////////////////////////////////////////////////////////////////////////