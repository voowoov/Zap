import { wsiOpenSharedSocket } from './wsi.js';
import { wsiSend } from './wsi.js';
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
    wsiOpenSharedSocket();
  }, 0);

  const fileUploadCancelBtn = document.querySelector('.fileUploadCancelBtn');
  const fileUploadLogTxt = document.querySelector('.fileUploadLogTxt');

  function wsiToChatMessageReceived(message) {
    let message_ = message.substring(1)
    switch (message[0]) {
      case 'u':
        if (fileUploadList) { updateListOfFilesFromJson(message_); };
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
      wsiSend('c' + wsiCurrentTabId + "u" + pageLanguage);
    } catch (error) {
      console.error(error);
    };
  };

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Offcanvas Lobby
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  var offcanvasElement = document.getElementById('chatOffcanvasId')
  var bsOffcanvas = new bootstrap.Offcanvas(offcanvasElement)
  bsOffcanvas.show()

  return {
    askForListOfSessions: askForListOfSessions,
    wsiToChatMessageReceived: wsiToChatMessageReceived,
  };
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Proof of work
// difficulty: 4: easy, 5: few seconds, 6: 1.5 min
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function doProofOfWork(challenge, difficulty) {
  if (window.Worker) {
    var worker = new Worker('/static/js/pow_worker.js');
    worker.onmessage = function(event) {
      sendSHAsolution(event.data);
    };
    worker.postMessage(difficulty.toString() + challenge);
  } else {
    console.log('Web Workers are not supported in your browser.');
  }
}

function sendSHAsolution(solution) {
  console.log("send", solution)
}
///// run the calculation to find a hash, it makes a Web Worker
// doProofOfWork("PgBzYzUrhecgNP9", 4);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////