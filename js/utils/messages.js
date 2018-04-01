/**
 * @desc Display message on all screen.
 * @param {string} textMessage - The message to display.
*/
function displayMessage(textMessage = 'Not found :(') {
  const message = document.createElement('div');
  message.setAttribute('id', 'message');
  const p = document.createElement('p');
  const text = document.createTextNode(textMessage);
  p.appendChild(text);
  message.appendChild(p);

  const body = document.querySelector('body');
  body.insertBefore(message, body.firstChild);

  window.setTimeout(() => {
    const message = document.querySelector('#message');
    message.parentNode.removeChild(message);
  }, 5000);
}