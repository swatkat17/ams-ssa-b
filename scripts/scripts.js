import {
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  sampleRUM,
  getMetadata,
} from './aem.js';

function autolinkModals(element) {
  element.addEventListener('click', async (e) => {
    const origin = e.target.closest('a');

    if (
      origin
      && origin.href
      && (origin.href.includes('/modals/') || origin.href.includes('/learnmore/'))
    ) {
      e.preventDefault();
      const { openModal } = await import(`${window.hlx.codeBasePath}/blocks/modal/modal.js`);
      openModal(origin.href);
    }
  });
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * decorates external links to open in new window
 */
function decorateAnchors(element) {
  const A = element.getElementsByTagName('a');
  const As = Array.from(A).filter((a) => (a.href && !a.href.match(`^http[s]*://${window.location.host}/`)));
  if (As.length) {
    As.forEach((a) => {
      a.target = '_blank';
    });
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  decorateAnchors(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  //document.documentElement.lang = 'en';
  const userLang = navigator.language || navigator.userLanguage;
  document.documentElement.lang = userLang;
  //alert(document.documentElement.lang);

  // Create an object mapping languages to URLs
const urlMap = {
  'en': 'https://main--ams-ssa--swatkat17.hlx.live/en/', // English URL
  'fr': 'https://main--ams-ssa--swatkat17.hlx.live/fr/', // French URL
  'de': 'https://main--ams-ssa--swatkat17.hlx.live/de/', // German URL
  'default': 'https://main--ams-ssa--swatkat17.hlx.live/' 
};

// Function to get the correct URL based on the language
function getUrlForLang(language) {
  // Extract the base language (e.g., 'en', 'fr') from 'en-US', 'fr-CA', etc.
  const baseLang = language.split('-')[0];
  
  // Return the mapped URL or the default if the language is not in the map
  return urlMap[baseLang] || urlMap['default'];
}

// Get the appropriate URL for the user's language
const urlForLang = getUrlForLang(userLang);

// Display the URL or perform any redirection
console.log(`URL for user language (${userLang}): ${urlForLang}`);

// Optionally, redirect to the URL
window.location.href = urlForLang;

 //const locale = getMetadata("locale");
  //alert(locale);
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  sampleRUM.enhance();

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  autolinkModals(doc);

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  const $header = doc.querySelector('header');
  const $footer = doc.querySelector('footer');

  if (window.self !== window.top) {
    // if in iframe remove header and footer
    $header.remove();
    $footer.remove();
  } else {
    await loadHeader($header);
    await loadFooter($footer);
  }

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
