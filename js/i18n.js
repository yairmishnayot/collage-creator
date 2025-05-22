// Simple i18n implementation
class I18n {
  constructor(translations) {
    this.translations = translations;
    this.currentLanguage = 'he'; // Default language is Hebrew
  }

  // Initialize the language based on browser settings or stored preference
  init() {
    const savedLanguage = localStorage.getItem('collage-creator-language');
    if (savedLanguage) {
      this.currentLanguage = savedLanguage;
    }
    this.setLanguage(this.currentLanguage);
  }

  // Change the language
  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLanguage = lang;
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
      localStorage.setItem('collage-creator-language', lang);
      this.updateTranslations();
    }
  }

  // Toggle between available languages
  toggleLanguage() {
    const newLang = this.currentLanguage === 'he' ? 'en' : 'he';
    this.setLanguage(newLang);
  }

  // Get a translated string by key
  t(key) {
    return this.translations[this.currentLanguage][key] || key;
  }

  // Update all translated elements in the DOM
  updateTranslations() {
    // Update the page title
    document.title = this.t('appTitle');
    
    // Update specific elements
    document.getElementById('app-title').textContent = this.t('appTitle');
    document.getElementById('language-switcher').textContent = this.t('languageSwitcher');
    document.getElementById('image1-label').textContent = this.t('image1Label');
    document.getElementById('image2-label').textContent = this.t('image2Label');
    document.getElementById('upload-text1').textContent = this.t('uploadImage');
    document.getElementById('upload-text2').textContent = this.t('uploadImage');
    document.getElementById('drag-text1').textContent = this.t('dragAndDrop');
    document.getElementById('drag-text2').textContent = this.t('dragAndDrop');
    document.getElementById('collage-text').placeholder = this.t('textPlaceholder');
    document.getElementById('create-button').textContent = this.t('createCollage');
    document.getElementById('download-button').textContent = this.t('downloadCollage');
    document.getElementById('whatsapp-button').textContent = this.t('shareWhatsApp');
    document.getElementById('new-button').textContent = this.t('newCollage');
  }
}

// Create global i18n instance
const i18n = new I18n(translations);

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  i18n.init();
});