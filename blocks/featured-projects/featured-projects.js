/* eslint-disable no-use-before-define, object-curly-newline, function-paren-newline */
import { div, ul, li } from '../../scripts/dom-helpers.js';
import { slideNav } from './carousel.js';

function createSlide(row, i) {
  const $slide = li({ class: 'slide', 'data-slide': i }, row);
  return $slide;
}

export default async function decorate(block) {
  const rows = block.querySelectorAll(':scope > div > div');
  const $feature = div({ class: 'feature' },
    rows[0],
  );

  const $slides = ul({ class: 'slides', 'data-active-slide': 1 });

  Array.from(rows).splice(1).forEach((row, index) => {
    const i = index + 1;
    const $slide = createSlide(row, i);
    if (i === 1) $slide.classList.add('active');
    $slides.append($slide);
  });

  const $carousel = div({ class: 'carousel' },
    $slides,
    slideNav($slides),
  );

  block.replaceWith($feature, $carousel);
}
