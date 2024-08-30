/* eslint-disable no-use-before-define, object-curly-newline, function-paren-newline */
import { button } from '../../scripts/dom-helpers.js';

export default function decorate(block) {
  updateNotes('TESTING');
}

let notesWindow;
export function speakerNotes(block) {
  const $notesBnt = button({ class: 'btn cse-notes' }, 'CSE Notes');
  block.append($notesBnt);

  $notesBnt.addEventListener('click', () => {
    // Check if the notes window is already open
    if (!notesWindow || notesWindow.closed) {
      // Open a new window
      notesWindow = window.open(
        '',
        'CSE-Notes',
        'width=600,height=400,top=100,left=100,toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no'
      );

      // Check if the new window opened successfully
      if (!notesWindow) {
        console.error('Failed to open notes window.');
        return;
      }

      // Write the initial content to the new window
      notesWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CSE Notes (not customer facing)</title>
        <link rel="stylesheet" href="/blocks/speaker-notes/speaker-notes.css">
      </head>
      <body class="speaker-notes-window">
        <h1>CSE Notes</h1>
        <h3>Here’s the deal: </h3>
        <p id="message">We’ve got some super top-secret stuff that we can chat about, but putting it in writing? Nope, that’s a no-go. Think of it like Fight Club, (but with less fighting).  The first rule? We don’t talk about Fight Club.  So, you didn’t hear it from me!  Let’s talk  😉 </p>
        <script>
          window.addEventListener('message', (event) => {
            console.log('Message received in notes window:', event.data);
            const data = event.data;
            if (data && data.message) {
              document.getElementById('message').textContent = data.message;
            }
          }, false);
        </script>
      </body>
      </html>
    `);

      // Add load event listener to ensure the window is fully loaded before sending messages
      notesWindow.addEventListener('load', () => {
        console.log('Notes window loaded');
        setTimeout(() => {
          if (notesWindow && !notesWindow.closed) {
            notesWindow.postMessage({ message: 'Adobe Confidential, do not share' }, '*');
          } else {
            console.warn('Notes window closed during load.');
          }
        }, 100); // Delay to ensure the window is fully ready
      });

    } else {
      // Update content if the window is already open
      if (notesWindow && !notesWindow.closed) {
        console.log('Sending updated content to notes window.');
        notesWindow.postMessage({ message: 'Updated content from the main window!' }, '*');
      } else {
        console.warn('Notes window is closed or not yet opened.');
      }
    }
  });
}

function updateNotes(message) {
  // console.log('Updating notes:', message);
  // Check if the notes window is open and not closed before sending a message
  if (notesWindow && !notesWindow.closed) {
    notesWindow.postMessage({ message }, '*');
  } else {
    console.warn('Notes window is closed or not yet opened.');
  }
}
