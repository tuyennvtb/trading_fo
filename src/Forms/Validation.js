import validator from 'validator';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import CustomBigNumber from '../Helpers/CustomBigNumber';

export const isRequired = value => {
  if (!value || value === false) {
    return <FormattedMessage id="app.validation.require" />;
  } else {
    return undefined;
  }
};

export const isTagRequired = value =>
  value && value.length > 0 ? (
    undefined
  ) : (
    <FormattedMessage id="app.validation.require" />
  );

export const shouldHave = value =>
  value ? undefined : <FormattedMessage id="app.validation.not.mandatory" />;

const maxLength = max => value =>
  value && value.length > max ? (
    <FormattedMessage
      id="app.validation.character.length"
      values={{
        max: max,
      }}
    />
  ) : (
    undefined
  );

export const isMaxLength15 = maxLength(15);
export const isMaxLength10 = maxLength(10);
export const isMaxLength10000 = maxLength(10000);

export const isNumber = value =>
  value && isNaN(Number(value)) ? (
    <FormattedMessage id="app.validation.number.require" />
  ) : (
    undefined
  );

const minValue = min => value =>
  value && value < min ? (
    <FormattedMessage
      id="app.validation.value.min"
      values={{
        min: min,
      }}
    />
  ) : (
    undefined
  );
export const isMinValue18 = minValue(18);

export const isEmail = value =>
  value && !validator.isEmail(value) ? (
    <FormattedMessage id="app.validation.email.invalid" />
  ) : (
    undefined
  );

export const isFile = value =>
  !value || !value.type || value.type.indexOf('image') === -1 ? (
    <FormattedMessage id="app.validation.image.invalid" />
  ) : (
    undefined
  );

export const isValidPassword = value => {
  let error = <FormattedMessage id="app.validation.password.maxlength" />;
  if (value && value.length >= 8 && value.length <= 128) {
    error = null;
  }

  return error;
};

export const isURL = value =>
  value && !validator.isURL(value) ? (
    <FormattedMessage id="app.validation.url.invalid" />
  ) : (
    undefined
  );

export const comparePassword = (value, fields) =>
  value &&
  fields.password &&
  value !== fields.password && (
    <FormattedMessage id="app.validation.password.notmatch" />
  );

export const diffOldPassword = (value, fields) =>
  value &&
  fields.password &&
  value === fields.password && (
    <FormattedMessage id="app.validation.newpassword.identical" />
  );

export const compareNewPassword = (value, fields) =>
  value &&
  fields.newPassword &&
  value !== fields.newPassword && (
    <FormattedMessage id="app.validation.confirmpassword.notmatch" />
  );

export const greaterThanZero = value =>
  value > 0 ? (
    undefined
  ) : (
    <FormattedMessage id="app.validation.greaterThanZero" />
  );

export const isInteger = value =>
  /^[0-9]*$/.test(value) ? (
    undefined
  ) : (
    <FormattedMessage id="app.validation.isInteger" />
  );

export const isIntegerAfterFee = (value, fields, params) => {
  const fee = params.wallet && params.wallet.fee;
  const { coinId } = params;
  if (coinId !== 'ontology' && coinId !== 'neo') return undefined;
  const BigNumberInstance = new CustomBigNumber().getInstance();
  if (/^[0-9]*$/.test(new BigNumberInstance(value).minus(fee))) {
    return undefined;
  } else {
    return <FormattedMessage id="app.validation.isIntegerForNeo" />;
  }
};

export const isLimitCharacterAfterDot = value =>
  /^\d+(\.\d{1,4})?$/.test(value) ? (
    undefined
  ) : (
    <FormattedMessage id="app.validation.isLimitCharacterAfterDot" />
  );
export const isNegative = value =>
  value >= 0 ? undefined : <FormattedMessage id="app.validation.isNegative" />;

export const isDDMMYYYYFormat = value =>
  /^(0?[1-9]|[12][0-9]|3[01])[/](0?[1-9]|1[012])[/-]\d{4}$/.test(value) ? (
    undefined
  ) : (
    <FormattedMessage id="app.validation.isNegative" />
  );
