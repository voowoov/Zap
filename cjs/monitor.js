/////////////////////////////////////////////////////////////////////////////////
//  Make click event listener for each button - Functions in this module
/////////////////////////////////////////////////////////////////////////////////
Array.from(document.getElementsByClassName('monitorFunction')).forEach(el => {
  el.addEventListener('click', () => {
    let fnName = el.innerHTML; // Get the function name from the innerHTML
    if (typeof eval(fnName) === 'function') {
      eval(fnName + '()');
    };
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
  addLogRes(e.data);
};

monitorSocket.onclose = function(e) {
  console.error('Monitor socket closed unexpectedly');
};

monitorSocket.onerror = function(event) {
  if (event.code === 1009) {
    alert("The message received was too large.");
  };
};

let monitor_last_commands;
let monitor_last_commands_index = -1;
const monitor_last_commands_max_length = 10;
commandInput.onkeydown = function(e) {
  switch (e.key) {
    case "Enter":
      e.preventDefault();
      commandSubmit.click();
      break;
    case "ArrowUp":
      e.preventDefault();
      monitor_last_commands = JSON.parse(localStorage.getItem('monitor_last_commands'));
      monitor_last_commands_index = Math.min(Math.max(monitor_last_commands_index + 1, -1), monitor_last_commands_max_length - 1);
      commandInput.value = monitor_last_commands_index == -1 ? "" : monitor_last_commands[monitor_last_commands_index];
      break;
    case "ArrowDown":
      e.preventDefault();
      monitor_last_commands = JSON.parse(localStorage.getItem('monitor_last_commands'));
      monitor_last_commands_index = Math.min(Math.max(monitor_last_commands_index - 1, -1), monitor_last_commands_max_length - 1);
      commandInput.value = monitor_last_commands_index == -1 ? "" : monitor_last_commands[monitor_last_commands_index];
      break;
    default:
  };
};

commandSubmit.onclick = function(e) {
  if (commandInput.value.length > 0) {
    monitor_last_commands = JSON.parse(localStorage.getItem('monitor_last_commands'));
    monitor_last_commands = monitor_last_commands.filter(item => item !== commandInput.value);
    monitor_last_commands.unshift(commandInput.value);
    if (monitor_last_commands.length > monitor_last_commands_max_length) { monitor_last_commands.splice(monitor_last_commands_max_length); };
    localStorage.setItem('monitor_last_commands', JSON.stringify(monitor_last_commands));
    monitor_last_commands_index = -1;
    sendCommand(commandInput.value);
    commandInput.value = '';
  };
};

function addLogRes(log) {
  commandLog.value += ('r: ' + log + '\n');
  commandLog.scrollTop = commandLog.scrollHeight;
};

function addComlog(log) {
  commandLog.value += (log + '\n');
  commandLog.scrollTop = commandLog.scrollHeight;
};

function sendCommand(command) {
  if (command.length > 0) {
    monitorSocket.send(command);
    addComlog(command);
  };
};

function sendPacketBurstJS() {
  let packetSize = parseInt(document.getElementById("wstestsize").value);
  let repetitions = parseInt(document.getElementById("wstestrepetitions").value);
  let delay = parseInt(document.getElementById("wstestdelay").value);
  const str1 = 'x'.repeat(packetSize);
  console.log('sending ' + repetitions + ' packets of size ' + packetSize)
  let x = 0;
  const intervalId = setInterval(() => {
    if (x === repetitions) {
      clearInterval(intervalId);
      return;
    };
    console.log(x);
    monitorSocket.send(str1);
    x++;
  }, delay);
};

function connectAndDisconnectJS() {
  let repetitions = parseInt(document.getElementById("wstestrepetitions").value);
  let delay = parseInt(document.getElementById("wstestdelay").value);
  let count = 0;
  let monitorSocket1;
  const intervalId = setInterval(() => {
    if (count % 2 === 0) {
      // First command
      console.log("Connect");
      monitorSocket1 = new WebSocket(webSocketURL);
    } else {
      // Second command
      console.log("Disconnect");
      monitorSocket1.close();
    };
    count++;
    if (count === 2 * repetitions) {
      clearInterval(intervalId);
    };
  }, delay);
};

function sendBinaryMessage() {
  // Create some binary data.
  let array = new Uint8Array([1, 2, 3, 4, 5]);
  // Send the binary data.
  monitorSocket.send(array.buffer);
};

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
    });
};

/////////////////////////////////////////////////////////////////////////////////
// 
/////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
// 
/////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
// 
/////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////
// 
/////////////////////////////////////////////////////////////////////////////////