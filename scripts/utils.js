export function setBackgroundImage(element, src, breakpoints = [
  { media: '(min-width: 600px)', width: '2000' },
  { media: '(min-width: 300px)', width: '1000' },
  { width: '750' }, // Fallback/default width
]) {
  const url = new URL(src, window.location.href);
  const { pathname } = url;
  const ext = pathname.substring(pathname.lastIndexOf('.') + 1);
  const elementClass = `bg-${Math.random().toString(36).substr(2, 9)}`;

  element.classList.add(elementClass);
  const sources = [];

  breakpoints.forEach((br) => {
    const optimizedSrc = `${pathname}?width=${br.width}&format=${ext}&optimize=medium`;
    if (br.media) {
      sources.push(`@media ${br.media} { .${elementClass} { background: url('${optimizedSrc}'); } }`);
    } else {
      sources.push(`.${elementClass} { background: url('${optimizedSrc}'); }`);
    }
  });

  const style = document.createElement('style');
  style.textContent = sources.join(' ');
  document.head.appendChild(style);
}

export function bogus() {
  // do nothing
}
