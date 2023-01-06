import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

export default class RenderCheckBoxField extends React.Component {
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
  constructor(props) {
    super(props);
    const { defaultChecked } = this.props;
    this.state = {
      isChecked: defaultChecked ? true : false,
    };
  }
  toggleChange = () => {
    this.setState({
      isChecked: !this.state.isChecked,
    });
  };
  /* eslint-disable react/no-array-index-key */
  render() {
    const { label, meta, input, custom, defaultChecked, type } = this.props;
    const { touched, error, warning } = meta;
    const wrapperClass =
      touched && ((error && ' has-error') || (warning && ' has-warning'));
    return (
      <div className={`form-group ${wrapperClass}`}>
        <div className="form-group">
          <label className="mt-checkbox">
            <input
              {...input}
              {...custom}
              type={type}
              defaultChecked={defaultChecked}
              value="test"
              checked={this.state.isChecked}
              onChange={this.toggleChange}
            />{' '}
            {label}
            <span />
          </label>
        </div>
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
    );
  }
  /* eslint-enable react/no-array-index-key */
}
