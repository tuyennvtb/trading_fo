import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Cleave from 'cleave.js/react';
export default class RenderIconSingleField extends React.Component {
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
    handleClick: PropTypes.func,
  };

  render() {
    const {
      input,
      icon,
      type,
      meta,
      handleClick,
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
          <span className="input-group-addon">
            <i className={`fa ${icon}`} />
          </span>
          {options ? (
            <Cleave
              className="form-control"
              {...input}
              type={type}
              {...custom}
              options={options}
            />
          ) : (
            <input
              className="form-control"
              {...input}
              type={type}
              {...custom}
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
          {typeof handleClick !== 'undefined' && (
            <span className="input-group-btn btn-right">
              <button
                onClick={handleClick}
                className="md-btn btn"
                type="button"
                title="All"
              >
                <span aria-hidden="true" className="icon-arrow-up" />
              </button>
            </span>
          )}
        </div>
      </div>
    );
  }
}
