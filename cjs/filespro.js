import { wsiOpenSharedSocket } from './wsi.js';
import { wsiSend } from './wsi.js';
import { wsiCurrentTabId } from './wsi.js';
import { throttle } from './base.js';


/////////////////////////////////////////////////////////////////////////////////
//  File uploads
/////////////////////////////////////////////////////////////////////////////////

export default function setupWsiFileUpload() {
  console.log('filespro module enabled');
  const pageLanguage = document.documentElement.lang;
  setTimeout(function() {
    wsiOpenSharedSocket();
  }, 0);


  const fileChunkSize = 1990; // Size of chunks
  const fileMaxNbChunks = 100;
  const fileMaxSize = 10000000;

  const filePartialSize = fileChunkSize * fileMaxNbChunks; // Size of chunks
  let transferUnderway = false
  let filePortionStep = 0;
  let filePortionsArray = [];
  let fileUploadName;
  let fileA = new File([""], "");

  const fileUploadList = document.querySelector('.fileUploadList');
  const fileUploadRealInput = document.querySelector('.fileUploadRealInput');
  const fileUploadChooseBtn = document.querySelector('.fileUploadChooseBtn');
  const fileUploadChoiceTxt = document.querySelector('.fileUploadChoiceTxt');
  const fileUploadSendBtn = document.querySelector('.fileUploadSendBtn');
  const fileUploadCancelBtn = document.querySelector('.fileUploadCancelBtn');
  const fileUploadLogTxt = document.querySelector('.fileUploadLogTxt');

  if (fileUploadSendBtn) {
    fileUploadChooseBtn.addEventListener('click', throttle(function() {
      fileUploadRealInput.click();
    }, 1000));
    fileUploadRealInput.addEventListener('change', function() {
      fileA = fileUploadRealInput.files[0];
      updateFileUploadChoiceTxt();
    });
    fileUploadSendBtn.addEventListener('click', throttle(function() {
      sendFileWsi("manual");
    }, 1000));
    fileUploadCancelBtn.addEventListener('click', throttle(function() {
      if (transferUnderway) {
        transferUnderway = false
        if (pageLanguage == "fr") {
          fileUploadLog('\u2716' + " Envoie du fichier cancellé. ");
        } else {
          fileUploadLog('\u2716' + " Sending file was canceled. ");
        }
        fileUploadChooseBtn.disabled = false;
        fileUploadSendBtn.disabled = false;
        fileUploadCancelBtn.disabled = false;
        filePortionStep = 0;
        wsiSend('f' + wsiCurrentTabId + "c");
      } else {
        fileUploadLog("");
        clearSelectionFileUpload();
      };
    }, 1500));
  };

  function fileUploadLog(log_str) {
    if (fileUploadLogTxt) {
      fileUploadLogTxt.innerHTML = log_str;
    };
    console.log(log_str);
  };

  function updateFileUploadChoiceTxt() {
    if (fileUploadRealInput.value) {
      if (validate_file()) {
        fileUploadChoiceTxt.innerHTML = fileA.name;
        fileUploadSendBtn.disabled = false;
        fileUploadCancelBtn.disabled = false;
        if (pageLanguage == "fr") {
          fileUploadLog('\uD83D\uDCC4' + " Fichier sélectionné. ");
        } else {
          fileUploadLog('\uD83D\uDCC4' + " File selected. ");
        };
      };
    } else {
      if (pageLanguage == "fr") {
        fileUploadChoiceTxt.innerHTML = 'Pas de fichier choisi.';
      } else {
        fileUploadChoiceTxt.innerHTML = 'No file chosen, yet.';
      };
    };
  };

  function validate_file() {
    if (is_valid_filename(fileA.name)) {
      if (fileA.size < fileMaxSize) {
        return true;
      } else {
        if (pageLanguage == "fr") {
          fileUploadLog('\u26A0' + ' Le fichier est trop large.');
        } else {
          fileUploadLog('\u26A0' + ' File size is too large.');
        };
      };
    } else {
      if (pageLanguage == "fr") {
        fileUploadLog('\u26A0' + ' Nom de fichier invalide.');
      } else {
        fileUploadLog('\u26A0' + ' Invalid file name.');
      };
    };
    return false;
  };

  function errorFileUpload(strError) {
    switch (strError) {
      case 'file already exists':
        if (pageLanguage == "fr") {
          fileUploadLog('\u26A0' + ' Le fichier est déjà partagé.');
        } else {
          fileUploadLog('\u26A0' + ' The file is already shared.');
        };
        break;
      case 'insufficient remaining space':
        if (pageLanguage == "fr") {
          fileUploadLog('\u26A0' + ' Espace insuffisant.');
        } else {
          fileUploadLog('\u26A0' + ' Insufficient space.');
        };
        break;
      case 'wait a cooldown period':
        if (pageLanguage == "fr") {
          fileUploadLog('\u26A0' + ' Veuillez essayer plus tard.');
        } else {
          fileUploadLog('\u26A0' + ' Please try again later.');
        };
        break;
      default:
        if (pageLanguage == "fr") {
          fileUploadLog('Erreur en envoyant le fichier.');
        } else {
          fileUploadLog('Error while sending file.');
        };
    }
    if (fileUploadSendBtn) {
      fileUploadChooseBtn.disabled = false;
      fileUploadSendBtn.disabled = false;
    };
    filePortionStep = 0;
    transferUnderway = false;
  };

  function clearSelectionFileUpload() {
    if (fileUploadSendBtn) {
      fileUploadRealInput.value = "";
      updateFileUploadChoiceTxt();
      fileUploadChooseBtn.disabled = false;
      fileUploadSendBtn.disabled = true;
      fileUploadCancelBtn.disabled = true;
    };
    filePortionStep = 0;
    transferUnderway = false;
  };

  function sendFileWsi(upload_type) {
    if (validate_file()) {
      if (fileUploadSendBtn) {
        fileUploadChooseBtn.disabled = true;
        fileUploadSendBtn.disabled = true;
      };
      fileUploadName = fileA.name;
      filePortionStep = 0;
      filePortionsArray = dividePortionsArray();
      transferUnderway = true;
      wsiSend('f' + wsiCurrentTabId + 's' + JSON.stringify({ upload_type: upload_type, file_name: fileA.name, file_size: fileA.size }));
    };
  };

  function sendFilePartialUpload() {
    try {
      if (transferUnderway) {
        let chunksNb = Math.ceil(filePortionsArray[filePortionStep][2] / fileChunkSize); // Number of chunks
        let chunkId = 0; // Start with the first chunk
        let percentage = Math.floor(filePortionStep / filePortionsArray.length * 100).toString() + ' %';
        if (pageLanguage == "fr") {
          fileUploadLog('\u231B' + " Envoie du fichier en cours.  " + percentage);
        } else {
          fileUploadLog('\u231B' + " Sending file in progress.  " + percentage);
        };

        function readNextChunk() {
          return new Promise((resolve, reject) => {
            if (chunkId < chunksNb && transferUnderway) {
              let start = filePortionsArray[filePortionStep][0] + chunkId * fileChunkSize;
              let end = Math.min(start + fileChunkSize, filePortionsArray[filePortionStep][1] + 1);
              let blob = fileA.slice(start, end); // Create a blob representing the chunk
              let reader = new FileReader();
              reader.onloadend = function(evt) {
                if (evt.target.readyState == FileReader.DONE) { // When the chunk is read
                  // make the byte array with [Chunk id (4 bytes int) + File byte array (rest of the bytes)]
                  let buffer = new ArrayBuffer(4),
                    view = new DataView(buffer);
                  view.setInt32(0, chunkId, true);
                  let resultByteLength = evt.target.result.byteLength,
                    arrayBuffer = new Uint8Array(view.byteLength + resultByteLength);
                  arrayBuffer.set(new Uint8Array(view.buffer));
                  arrayBuffer.set(new Uint8Array(evt.target.result), view.byteLength);
                  wsiSend(arrayBuffer);
                  chunkId++;
                  resolve(readNextChunk()); // Resolve the promise with the next recursive call
                }
              };
              reader.readAsArrayBuffer(blob);
            } else {
              resolve(); // Resolve the promise when there are no more chunks to read
            };
          });
        };
        readNextChunk().then(() => {
          if (filePortionStep == filePortionsArray.length - 1) {
            transferUnderway = false;
          } else {
            filePortionStep++;
          };
        });
      };
    } catch (error) {
      // console.error(error);
    };
  };

  function receivedConfirmationSuccessfull(message) {
    if (avatar) { avatar.resetButtons(message) };
    if (pageLanguage == "fr") {
      fileUploadLog('\u2713' + " Envoie réeussi de: " + fileUploadName);
    } else {
      fileUploadLog('\u2713' + " Sent successfully: " + fileUploadName);
    };
    clearSelectionFileUpload();
  };

  function is_valid_filename(filename) {
    // Check if filename starts with alphanumeric or underscore, followed by alphanumeric, underscore, hyphen, and contains only one dot
    // Check if extension is alphanumeric
    let filenameRegex = /^\w[\w\s-]*\S\.\w+$/;
    if (!filenameRegex.test(filename)) { return false; };
    if (filename.length > 50) { return false; };
    // Check if extension is present and not too long
    let extension = filename.split('.').pop();
    if (!extension || extension.length < 3 || extension.length > 5) { return false; };
    return true;
  };

  // sets a 2d Array with start position, end position and length for each portion of the file
  // ex 10 and 3 will output  [[0, 2, 3], [3, 5, 3], [6, 8, 3], [9, 9, 1]]
  function dividePortionsArray() {
    let quotient = Math.floor(fileA.size / filePartialSize);
    let remainder = fileA.size % filePartialSize;
    let start = 0;
    let portions = [];
    for (let i = 0; i < quotient; i++) {
      let end = start + filePartialSize;
      portions.push([start, end - 1, filePartialSize]);
      start = end;
    };
    if (remainder != 0) {
      portions.push([start, start + remainder - 1, remainder]);
    };
    return portions;
  };

  function updateListOfFilesFromData(data) {
    let fileMetaList = JSON.parse(data);
    let ulItems = fileMetaList.map(fileMeta => {
      return `<li>${fileMeta.file_name}</li>`;
    });
    let ulString = `<ul>${ulItems.join('')}</ul>`;
    fileUploadList.innerHTML = ulString;
  };

  function wsiToFilesproAskForListOfFiles() {
    wsiSend('f' + wsiCurrentTabId + "u");
  };

  function wsiToFilesproMessageReceived(message) {
    let message_ = message.substring(1)
    switch (message[0]) {
      case 'u':
        if (fileUploadList) { updateListOfFilesFromData(message_); };
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
  };


  /////////////////////////////////////////////////////////////////////////////////
  //  Avatar functions
  /////////////////////////////////////////////////////////////////////////////////
  const fileUploadSendAvatarBtn = document.querySelector('.fileUploadSendAvatarBtn');
  if (fileUploadSendAvatarBtn) {
    var avatar = setupAvatar()
  };

  function setupAvatar() {
    const imageViewerFileChooseBtn = document.querySelector('.imageViewerFileChooseBtn');
    const imageViewerInitialImage = document.querySelector('.imageViewerInitialImage');

    // Send the result avatar using filespro
    fileUploadSendAvatarBtn.addEventListener('click', throttle(function() {
      const canvas = document.querySelector('.image_viewer_canvas');
      let imgsrc = canvas.toDataURL("image/png");
      let blob = dataURLtoBlob(imgsrc);
      fileA = new File([blob], 'avatar.png', {
        type: "image/png",
        lastModified: new Date(),
      });
      console.log('file size', fileA.size);
      fileUploadSendAvatarBtn.disabled = true
      imageViewerFileChooseBtn.disabled = true;
      sendFileWsi("avatar");
    }, 1000));

    function dataURLtoBlob(dataurl) {
      let arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], {
        type: mime
      });
    };

    function resetButtons(message) {
      imageViewerInitialImage.src = message;
      imageViewerInitialImage.hidden = false;
      fileUploadSendAvatarBtn.disabled = false;
      imageViewerFileChooseBtn.disabled = false;
    };
    return {
      resetButtons: resetButtons,
    };
  };

  return {
    wsiToFilesproAskForListOfFiles: wsiToFilesproAskForListOfFiles,
    wsiToFilesproMessageReceived: wsiToFilesproMessageReceived,
  };
};