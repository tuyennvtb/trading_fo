import React from 'react';
import PropTypes from 'prop-types';
import MaskedInput from 'react-text-mask';
import createAutoCorrectedDatePipe from 'text-mask-addons/dist/createAutoCorrectedDatePipe';
import { FormattedMessage } from 'react-intl';
export default class RenderSingleField extends React.Component {
  static propTypes = {
    input: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    meta: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.string,
      warning: PropTypes.string,
    }).isRequired,
    custom: PropTypes.object,
  };

  render() {
    const { input, label, type, meta, disabled, ...custom } = this.props;
    const { touched, error, warning } = meta;
    const wrapperClass =
      touched && ((error && ' has-error') || (warning && ' has-warning'));
    return (
      <div
        className={`form-group form-md-line-input form-md-floating-label bitmoon-input ${wrapperClass}`}
      >
        <MaskedInput
          className={`form-control ${input.value && 'edited'}`}
          {...input}
          type={type}
          keepCharPositions={true}
          pipe={createAutoCorrectedDatePipe('dd/mm/yyyy HH:MM')}
          mask={[/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]}
          disabled={disabled}
        />
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
