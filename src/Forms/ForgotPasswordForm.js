import React from 'react';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RenderInfinityField } from './Renders';
import { isRequired, isEmail } from './Validation';
import { forgotPassword } from '../Redux/actions/user';
import Link from '../Link';
import { FormattedMessage } from 'react-intl';

class ForgotPasswordForm extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      forgotPassword: PropTypes.func.isRequired,
    }).isRequired,
    handleSubmit: PropTypes.func.isRequired,
    error: PropTypes.any, // eslint-disable-line react/forbid-prop-types, react/require-default-props
    pristine: PropTypes.bool.isRequired,
    reset: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    submitSucceeded: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  async onSubmit(value) {
    const { actions } = this.props;
    const err = await actions.forgotPassword(value);
    if (err) {
      throw new SubmissionError({
        _error: err,
      });
    }
  }

  render() {
    const { handleSubmit, submitting, error } = this.props;
    return (
      <form onSubmit={handleSubmit(this.onSubmit)}>
        <Field
          name="email"
          type="email"
          component={RenderInfinityField}
          id="email"
          icon="fa-paper-plane"
          placeholder="Email"
          validate={[isRequired, isEmail]}
        />
        {error && (
          <div className="alert alert-danger">
            <strong>
              <FormattedMessage id="app.global.button.warning" />
            </strong>{' '}
            {error}.
          </div>
        )}
        <div className="footer text-center">
          <button
            type="submit"
            className="md-btn btn md-btn-primary"
            disabled={submitting}
          >
            <FormattedMessage id="app.global.button.continue" />
          </button>
          <div className="forgot-password">
            <FormattedMessage id="app.login.noaccount" />&nbsp;
            <Link href="/register" className="sign-up-color">
              <FormattedMessage id="app.login.register" />
            </Link>
          </div>
        </div>
      </form>
    );
  }
}

// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ forgotPassword }, dispatch),
  };
}

export default reduxForm({
  form: 'ForgotPasswordForm',
})(connect(null, mapDispatchToProps)(ForgotPasswordForm));
