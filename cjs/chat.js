import { wsiOpenWS } from './wsi.js';
import { wsiOpenSend, wsiSend } from './wsi.js';
import { wsiCurrentTabId } from './wsi.js';
import { throttle } from './base.js';

/////////////////////////////////////////////////////////////////////////////////
//  Main Chat
/////////////////////////////////////////////////////////////////////////////////

export default function setupWsiChat() {
  console.log('chat module enabled');
  const pageLanguage = document.documentElement.lang;

  /////////////////////////////////////////////////////////////////////////////////
  // open the wsi socket or access the open one
  /////////////////////////////////////////////////////////////////////////////////
  setTimeout(function() {
    askForListOfSessions();
  }, 0);


  function wsiToChatMessageReceived(message) {
    let message_ = message.substring(1)
    switch (message[0]) {
      case 'u':
        updateListOfSessionsFromJson(message_);
        break;
      case 'a':
        sendFilePartialUpload();
        break;
      case 'r':
        receivedConfirmationSuccessfull(message_);
        break;
      case 'e':
        errorFileUpload(message_);
        break;
    };
  }


  function askForListOfSessions() {
    try {
      wsiOpenSend('c' + wsiCurrentTabId + "u" + pageLanguage);
    } catch (error) {
      console.error(error);
    };
  };

  function updateListOfSessionsFromJson(data) {
    let sessionsMetaList = JSON.parse(data);
    let result = ``;
    // let title_download, title_viewer;
    // if (pageLanguage == "fr") {
    //   title_download = "Télécharger";
    //   title_viewer = "Ouvrir dans un nouvel onglet"
    // } else {
    //   title_download = "Download"
    //   title_viewer = "Open in a new tab"
    // };
    // for (let i = 0; i < fileMetaList.length; i++) {
    //   let element = fileMetaList[i];
    //   // Assuming the keys you're interested in are 'key1' and 'key2'
    //   if ('file_name' in element && 'view' in element && 'dnld' in element) {
    //     result += `    <div class="d-flex p-0 file_choice_row">
    //     <div class="d-flex justify-content-center align-items-center flex-shrink-0" style="width: 30px;">&#x1F5CE;</div>
    //     <div class="flex-grow-1 file_name_div">`
    //     if (element['view'].length > 0) {
    //       result += `<a class="text_color file_name_long" href="${element['view']}" draggable="false" title="${title_viewer}" target="_blank">
    //         ${element['file_name']}
    //       </a>`
    //     } else {
    //       result += `<div class="text_color file_name_long">
    //         ${element['file_name']}
    //       </div>`
    //     }
    //     result += `</div>
    //     <div class="d-flex justify-content-center align-items-center flex-shrink-0" style="width: 40px;">
    //       <a class="file_download_button" href="${element['dnld']}" draggable="false" title="${title_download}" target="_blank" style="text-decoration: none;"> &#x2935;</a>
    //     </div>
    //     </div>`;
    //   }
    // }
    // fileUploadList.innerHTML = result;
  };

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Offcanvas Lobby
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  let offcanvasElement = document.getElementById('chatOffcanvasId')
  let bsOffcanvas = new bootstrap.Offcanvas(offcanvasElement)
  bsOffcanvas.show()

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // 
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  return {
    askForListOfSessions: askForListOfSessions,
    wsiToChatMessageReceived: wsiToChatMessageReceived,
  };
};


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////