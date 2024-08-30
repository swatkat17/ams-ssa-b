import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { div } from '../../scripts/dom-helpers.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  block.append(footer);

  const $hackathonModal = div(
    { class: 'hackathon-modal' },
    'This site was developed for the 2024 Hackathon. '
    + 'It\'s a POC and is best viewed on a desktop. '
    + 'Mobile styles still need some tweaking. '
    + 'Thanks for looking!  :-)',
  );
  const $hackathonOverlay = div({ class: 'hackathon-overlay' });
  const body = document.querySelector('body');
  body.append($hackathonModal, $hackathonOverlay);
}
