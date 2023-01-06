import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { intlReducer } from 'react-intl-redux';
import runtime from './runtime';
import user from './user';
import wallet from './wallet';
import locales from './locales';
import google2fa from './google-auth';
import coinsInfo from './coin';
import cash from './cash';
import exchange from './exchange';
import news from './news';
import settings from './settings';
import userLevelDefinitions from './userLevelDefinitions';
import promotion from './promotion';
import otc from './otc';
import swap from './swap';
export default combineReducers({
  intl: intlReducer,
  locales,
  form: formReducer,
  runtime,
  user,
  wallet,
  google2fa,
  coinsInfo,
  cash,
  exchange,
  news,
  settings,
  userLevelDefinitions,
  promotion,
  otc,
  swap,
});
