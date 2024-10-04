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
  // Detect the user's language or fallback to 'en' if unavailable
  const userLang = navigator.language || navigator.userLanguage || 'en';
  document.documentElement.lang = userLang;

  // Create an object mapping languages to URLs
const urlMap = {
  en: '/en/',  // English content path
  fr: '/fr/',  // French content path
  de: '/de/',  // German content path
  default: '/' // Default path 
};

// Function to get the content path based on language
function getContentPathForLang(language) {
  const baseLang = language.split('-')[0]; // Extract base language (e.g., 'en' from 'en-US')
  return urlMap[baseLang] || urlMap.default; // Fallback to 'default' if language not in the map
}

// Get the content path for the user's language
const contentPath = getContentPathForLang(userLang);

// Perform a soft redirect only if the current path is different
if (window.location.pathname !== contentPath) {
  // Use history.pushState to change the URL without reloading the page
  window.history.pushState(null, '', contentPath);

  // Optionally, load new content for the current language
  await loadContent(contentPath);
}

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

// Function to dynamically load new content for the soft redirect
async function loadContent(contentPath) {
  try {
    // Fetch the content for the given language path (e.g., '/en/', '/fr/')
    const response = await fetch(`${window.hlx.codeBasePath}${contentPath}content.json`);
    
    if (response.ok) {
      const contentData = await response.json();
      
      // Update the main content of the page without reloading
      const main = document.querySelector('main');
      if (main) {
        main.innerHTML = ''; // Clear existing content
        // Append new content (based on your actual content structure)
        main.innerHTML = contentData.html; 
      }
    } else {
      console.error('Error fetching content:', response.status);
    }
  } catch (error) {
    console.error('Failed to load content:', error);
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
