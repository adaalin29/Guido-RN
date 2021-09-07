import LocalizedStrings from 'react-localization';
import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import * as Sentry from '@sentry/react-native';
import emitter from 'tiny-emitter/instance';
import api from './api';

const lang = {
    activeLang: 'nl',
    availableLangs: ['en', 'fr', 'nl', 'es'],
    languages: {
        en: 'English',
        fr: 'Français',
        nl: 'Nederlands',
        es: 'Español',
    },
    
    translations: null,
    multilanguage: null,
    
    init() {
        this.updateTranslations();
        this.useSavedLanguage();
        this.loadRemoteTranslations();
    },
    
    updateTranslations(translations) {
        if (!translations) translations = require('./translations.json');
        if (!this.translations) this.translations = {};
        Object.keys(translations).map(langCode => {
            if (!this.translations.hasOwnProperty(langCode)) this.translations[langCode] = {},
            translations[langCode] = {...this.translations[langCode], ...translations[langCode]};
        });
        this.translations = translations;
        this.multilanguage = new LocalizedStrings(this.translations);
        this.multilanguage.setLanguage(this.activeLang);
    },
    
    loadRemoteTranslations() {
        api.get('/languages').then(response => {
            if (response.data.languages) {
                this.languages = { ...this.languages, ...response.data.languages };
            }
            if (response.data.translations) {
                this.updateTranslations(response.data.translations);
                emitter.emit('auth');
            }
        })
    },
    
    changeLang(newLang) {
        this.activeLang = newLang;
        this.multilanguage.setLanguage(this.activeLang);
        AsyncStorage.setItem('lang', this.activeLang);
        if (Sentry) Sentry.setTag('lang.activeLang', this.activeLang);
    },
    
    useSavedLanguage() {
        AsyncStorage.getItem('lang').then(savedLang => {
            if (savedLang && this.availableLangs.indexOf(savedLang) !== -1) {
                this.changeLang(savedLang);
            } else {
                this.autoDetect();
            }
        }).catch(error => {
            this.autoDetect();
        });
    },
    
    autoDetect() {
        let detectedLanguage = null;
        if (Platform.OS === 'ios') {
            detectedLanguage = NativeModules.SettingsManager.settings.AppleLocale || NativeModules.SettingsManager.settings.AppleLanguages[0];
        }
        if (Platform.OS === 'android') {
            detectedLanguage = NativeModules.I18nManager.localeIdentifier;
        }
        if (!detectedLanguage) return;
        
        let newLang = 'nl';
        detectedLanguage = detectedLanguage.toLowerCase();
        this.availableLangs.map(avaLang => {
            if (detectedLanguage == avaLang || detectedLanguage.indexOf(avaLang+'-') === 0 || detectedLanguage.indexOf(avaLang+'_') === 0) {
                newLang = avaLang;
            }
        });
        this.changeLang(newLang);
    },
    
    get(key, defaultText) {
        if (!this.multilanguage) this.init();
        return this.multilanguage[key] || defaultText;
    },
    
    translateModel(item, fields) {
        if (!fields) fields = [];
        fields.map(field => {
            if (item.hasOwnProperty(field + '_' + this.activeLang) && item[field + '_' + this.activeLang]) {
                item[field]  = item[field + '_' + this.activeLang];
            } else if (item.hasOwnProperty(field + '_nl') && item[field + '_nl']) {
                item[field]  = item[field + '_nl'];
            } else if (item.hasOwnProperty(field) && item[field]) {
                item[field]  = item[field];
            } else {
                item[field] = '';
            }
        });
        return item;
    }
}

export default lang;
