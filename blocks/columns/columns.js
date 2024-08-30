import { createOptimizedPicture } from '../../scripts/aem.js';
// import { scrollScale } from '../../scripts/animations.js';
// todo: p5 animate sections in

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    // if row only has one child, make it full width
    if (row.children.length === 1) {
      row.children[0].classList.add('center');
      return;
    }

    // row.classList.add('scale');

    [...row.children].forEach((col, i) => {
      if (i % 2 === 0) col.classList.add('left');
      else col.classList.add('right');

      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('img-col');
        }
        const img = pic.querySelector('img');
        const newImg = createOptimizedPicture(img.src, 'alt', true, [{ width: '400px' }]);
        img.replaceWith(newImg);
      } else {
        col.classList.add('text-col');
      }
    });
  });
}
