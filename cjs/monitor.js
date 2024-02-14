/////////////////////////////////////////////////////////////////////////////////
//  Make click event listener for each button - Functions in this module
/////////////////////////////////////////////////////////////////////////////////
Array.from(document.getElementsByClassName('monitorFunction')).forEach(el => {
  el.addEventListener('click', () => {
    let fnName = el.innerHTML; // Get the function name from the innerHTML
    if (typeof eval(fnName) === 'function') {
      eval(fnName + '()');
    }
  });
});
/////////////////////////////////////////////////////////////////////////////////
//  Make click event listener for each button - Send a WS command
/////////////////////////////////////////////////////////////////////////////////
Array.from(document.getElementsByClassName('monitorSendCommand')).forEach(el => {
  el.addEventListener('click', () => {
    sendCommand(el.innerHTML);
  });
});
/////////////////////////////////////////////////////////////////////////////////
//  
/////////////////////////////////////////////////////////////////////////////////

const commandLog = document.querySelector('#command-log');
const commandInput = document.querySelector('#command-input');
const commandSubmit = document.querySelector('#command-submit');

const webSocketURL = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') +
  window.location.host + '/monitor/';
// console.log(webSocketURL)

const monitorSocket = new WebSocket(webSocketURL);

monitorSocket.onmessage = function(e) {
  addLogRes(e.data)
};

monitorSocket.onclose = function(e) {
  console.error('Monitor socket closed unexpectedly');
};

monitorSocket.onerror = function(event) {
  if (event.code === 1009) {
    alert("The message received was too large.");
  }
};

commandInput.onkeydown = function(e) {
  if (e.key === "Enter") { // enter, return
    event.preventDefault();
    commandSubmit.click();
  }
};

commandSubmit.onclick = function(e) {
  sendCommand(commandInput.value);
  commandInput.value = '';
};

function addLogRes(log) {
  commandLog.value += ('return: ' + log + '\n');
  commandLog.scrollTop = commandLog.scrollHeight;
}

function addComlog(log) {
  commandLog.value += ('cmd: ' + log + '\n');
  commandLog.scrollTop = commandLog.scrollHeight;
}

function sendCommand(command) {
  if (command.length > 0) {
    monitorSocket.send(command);
    addComlog(command);
  }
}

function sendPacketBurstJS() {
  packetSize = parseInt(document.getElementById("wstestsize").value);
  repetitions = parseInt(document.getElementById("wstestrepetitions").value);
  delay = parseInt(document.getElementById("wstestdelay").value);
  const str1 = 'x'.repeat(packetSize);
  console.log('sending ' + repetitions + ' packets of size ' + packetSize)
  let x = 0;
  const intervalId = setInterval(() => {
    if (x === repetitions) {
      clearInterval(intervalId);
      return;
    }
    console.log(x);
    monitorSocket.send(str1);
    x++;
  }, delay);
}

function connectAndDisconnectJS() {
  repetitions = parseInt(document.getElementById("wstestrepetitions").value);
  delay = parseInt(document.getElementById("wstestdelay").value);
  let count = 0;
  const intervalId = setInterval(() => {
    if (count % 2 === 0) {
      // First command
      console.log("Connect");
      monitorSocket1 = new WebSocket(webSocketURL);
    } else {
      // Second command
      console.log("Disconnect");
      monitorSocket1.close();
    }
    count++;
    if (count === 2 * repetitions) {
      clearInterval(intervalId);
    }
  }, delay);
}

function sendBinaryMessage() {
  // Create some binary data.
  var array = new Uint8Array([1, 2, 3, 4, 5]);
  // Send the binary data.
  monitorSocket.send(array.buffer);
}

window.addEventListener('beforeunload', function(event) {
  monitorSocket.close();
});

/////////////////////////////////////////////////////////////////////////////////
// Django in-Template varibles and Ajax
/////////////////////////////////////////////////////////////////////////////////
function showMyObjectList() {
  let myURLsendRequest = JSON.parse(document.getElementById('myURLsendRequest').textContent);
  let myObjectList = JSON.parse(document.getElementById('myObjectList').textContent)
  console.log("url to ajax view: ", myURLsendRequest)
  console.log("objects: ", myObjectList)
}
////// fetch data on server
function sendAjaxRequest() {
  let myURLsendRequest = JSON.parse(document.getElementById('myURLsendRequest').textContent);
  let csrf_token = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
  let formData = new FormData();
  formData.append("csrfmiddlewaretoken", csrf_token);
  formData.append("message", "This is a fetch from js");
  fetch(myURLsendRequest, {
      method: 'POST',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      body: formData,
    }).then(response => response.json())
    .then(response => {
      console.log("json received: ", response)
    })
}