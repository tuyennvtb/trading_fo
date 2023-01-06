import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Cleave from 'cleave.js/react';
export default class RenderSingleFieldWithButton extends React.Component {
  static propTypes = {
    input: PropTypes.object.isRequired,
    icon: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    meta: PropTypes.shape({
      touched: PropTypes.bool,
      warning: PropTypes.string,
    }).isRequired,
    custom: PropTypes.object,
    handleClick: PropTypes.func,
  };

  render() {
    const {
      input,
      icon,
      type,
      meta,
      buttonText,
      buttonToolTipText,
      lastButtonText,
      handleClick,
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
            {typeof handleClick !== 'undefined' && (
              <button
                onClick={handleClick}
                className={`btn md-btn  md-btn-trading ${buttonToolTipText &&
                  'has-tooltip'}`}
                type="button"
                title={buttonToolTipText}
                disabled={disabled}
              >
                <span>{buttonText}</span>
              </button>
            )}
            {buttonToolTipText && (
              <div
                className="tooltip fade top"
                role="tooltip"
                // style="top: -50px; left: -5px; display: block;"
              >
                <div className="tooltip-arrow" />
                <div className="tooltip-inner">{buttonToolTipText}</div>
              </div>
            )}}
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
          {lastButtonText && (
            <span className="input-group-addon bordered">{lastButtonText}</span>
          )}
        </div>
      </div>
    );
  }
}
