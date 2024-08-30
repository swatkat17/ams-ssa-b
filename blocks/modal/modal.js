/* eslint-disable no-use-before-define, object-curly-newline, function-paren-newline */
import { div, dialog, button, span, iframe } from '../../scripts/dom-helpers.js';
import { loadCSS } from '../../scripts/aem.js';

/*
  This is not a traditional block, so there is no decorate function.
  Instead, links to a /modals/ & /projects/ paths are automatically transformed into a modal.
*/

function showIframe(iFrame) {
  function setIframeHeight() {
    const iframeDoc = iFrame.contentDocument || iFrame.contentWindow?.document;

    if (iframeDoc) {
      const contentHeight = iframeDoc.body.scrollHeight;
      iFrame.style.height = `${contentHeight}px`;
      iFrame.parentElement.parentElement.classList.add('appear');
    } else {
      console.warn('Iframe document is not accessible.');
    }
  }

  iFrame.onload = function () {
    setIframeHeight();

    const iframeDoc = iFrame.contentDocument || iFrame.contentWindow?.document;
    if (iframeDoc) {
      const observer = new MutationObserver(setIframeHeight);
      observer.observe(iframeDoc.body, { childList: true, subtree: true });
    }

    window.addEventListener('resize', setIframeHeight);
  };

  iFrame.onerror = function () {
    console.error('Error loading iframe content.');
  };
}

export async function createModal(path) {
  await loadCSS(`${window.hlx.codeBasePath}/blocks/modal/modal.css`);
  const $dialog = dialog();

  const $content = div({ class: 'content' });
  const iFrame = iframe({ src: path });
  $content.append(iFrame);

  const $closeBtn = button({ class: 'close-button' }, span({ class: 'icon icon-close' }));

  $dialog.append($closeBtn, $content);
  document.body.append($dialog);

  showIframe(iFrame);

  function closeDialog() {
    document.body.classList.add('modal-close');

    setTimeout(() => {
      $dialog.classList.remove('appear');
    }, 200);

    // wait for animations to complete
    setTimeout(() => {
      $dialog.remove();
      document.body.classList.remove('modal-open');
      // remove this last to prevent page jump
      document.body.classList.remove('modal-close');
    }, 1000);
  }

  $closeBtn.addEventListener('click', closeDialog);

  // close on click outside the dialog
  $dialog.addEventListener('click', (e) => {
    const { left, right, top, bottom } = $dialog.getBoundingClientRect();
    const { clientX, clientY } = e;
    if (clientX < left || clientX > right || clientY < top || clientY > bottom) closeDialog();
  });

  return {
    showModal: () => {
      $dialog.showModal();
      document.body.classList.add('modal-open');
    },
  };
}

export async function openModal(modalPath) {
  const path = modalPath.startsWith('http')
    ? new URL(modalPath, window.location).pathname
    : modalPath;

  const { showModal } = await createModal(path);
  showModal();
}
