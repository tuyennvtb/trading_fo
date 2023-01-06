import React from 'react';
import PropTypes from 'prop-types';
import ReactTelInput from 'react-telephone-input';
import 'react-telephone-input/lib/withStyles';
import { FormattedMessage } from 'react-intl';
export default class RenderTelPhoneField extends React.Component {
  static propTypes = {
    input: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,
    meta: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.string,
      warning: PropTypes.string,
    }).isRequired,
    custom: PropTypes.object, // eslint-disable-line react/forbid-prop-types, react/require-default-props
  };

  constructor(props) {
    super(props);

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(telNumber) {
    this.props.input.onChange(telNumber);
  }

  render() {
    const { input, label, meta, disabled, ...custom } = this.props;
    const { touched, error, warning } = meta;
    const wrapperClass =
      touched && ((error && ' has-error') || (warning && ' has-warning'));
    return (
      <div
        style={{ marginBottom: '0' }}
        className={`form-group false ${wrapperClass}`}
      >
        <div className="input-group" style={{ width: '100%' }}>
          {!disabled ? (
            <div className={custom['data-wrapper-class']}>
              <ReactTelInput
                defaultCountry="vn"
                flagsImagePath="/assets/global/img/bitmoon/flags.png"
                onChange={this.handleInputChange}
                value={input.value}
                placeholder="Phone number"
                disabled={disabled}
              />
            </div>
          ) : (
            <div className="form-group form-md-line-input form-md-floating-label bitmoon-input false">
              <div className="input-group">
                <span className="input-group-addon">
                  <i className="fa fa-phone" />
                </span>
                <input
                  type="text"
                  className="form-control"
                  value={input.value}
                  disabled
                />
              </div>
            </div>
          )}

          {'data-helptext' in custom && (
            <span className="help-block">{custom['data-helptext']}</span>
          )}
          {touched &&
            ((error && (
              <span className="help-block">
                <strong>Error!</strong> {error}
              </span>
            )) ||
              (warning && (
                <span className="help-block">
                  <strong><FormattedMessage id="app.global.button.warning" /></strong> {warning}
                </span>
              )))}
        </div>
      </div>
    );
  }
}
