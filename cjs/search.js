import { wsiOpenSharedSocket, wsiSend, wsiCurrentTabId } from './wsi.js';

export function wsiToSearchSendQuery() { searchToWsiSendQuery(); };
export function wsiToSearchMessageReceived(message) { showSearchResults(message) };

const pageLanguage = document.documentElement.lang;


let screenWidthLg = 992; // Replace with your value

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
  wsiOpenSharedSocket();
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

let activatedSearchResults = false;

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





// /////////////////////////////////////////////////////////////////////////////////
// //  Nav Search websocket
// /////////////////////////////////////////////////////////////////////////////////
let navSearchStartTimer;

function showSearchResults(jsonObject) {
  navSearchStartTimer = performance.now();
  let jsonArray = JSON.parse(jsonObject);
  let ul = document.createElement("ul");
  for (let i = 0; i < jsonArray.length; i++) {
    // Create a list item element
    let li = document.createElement("li");
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

function searchToWsiSendQuery() {
  navSearchStartTimer = performance.now();
  wsiSend('s' + wsiCurrentTabId + navSearchInputTxt.value);
}

const sendWSnavSearchMessage = debounce_search(searchToWsiSendQuery, 400);

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
    }
  }
}