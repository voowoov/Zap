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

  /////////////////////////////////////////////////////////////////////////////////
  // could be already open
  /////////////////////////////////////////////////////////////////////////////////
  setTimeout(function() {
    wsiOpenSharedSocket();
  }, 0);

  const fileChunkSize = 1990; // Size of each chunk (in bytes)
  const fileMaxNbChunks = 100; // chunks per batch
  const fileMaxSize = 10000000;

  const filePartialSize = fileChunkSize * fileMaxNbChunks; // in bytes
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

  function wsiToFilesproMessageReceived(message) {
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
  };

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
        fileUploadLog('\u2716 ' + (pageLanguage == "fr" ? "Envoie du fichier cancellé." : "Sending file was canceled."));
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
        fileUploadLog('\uD83D\uDCC4 ' + (pageLanguage == "fr" ? "Fichier sélectionné." : "File selected."));
      };
    } else {
      fileUploadChoiceTxt.innerHTML = pageLanguage == "fr" ? "Pas de fichier choisi." : "No file chosen, yet!.";
      fileUploadChooseBtn.disabled = false;
      fileUploadSendBtn.disabled = true;
      fileUploadCancelBtn.disabled = true;
    };
  };
  if (fileUploadRealInput) { updateFileUploadChoiceTxt(); }

  function validate_file() {
    if (isValidFilename(fileA.name)) {
      if (fileA.size < fileMaxSize) {
        return true;
      } else {
        fileUploadLog('\u26A0 ' + (pageLanguage == "fr" ? "Le fichier est trop large." : "File size is too large."));
      };
    } else {
      fileUploadLog('\u26A0 ' + (pageLanguage == "fr" ? "Nom de fichier invalide." : "Invalid file name."));
    };
    return false;
  };

  function isValidFilename(filename) {
    // Check total length
    if (filename.length > 255) return false;
    // Check extension length
    let parts = filename.split(".");
    if (parts.length < 2 || parts[parts.length - 1].length < 2 || parts[parts.length - 1].length > 7) return false;
    // Check invalid characters
    let invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(filename)) return false;
    // Check for trailing spaces or periods
    if (filename[filename.length - 1] === " " || filename[filename.length - 1] === ".") return false;
    // Check for non-printable characters
    if (/[\x00-\x1F\x80-\x9F]/.test(filename)) return false;
    return true;
  }

  function errorFileUpload(strError) {
    switch (strError) {
      case 'file already exists':
        fileUploadLog('\u26A0 ' + (pageLanguage == "fr" ? "Le fichier est déjà partagé." : "The file is already shared."));
        break;
      case 'insufficient remaining space':
        fileUploadLog('\u26A0 ' + (pageLanguage == "fr" ? "Espace insuffisant." : "Insufficient space."));
        break;
      case 'wait a cooldown period':
        fileUploadLog('\u26A0 ' + (pageLanguage == "fr" ? "Veuillez essayer plus tard." : "Please try again later."));
        break;
      default:
        fileUploadLog('\u26A0 ' + (pageLanguage == "fr" ? "Erreur en envoyant le fichier." : "Error while sending file."));
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
        fileUploadLog('\u231B ' + (pageLanguage == "fr" ? "Envoie du fichier en cours." : "Sending file in progress.") + " " + percentage);

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
      console.error(error);
    };
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

  function receivedConfirmationSuccessfull(message) {
    if (avatar) { avatar.resetInterface(message) };
    if (fileUploadList) { askForListOfFiles() };
    fileUploadLog('\u2713 ' + (pageLanguage == "fr" ? "Envoie réeussi de: " : "Sent successfully: ") + fileUploadName);
    clearSelectionFileUpload();
  };

  function askForListOfFiles() {
    try {
      wsiSend('f' + wsiCurrentTabId + "u" + pageLanguage);
    } catch (error) {
      console.error(error);
    };
  };

  function updateListOfFilesFromJson(data) {
    let fileMetaList = JSON.parse(data);
    let result = ``;
    let title_download, title_viewer;
    if (pageLanguage == "fr") {
      title_download = "Télécharger";
      title_viewer = "Ouvrir dans un nouvel onglet"
    } else {
      title_download = "Download"
      title_viewer = "Open in a new tab"
    };
    for (let i = 0; i < fileMetaList.length; i++) {
      let element = fileMetaList[i];
      // Assuming the keys you're interested in are 'key1' and 'key2'
      if ('file_name' in element && 'view' in element && 'dnld' in element) {
        result += `    <div class="d-flex p-0 file_choice_row">
        <div class="d-flex justify-content-center align-items-center flex-shrink-0" style="width: 30px;">&#x1F5CE;</div>
        <div class="flex-grow-1 file_name_div">`
        if (element['view'].length > 0) {
          result += `<a class="text_color file_name_long" href="${element['view']}" draggable="false" title="${title_viewer}" target="_blank">
            ${element['file_name']}
          </a>`
        } else {
          result += `<div class="file_name_long">
            ${element['file_name']}
          </div>`
        }
        result += `</div>
        <div class="d-flex justify-content-center align-items-center flex-shrink-0" style="width: 40px;">
          <a class="file_download_button" href="${element['dnld']}" draggable="false" title="${title_download}" target="_blank"> &#x2935;</a>
        </div>
        </div>`;
      }
    }
    fileUploadList.innerHTML = result;
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

    function resetInterface(message) {
      imageViewerInitialImage.src = message;
      imageViewerInitialImage.hidden = false;
      imageViewerFileChooseBtn.disabled = false;
    };
    return {
      resetInterface: resetInterface,
    };
  };

  return {
    askForListOfFiles: askForListOfFiles,
    wsiToFilesproMessageReceived: wsiToFilesproMessageReceived,
  };
};