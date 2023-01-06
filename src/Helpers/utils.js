import accounting from 'accounting';
import moment from 'moment';
import 'moment-timezone';
import _ from 'lodash';
import { toast } from 'react-toastify';

const WALLET_ADDRESS_STANDARD = {
  USDTTRC20: 'T',
  USDTERC20: '0x',
};

export const convertDateByTimeZone = (uctTime) => {
  try {
    // let currentTz = moment.tz.guess();
    // let uctDate = moment.utc(uctTime);
    // let dateWithTimeZone = uctDate.tz(currentTz);

    const dateWithTimeZone = moment.utc(uctTime).local();

    return dateWithTimeZone;
  } catch (err) {
    return moment(uctTime).format();
  }
};

export const formatDate = (datetime, format = 'YYYY-MM-DD') => {
  return moment.unix(Date.parse(datetime) / 1000).format(format);
};

const floorNumber = (value, num = 4) => {
  const numeric = parseInt(1 + '0'.repeat(num));
  return Math.floor(value * numeric) / numeric;
};

export const formatNumber = (value, num = 4) => {
  let result = accounting.format(floorNumber(value, num), num, ',', '.');
  return result.replace(/(\.[0-9]*[1-9])0*|(\.0*)/, '$1');
};

export const formatNumberWithoutThousandSeparator = (value, num = 4) => {
  let result = accounting.format(floorNumber(value, num), num, '', '.');

  return result.replace(/(\.[0-9]*[1-9])0*|(\.0*)/, '$1');
};

export const ceilMoney = (value) => {
  return Math.ceil(value);
};

export const floorMoney = (value) => {
  return Math.floor(value);
};

export const passwordMask = (value) => {
  if (value) {
    return value.replace(/.(?=.{0,}$)/g, '*');
  }
  return '';
};

export const passwordMaskPhoneField = (value) => {
  if (value) {
    return value.replace(/.(?=.{3,}$)/g, '*');
  }
  return '';
};

// {
// ':id': 12,
// ':type': 1
// }
export const replaceParams = (link, param) => {
  for (const key in param) {
    link = link.replace(key, param[key]);
  }
  return link;
};

export const isJson = (item) => {
  item = typeof item !== 'string' ? JSON.stringify(item) : item;

  try {
    item = JSON.parse(item);
  } catch (e) {
    return false;
  }

  if (typeof item === 'object' && item !== null) {
    return true;
  }

  return false;
};

export const transformString = (str, seperatorToSplit, seperatorToLink) => {
  if (!_.isEmpty(str)) {
    var arr = str.split(_.isEmpty(seperatorToSplit) ? '-' : seperatorToSplit);
    if (arr.length > 1) {
      if (_.isEmpty(seperatorToLink)) {
        seperatorToLink = '-';
      }
      return `${_.upperCase(arr[0])} ${seperatorToLink}  ${_.capitalize(
        arr[1]
      )}`;
    } else {
      return str;
    }
  }
};
export const openNewWindow = (url) => {
  if (url) {
    var win = window.open(url, '_blank');
    win.focus();
  }
};

export const checkHrefAddress = (str) => {
  if (str) {
    if (str.indexOf('https://') === 0 || str.indexOf('http://') === 0)
      return true;
    return false;
  }
  return false;
};

export const getJsonFromUrl = (url) => {
  if (!url) url = window.location.search;
  const query = url.substr(1);
  const result = {};
  query.split('&').forEach((part) => {
    const item = part.split('=');
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
};

export const formatPureNumber = (value) => {
  if (value) {
    return value.replace(/,/g, '');
  }

  return 0;
};

export const copyValue = (value) => {
  const toastOptions = {
    autoClose: 1500,
    closeOnClick: true,
    closeButton: true,
    position: 'top-center',
    className: 'toast-copy',
  };
  toast.info(`Đã copy: ${value}`, toastOptions);

  if (window.clipboardData && window.clipboardData.setData) {
    // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
    return window.clipboardData.setData('Text', value);
  } else if (
    document.queryCommandSupported &&
    document.queryCommandSupported('copy')
  ) {
    var textarea = document.createElement('textarea');
    textarea.textContent = value;
    textarea.style.position = 'fixed'; // Prevent scrolling to bottom of page in Microsoft Edge.
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand('copy'); // Security exception may be thrown by some browsers.
    } catch (ex) {
      console.warn('Copy to clipboard failed.', ex);
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
};

export const checkExistCss = (link) => {
  var ss = document.styleSheets;
  for (var i = 0, max = ss.length; i < max; i++) {
    if (ss[i].href && ss[i].href.indexOf(link) > -1) {
      return true;
    }
  }

  return false;
};

export const loadCss = (link) => {
  if (!checkExistCss(link)) {
    var styleSheet = document.createElement('link');
    styleSheet.rel = 'preload stylesheet';
    styleSheet.href = link;
    styleSheet.as = 'style';
    styleSheet.type = 'text/css';
    styleSheet.onerror = () => {
      this.onload = null;
      this.rel = 'stylesheet';
    };
    styleSheet.onload = () => {
      this.onload = null;
      this.rel = 'stylesheet';
    };
    document.getElementsByTagName('head')[0].appendChild(styleSheet);
  }
};

export const detectMobile = () => {
  if (
    navigator.userAgent.match(/Android/i) ||
    navigator.userAgent.match(/webOS/i) ||
    detectMobileIOS() ||
    navigator.userAgent.match(/BlackBerry/i) ||
    navigator.userAgent.match(/Windows Phone/i)
  ) {
    return true;
  } else {
    return false;
  }
};

export const detectMobileIOS = () => {
  if (/(iPhone|iPad|iPod)/.test(navigator.platform)) {
    return true;
  }

  return false;
};

export const detectMobileAndroidChrome = () => {
  const isChrome =
    /Android/.test(navigator.userAgent) &&
    /Chrome/.test(navigator.userAgent) &&
    /Google Inc/.test(navigator.vendor);
  return isChrome;
};

export const setCookie = (name, value, minutes = 30) => {
  const date = new Date(Date.now() + minutes * 60 * 1000);
  const expires = `expires= ${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires}`;
};

export const getCookie = (name) => {
  name = `${name}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
};

export const isValidWalletAddress = (coinCode, walletAddress = '') => {
  const beginCharacter = WALLET_ADDRESS_STANDARD[coinCode];
  if (!beginCharacter) return true;
  return walletAddress.indexOf(beginCharacter) === 0;
};

export const hasClass = (element, className) => {
  return (' ' + element.className + ' ').indexOf(' ' + className + ' ') > -1;
};

export const ucFirst = (string) => {
  if (string) {
    string = string.toLowerCase();
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  return null;
};

const symbolCount = (length, symbol) => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += symbol;
  }
  return result;
};
export const replaceSubstring = (str, symbol = '*') => {
  const strLength = str.length;
  const strIndex = Math.trunc(strLength / 2);
  const replacedString = str.substring(strIndex);
  const replaceSymbol = symbolCount(strLength - strIndex, symbol);
  return str.replace(replacedString, replaceSymbol);
};
