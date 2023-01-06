import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
class RenderSelect2Field extends React.Component {
  static propTypes = {
    input: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    meta: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.object,
      warning: PropTypes.string,
    }).isRequired,
    custom: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.updateValue = this.updateValue.bind(this);
    this.resetValue = this.resetValue.bind(this);
  }

  updateValue(newValue) {
    if (newValue) {
      if (this.props.onChangeCallback) {
        this.props.onChangeCallback(
          this.props.valueKey
            ? newValue[this.props.valueKey]
            : newValue.bank_code,
        );
      }
      if (this.props.getSelectedObject) {
        this.props.getSelectedObject(newValue);
      }
      this.props.input.onChange(
        this.props.valueKey
          ? newValue[this.props.valueKey]
          : newValue.bank_code,
      );
    } else {
      this.props.input.onChange('');
    }
  }

  resetValue() {
    this.props.input.onChange('');
  }

  render() {
    const {
      input,
      label,
      type,
      meta,
      options,
      intl,
      labelKey,
      valueKey,
      placeholder,
      externalClasses,
      ...custom
    } = this.props;
    const { touched, error, warning } = meta;
    const wrapperClass =
      touched && ((error && ' has-error') || (warning && ' has-warning'));
    const myPlaceholder = placeholder
      ? placeholder
      : intl.formatMessage({
          id: 'user.withdraw.bankaccount.bankname.placeholder',
        });
    return (
      <div
        className={`form-group form-md-line-input form-md-floating-label bitmoon-input ${wrapperClass} ${externalClasses ||
          ''}`}
      >
        {' '}
        <label htmlFor={custom.id}>{label}</label>
        <Select
          valueKey={valueKey || 'bank_code'}
          labelKey={labelKey || 'bank_name'}
          name="form-field-name"
          value={this.props.input.value}
          options={options}
          onInputChange={this.onInputChange}
          onChange={this.updateValue}
          onBlurResetsInput={false}
          isLoading={this.props.isLoading}
          onInputKeyDown={this.onInputKeyDown}
          noResultsText={this.props.noResultsText}
          placeholder={myPlaceholder}
          {...custom}
        />
        <span className="help-block text-left bitmoon-error">
          {touched &&
            ((error && (
              <span>
                <strong>
                  <FormattedMessage id="app.global.button.warning" />
                </strong>{' '}
                {error}
              </span>
            )) ||
              (warning && (
                <span>
                  <strong>
                    <FormattedMessage id="app.global.button.warning" />
                  </strong>{' '}
                  {warning}
                </span>
              )))}
        </span>
      </div>
    );
  }
}

export default injectIntl(RenderSelect2Field);
