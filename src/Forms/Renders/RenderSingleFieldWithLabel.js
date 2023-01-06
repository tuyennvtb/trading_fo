import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Cleave from 'cleave.js/react';
export default class RenderSingleFieldWithLabel extends React.Component {
  static propTypes = {
    input: PropTypes.object.isRequired,
    icon: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    meta: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.object,
      warning: PropTypes.string,
    }).isRequired,
    custom: PropTypes.object,
  };

  render() {
    const {
      input,
      icon,
      type,
      meta,
      labelText,
      lastLabelText,
      disabled,
      options,
      ...custom
    } = this.props;
    const { touched, error, warning } = meta;
    const wrapperClass =
      touched && ((error && ' has-error') || (warning && ' has-warning'));
    return (
      <div
        className={`form-group form-md-line-input bitmoon-input bitmoon-thin ${wrapperClass}`}
      >
        <div className="input-group">
          <span className="input-group-btn btn-left">
            {labelText && (
              <span className="btn label-text md-shadow-none">{labelText}</span>
            )}
          </span>
          <div className="input-group-control">
            {options ? (
              <Cleave
                options={options}
                className="form-control input-placeholder"
                {...input}
                type={type}
                {...custom}
                disabled={disabled}
              />
            ) : (
              <input
                options={{
                  numeral: true,
                  numeralThousandsGroupStyle: 'thousand',
                  numeralDecimalScale: 4,
                  numeralPositiveOnly: true,
                }}
                className="form-control input-placeholder"
                {...input}
                type={type}
                {...custom}
                disabled={disabled}
              />
            )}

            <div className="form-control-focus" />
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
          {lastLabelText && (
            <span className="input-group-addon bordered">{lastLabelText}</span>
          )}
        </div>
      </div>
    );
  }
}
