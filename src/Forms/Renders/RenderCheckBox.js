import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from 'material-ui/Checkbox';
import { FormattedMessage } from 'react-intl';

export default class RenderCheckBox extends React.Component {
  static propTypes = {
    input: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
    label: PropTypes.object,
    id: PropTypes.string.isRequired,
    meta: PropTypes.shape({
      touched: PropTypes.bool,
      error: PropTypes.object,
      warning: PropTypes.string,
    }).isRequired,
    custom: PropTypes.object, // eslint-disable-line react/forbid-prop-types, react/require-default-props
  };

  /* eslint-disable react/no-array-index-key */
  render() {
    const { input, label, meta, options, ...custom } = this.props;
    const { touched, error, warning } = meta;
    const wrapperClass =
      touched && ((error && ' has-error') || (warning && ' has-warning'));
    return (
      <div className={`form-group ${wrapperClass}`}>
        <div className={`radio no-padding ${custom['data-wrapper-class']}`}>
          <Checkbox
            checked={input.value ? true : false}
            onCheck={input.onChange}
            style={{
              width: '50px',
              display: 'inline-block',
            }}
          />
          <span
            className={`${custom['data-label-class']} control-label`}
            htmlFor={custom.id}
          >
            {label}
          </span>
          {touched &&
            ((error && (
              <span className="help-block">
                <strong>
                  <FormattedMessage id="app.global.button.warning" />
                </strong>{' '}
                {error}
              </span>
            )) ||
              (warning && (
                <span className="help-block">
                  <strong>
                    <FormattedMessage id="app.global.button.warning" />
                  </strong>{' '}
                  {warning}
                </span>
              )))}
        </div>
      </div>
    );
  }
  /* eslint-enable react/no-array-index-key */
}
