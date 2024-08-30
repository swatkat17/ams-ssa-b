/* eslint-disable no-use-before-define, object-curly-newline, function-paren-newline */
import { div } from '../../scripts/dom-helpers.js';
// import { createOptimizedPicture } from '../../scripts/aem.js';
import { scrollFadeOut } from '../../scripts/animations.js';
import { setBackgroundImage } from '../../scripts/utils.js';

export default function decorate(block) {
  // format entire page as parallax
  const parallaxPageContent = div({ id: 'parallax-page-content' });
  const parallaxPageWrapper = div({ id: 'parallax-page-wrapper' },
    parallaxPageContent,
  );

  // Move all existing body content into the wrapper
  while (document.body.firstChild) {
    parallaxPageContent.appendChild(document.body.firstChild);
  }

  // Append the wrapper back to the body
  document.body.appendChild(parallaxPageWrapper);

  const $parallax = div({ id: 'parallax' });
  let $content;

  [...block.children].forEach((row, i) => {
    if (i === 0) {
      $content = div({ class: 'layer content-0' }, row.childNodes[1]);
      $parallax.append($content);
    } else {
      const imgSrc = row.querySelector('img').src;
      // const optImg = createOptimizedPicture(imgSrc, 'alt', true, [{ width: '1400px' }]);
      // const $img = div({ class: `p img-${i}` }, optImg);
      const $img = div({ class: `layer img-${i}` });
      setBackgroundImage($img, imgSrc, [{ width: '200px' }]);
      $parallax.append($img);
    }
  });

  const $overlay = div({ class: 'overlay' });

  $parallax.append($overlay);

  // clean up unused items
  block.remove();
  document.querySelector('main .parallax-wrapper').remove();
  document.querySelector('main > .section').classList.remove('parallax-container');
  parallaxPageWrapper.prepend($parallax);

  // add class loaded after 300ms to $featured
  setTimeout(() => {
    $parallax.classList.add('loaded');
    scrollFadeOut($content, -120);
  }, 400);
}
