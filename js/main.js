document.addEventListener('DOMContentLoaded', () => {
  // Load saved state from LocalStorage
  loadState();
  
  // Apply translations based on loaded state
  if (typeof applyTranslationsToDOM === 'function') {
    applyTranslationsToDOM();
  }

  // Initialize UI components
  initUI();
  
  // Initialize Google Auth / Calendar Mock
  initGoogleApi();
});
