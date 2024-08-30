export function scrollFadeOut(element, offset = 0) {
  function updateOpacity() {
    const rect = element.getBoundingClientRect();
    // const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const startFade = Math.max(rect.top + offset, 0); // Start fading with the offset applied
    const endFade = rect.bottom + offset; // Adjust the bottom by the offset as well
    const fadeRange = endFade - startFade;
    if (fadeRange <= 0) return;
    const opacity = Math.max(0, Math.min(1, fadeRange / rect.height));
    element.style.opacity = opacity.toString();
  }
  const $scrollableContainer = document.querySelector('#parallax-page-wrapper');
  $scrollableContainer.addEventListener('scroll', updateOpacity);
  updateOpacity();
}

function getMarginWidth() {
  const vw = window.innerWidth;
  const pageWidth = 1400; // match --page-width in styles.css
  // return (vw - pageWidth) / 2 + 30;
  // console.log(Math.max((vw - pageWidth) / 2 + 30, 30))
  // check margins on mobile
  const margin = Math.max((vw - pageWidth) / 2 + 30, 30);
  return margin;
}

export function scrollToMe(container, me, duration) {
  const containerRect = container.getBoundingClientRect();
  const meRect = me.getBoundingClientRect();
  const offsetLeft = meRect.left - containerRect.left + container.scrollLeft;
  const scrollStartPos = offsetLeft - getMarginWidth();
  const startPosition = container.scrollLeft;
  const distance = scrollStartPos - startPosition;
  let startTime = null;

  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    const easing = easeInOutQuad(progress);
    container.scrollLeft = startPosition + distance * easing;
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

export function fixYears(block, years) {
  // get center position
  const leftPosition = (window.innerWidth / 2) - 50;

  block.addEventListener('scroll', () => {
    const scrollLeftPos = block.scrollLeft;

    years.forEach((year) => {
      const yearLeftPos = year.offsetLeft;
      if (scrollLeftPos >= yearLeftPos - leftPosition) {
        year.classList.add('fixed');
      } else {
        year.classList.remove('fixed');
      }
    });
  });
}
