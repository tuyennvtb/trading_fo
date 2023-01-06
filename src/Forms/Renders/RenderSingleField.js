import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Cleave from 'cleave.js/react';
export default class RenderSingleField extends React.Component {
  static propTypes = {
    input: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    meta: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.object,
      warning: PropTypes.string,
    }).isRequired,
    custom: PropTypes.object,
    options: PropTypes.object,
  };

  render() {
    const { input, label, type, meta, options, ...custom } = this.props;
    const { touched, error, warning } = meta;
    const wrapperClass =
      touched && ((error && ' has-error') || (warning && ' has-warning'));
    return (
      <div
        className={`form-group form-md-line-input form-md-floating-label bitmoon-input ${wrapperClass} ${options &&
          options.numeralThousandsGroupStyle}`}
      >
        {options ? (
          <Cleave
            className={`form-control ${input.value && 'edited'} text-cursor`}
            {...input}
            type={type}
            {...custom}
            options={options}
          />
        ) : (
          <input
            className={`form-control ${input.value && 'edited'} text-cursor`}
            {...input}
            type={type}
            {...custom}
            options={options}
          />
        )}

        <label htmlFor={custom.id}>{label}</label>
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
