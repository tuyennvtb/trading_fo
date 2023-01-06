import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
export default class RenderInfinityField extends React.Component {
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
  };

  render() {
    const { input, icon, type, meta, ...custom } = this.props;
    const { touched, error, warning } = meta;
    const wrapperClass =
      touched && ((error && ' has-error') || (warning && ' has-warning'));

    return (
      <div className={`form-group ${wrapperClass}`}>
        <div className="input-group">
          <span className="input-group-addon">
            <i className={`fa ${icon}`} aria-hidden="true" />
          </span>
          <input className="form-control" {...input} type={type} {...custom} />
        </div>

        <span className="help-block text-left">
          {touched &&
            ((error && (
              <span>
                <strong><FormattedMessage id="app.global.button.warning" /></strong> {error}
              </span>
            )) ||
              (warning && (
                <span>
                  <strong><FormattedMessage id="app.global.button.warning" /></strong> {warning}
                </span>
              )))}
        </span>
      </div>
    );
  }
}
