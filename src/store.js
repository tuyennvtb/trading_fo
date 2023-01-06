import { createStore, applyMiddleware, compose } from 'redux';
import { addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import vi from 'react-intl/locale-data/vi';
import enBundle from './Resourse/en.json';
import viBundle from './Resourse/vi.json';
import thunk from 'redux-thunk';
import rootReducer from './Redux/reducers';
// import { isJson } from '../src/Helpers/utils';
// import languages
[en, vi].forEach(addLocaleData);

// setup default state for user
let credential = {
  authenticated: false,
  profile: null,
};

// let initializeLanguage = localStorage.getItem('uid_btm_lang');
// let siteMessage = null;
// if (isJson(initializeLanguage)) {
//   initializeLanguage = JSON.parse(initializeLanguage);
//   siteMessage = initializeLanguage.locale === 'vi' ? viBundle : enBundle;
//   initializeLanguage = {
//     locale: initializeLanguage.locale,
//     messages: siteMessage,
//   };
// } else {
//   initializeLanguage = {
//     locale: 'vi',
//     messages: viBundle,
//   };
// }

const initializeLanguage = {
  locale: 'vi',
  messages: viBundle,
};

const initialState = {
  user: credential,
  intl: initializeLanguage,
  locales: {
    en: enBundle,
    vn: viBundle,
  },
};
const enhancers = [];
const middleware = [thunk];

if (process.env.NODE_ENV === 'development') {
  const devToolsExtension = window.devToolsExtension;

  if (typeof devToolsExtension === 'function') {
    enhancers.push(devToolsExtension());
  }
}

const composedEnhancers = compose(applyMiddleware(...middleware), ...enhancers);

export default createStore(rootReducer, initialState, composedEnhancers);
