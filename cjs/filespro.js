import { wsiOpenSharedSocket } from './wsi.js';
import { wsiSend } from './wsi.js';
import { wsiCurrentTabId } from './wsi.js';

/////////////////////////////////////////////////////////////////////////////////
//  File uploads
/////////////////////////////////////////////////////////////////////////////////
const pageLanguage = document.documentElement.lang;




const fileChunkSize = 1990; // Size of chunks
const fileMaxNbChunks = 100;
const fileMaxSize = 10000000;

const filePartialSize = fileChunkSize * fileMaxNbChunks; // Size of chunks
let filePortionStep = 0;
let filePortionsArray = [];
let fileUploadName;

const fileUploadListTxt = document.getElementById('fileUploadListTxt')
const fileUploadRealInput = document.getElementById('fileUploadRealInput');
const fileUploadChooseBtn = document.getElementById('fileUploadChooseBtn');
const fileUploadChoiceTxt = document.getElementById('fileUploadChoiceTxt');
const fileUploadSendBtn = document.getElementById('fileUploadSendBtn');
const fileUploadCancelBtn = document.getElementById('fileUploadCancelBtn');
const fileUploadLogTxt = document.getElementById('fileUploadLogTxt')

export function wsiToFilesproAskForListOfFiles() {
  wsiSend('f' + wsiCurrentTabId + "u");
}
export function wsiToFilesproMessageReceived(message) {

  switch (message[0]) {
    case 'u':
      updateListOfFilesFromData(message.substring(1));
      break;
    case 'a':
      sendFilePartialUpload();
      break;
    case 'r':
      receivedConfirmationUpload();
      break;
    case 'e':
      errorFileUpload(message.substring(1));
      break;
  }
}


fileUploadChooseBtn.addEventListener('click', function() {
  fileUploadRealInput.click();
});
fileUploadRealInput.addEventListener('change', function() {
  updateFileUploadChoiceTxt()
});

function updateFileUploadChoiceTxt() {
  if (fileUploadRealInput.value) {
    let fileName = fileUploadRealInput.value.split('\\').pop();
    if (is_valid_filename(fileName)) {
      fileUploadChoiceTxt.innerHTML = fileName;
      fileUploadSendBtn.disabled = false;
      fileUploadCancelBtn.disabled = false;
      if (pageLanguage == "fr") {
        fileUploadLogTxt.innerHTML = '\uD83D\uDCC4' + " Fichier sélectionné. ";
      } else {
        fileUploadLogTxt.innerHTML = '\uD83D\uDCC4' + " File selected. ";
      }
    } else {
      if (pageLanguage == "fr") {
        fileUploadLogTxt.innerHTML = '\u26A0' + ' Nom de fichier invalide.';
      } else {
        fileUploadLogTxt.innerHTML = '\u26A0' + ' Invalid file name.';
      }
    }
  } else {
    if (pageLanguage == "fr") {
      fileUploadChoiceTxt.innerHTML = 'Pas de fichier choisi.';
    } else {
      fileUploadChoiceTxt.innerHTML = 'No file chosen, yet.';
    }
  }
}

function errorFileUpload(strError) {
  switch (strError) {
    case 'file already exists':
      if (pageLanguage == "fr") {
        fileUploadLogTxt.innerHTML = '\u26A0' + ' Le fichier est déjà partagé. ';
      } else {
        fileUploadLogTxt.innerHTML = '\u26A0' + ' The file is already shared. ';
      }
      break;
    default:
      if (pageLanguage == "fr") {
        fileUploadLogTxt.innerHTML = 'Erreur en envoyant le fichier.';
      } else {
        fileUploadLogTxt.innerHTML = 'Error while sending file.';
      }
  }
  fileUploadChooseBtn.disabled = false;
  fileUploadSendBtn.disabled = false;
  filePortionStep = 0;
  filePortionsArray = [];
}

function clearSelectionFileUpload() {
  fileUploadRealInput.value = ""
  updateFileUploadChoiceTxt()
  fileUploadChooseBtn.disabled = false;
  fileUploadSendBtn.disabled = true;
  fileUploadCancelBtn.disabled = true;
  filePortionStep = 0;
  filePortionsArray = [];
}

fileUploadCancelBtn.addEventListener('click', throttle(function() {

  if (filePortionsArray.length > 0) {
    if (pageLanguage == "fr") {
      fileUploadLogTxt.innerHTML = '\u2716' + " Envoie du fichier cancellé. ";
    } else {
      fileUploadLogTxt.innerHTML = '\u2716' + " Sending file was canceled. ";
    }
    fileUploadChooseBtn.disabled = false;
    fileUploadSendBtn.disabled = false;
    fileUploadCancelBtn.disabled = false;
    filePortionStep = 0;
    filePortionsArray = [];
    wsiSend('f' + wsiCurrentTabId + "c");
  } else {
    fileUploadLogTxt.innerHTML = ""
    clearSelectionFileUpload()
  }
}, 2000));

fileUploadSendBtn.addEventListener('click', function() {
  var x = fileUploadRealInput;
  if ('files' in x) {
    if (x.files.length == 1) {
      var file = x.files[0];
      if (is_valid_filename(file.name)) {
        if (file.size < fileMaxSize) {
          fileUploadChooseBtn.disabled = true;
          fileUploadSendBtn.disabled = true;
          fileUploadName = file.name
          filePortionStep = 0
          filePortionsArray = dividePortionsArray(file.size, filePartialSize);
          wsiSend('f' + wsiCurrentTabId + 's' + JSON.stringify({ file_name: file.name, file_size: file.size }));
        } else {
          alert("The file is too large.")
        }
      } else {
        alert("Invalid file name.")
      }
    }
  }
});

function sendFilePartialUpload() {
  try {
    const file = fileUploadRealInput.files[0]; // Get file from file input
    var chunksNb = Math.ceil(filePortionsArray[filePortionStep][2] / fileChunkSize); // Number of chunks
    var chunkId = 0; // Start with the first chunk
    var percentage = Math.floor(filePortionStep / filePortionsArray.length * 100).toString() + ' %';
    if (pageLanguage == "fr") {
      fileUploadLogTxt.innerHTML = '\u231B' + " Envoie du fichier en cours.  " + percentage;
    } else {
      fileUploadLogTxt.innerHTML = '\u231B' + " Sending file in progress.  " + percentage;
    }

    function readNextChunk() {
      return new Promise((resolve, reject) => {
        if (chunkId < chunksNb) {
          var start = filePortionsArray[filePortionStep][0] + chunkId * fileChunkSize;
          var end = Math.min(start + fileChunkSize, filePortionsArray[filePortionStep][1] + 1);
          var blob = file.slice(start, end); // Create a blob representing the chunk
          var reader = new FileReader();
          reader.onloadend = function(evt) {
            if (evt.target.readyState == FileReader.DONE) { // When the chunk is read
              // make the byte array with [Chunk id (4 bytes int) + File byte array (rest of the bytes)]
              var buffer = new ArrayBuffer(4),
                view = new DataView(buffer);
              view.setInt32(0, chunkId, true);
              var resultByteLength = evt.target.result.byteLength,
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
        }
      });
    }
    readNextChunk().then(() => {
      filePortionStep++;
    });
  } catch (error) {
    // console.error(error);
  }
}

function receivedConfirmationUpload() {
  if (pageLanguage == "fr") {
    fileUploadLogTxt.innerHTML = '\u2713' + " Envoie réeussi de " + fileUploadName;
  } else {
    fileUploadLogTxt.innerHTML = '\u2713' + " Sent successfully " + fileUploadName;
  }
  clearSelectionFileUpload()
}

function is_valid_filename(filename) {
  // Check if filename starts with alphanumeric or underscore, followed by alphanumeric, underscore, hyphen, and contains only one dot
  // Check if extension is alphanumeric
  let filenameRegex = /^\w[\w\s-]*\S\.\w+$/;
  if (!filenameRegex.test(filename)) {
    return false;
  }
  if (filename.length > 50) {
    return false;
  }
  // Check if extension is present and not too long
  let extension = filename.split('.').pop();
  if (!extension || extension.length < 3 || extension.length > 5) {
    return false;
  }
  return true;
}

// sets a 2d Array with start position, end position and length for each portion of the file
// ex 10 and 3 will output  [[0, 2, 3], [3, 5, 3], [6, 8, 3], [9, 9, 1]]
function dividePortionsArray(fullSize, partialSize) {
  var quotient = Math.floor(fullSize / partialSize);
  var remainder = fullSize % partialSize;
  var start = 0;
  var portions = [];
  for (var i = 0; i < quotient; i++) {
    var end = start + partialSize;
    portions.push([start, end - 1, partialSize]);
    start = end;
  }
  if (remainder != 0) {
    portions.push([start, start + remainder - 1, remainder]);
  }
  return portions;
}

function updateListOfFilesFromData(data) {
  let fileMetaList = JSON.parse(data);

  let ulItems = fileMetaList.map(fileMeta => {
    return `<li>${fileMeta.file_name}</li>`;
  });

  let ulString = `<ul>${ulItems.join('')}</ul>`;
  fileUploadListTxt.innerHTML = ulString
};

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

setTimeout(function() {
  wsiOpenSharedSocket();
}, 0);