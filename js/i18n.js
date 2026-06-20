// i18n.js — 多語言切換
// V_0601

const I18n = {
  lang: localStorage.getItem('mrh_lang') || 'zh-TW',
  data: {},

  async init() {
    await this.loadLang('zh-TW');
    await this.loadLang('en');
  },

  async loadLang(lang) {
    try {
      const res = await fetch(`locales/${lang}.json`);
      this.data[lang] = await res.json();
    } catch (e) {
      console.error(`Failed to load ${lang}:`, e);
      this.data[lang] = {};
    }
  },

  t(key, fallback = key) {
    return this.data[this.lang]?.[key] || fallback;
  },

  toggle() {
    this.lang = this.lang === 'zh-TW' ? 'en' : 'zh-TW';
    localStorage.setItem('mrh_lang', this.lang);
  }
};

window.I18n = I18n;
