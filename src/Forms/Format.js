import validator from 'validator';

export const makeTrim = value => (value && validator.trim(value));

export const makeLTrim = value => (value && validator.ltrim(value));

export const makeClearInput = value => (value && validator.blacklist(validator.ltrim(value), '\\[\\]\'\\@\\!\\#\\$\\%\\^\\&\\*\\(\\)\\`\\<\\>\\?\\;\\:\\-\\+\\?\\,\\.\\/\\_\\='));

export const makeUpper = value => (value && value.toUpperCase());
