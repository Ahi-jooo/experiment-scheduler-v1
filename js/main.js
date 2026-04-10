document.addEventListener('DOMContentLoaded', () => {
  loadState();

  if (typeof applyTranslationsToDOM === 'function') {
    applyTranslationsToDOM();
  }

  initUI();
  initGoogleApi();
});
