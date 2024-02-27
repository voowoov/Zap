////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Proof of work
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

importScripts('https://cdnjs.cloudflare.com/ajax/libs/jsSHA/3.3.1/sha256.min.js');

self.onmessage = function(event) {
  let difficulty = parseInt(event.data.charAt(0))
  var challenge = event.data.substring(1);
  let firstCharacters = '0'.repeat(difficulty);
  var answer = 0;
  var hash = '';
  do {
    var shaObj = new jsSHA("SHA-256", "TEXT");
    shaObj.update(challenge + answer);
    hash = shaObj.getHash("HEX");
    answer++;
  } while (hash.substring(0, difficulty) !== firstCharacters); // Adjust difficulty as needed
  postMessage(answer - 1);
};