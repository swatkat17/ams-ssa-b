/* eslint-disable no-use-before-define, object-curly-newline, function-paren-newline */
import { nav, button, span } from '../../scripts/dom-helpers.js';

let slidesTotal = 0;
let isAnimating = false;
const fadeDuration = 700;

function goTo(slides, dir) {
  const currentActive = parseInt(slides.dataset.activeSlide, 10);
  // handle wrap around
  const newActive = ((currentActive + dir - 1 + slidesTotal) % slidesTotal) + 1;
  slides.dataset.activeSlide = newActive;
  return newActive;
}

export function showSlide(slides, show) {
  // wait till current animation is completed
  if (isAnimating) return;
  isAnimating = true;

  const $activeSlide = slides.querySelector(`[data-slide="${show}"]`);

  const $currentActive = slides.querySelector('.active');
  $activeSlide.classList.add('ready');
  // small delay to allow for transition to work
  setTimeout(() => $activeSlide.classList.add('transition'), 10);
  setTimeout(() => {
    $activeSlide.classList.add('active');
    $activeSlide.classList.remove('ready');
    $activeSlide.classList.remove('transition');
    $currentActive.classList.remove('active');
    isAnimating = false;
  }, fadeDuration);
}

export function slideNav(slides) {
  slidesTotal = slides.children.length;

  const $prev = button({ class: 'prev' }, '<');
  const $next = button({ class: 'next' }, '>');

  const $activeSide = span('1');
  const $position = span({ class: 'count' }, $activeSide, ` / ${slidesTotal}`);

  $prev.addEventListener('click', () => {
    const n = goTo(slides, -1);
    $activeSide.textContent = n;
    showSlide(slides, n);
  });

  $next.addEventListener('click', () => {
    const n = goTo(slides, 1);
    $activeSide.textContent = n;
    showSlide(slides, n);
  });

  return nav({ class: 'nav' }, $prev, $position, $next);
}
