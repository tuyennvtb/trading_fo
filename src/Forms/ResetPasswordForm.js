import React from 'react';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RenderInfinityField } from './Renders';
import { isRequired } from './Validation';
import { resetPassword } from '../Redux/actions/user';
import Link from '../Link';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
class ResetPasswordForm extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      resetPassword: PropTypes.func.isRequired,
    }).isRequired,
    handleSubmit: PropTypes.func.isRequired,
    error: PropTypes.any, // eslint-disable-line react/forbid-prop-types, react/require-default-props
    pristine: PropTypes.bool.isRequired,
    reset: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    submitSucceeded: PropTypes.bool.isRequired,
    activationCode: PropTypes.string,
  };

  static defaultProps = {
    activationCode: '',
  };

  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  async onSubmit(value) {
    const { actions } = this.props;
    const err = await actions.resetPassword(value);
    if (err) {
      throw new SubmissionError({
        _error: err,
      });
    }
  }

  render() {
    const { handleSubmit, submitting, error, activationCode } = this.props;
    return (
      <form onSubmit={handleSubmit(this.onSubmit)}>
        {!activationCode ? (
          <div className="alert alert-warning">
            <FormattedHTMLMessage id="app.user.resetpassword.message" />
          </div>
        ) : (
          <div className="alert alert-warning">
            <span>
              Thank you for using forgot password. <br />
              Please input your new password below.
            </span>
          </div>
        )}
        <br />
        <Field
          name="activationCode"
          type="text"
          component={RenderInfinityField}
          id="activationCode"
          icon="fa-key"
          placeholder="Activation Code"
          validate={[isRequired]}
        />
        <Field
          name="password"
          type="password"
          component={RenderInfinityField}
          placeholder="New Password"
          id="password"
          icon="fa-lock"
          validate={[isRequired]}
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
            <FormattedHTMLMessage id="app.global.button.continue" />
          </button>
          <div className="forgot-password">
            <FormattedHTMLMessage id="app.login.noaccount" />&nbsp;
            <Link href="/register" className="sign-up-color">
              <FormattedHTMLMessage id="app.login.register" />
            </Link>
            <br />
            <Link href="/quen-mat-khau">
              <FormattedHTMLMessage id="app.login.forgotpsw" />
            </Link>
          </div>
        </div>
      </form>
    );
  }
}
// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps(state, { activationCode }) {
  return {
    initialValues: {
      activationCode: activationCode,
      enableReinitialize: true,
    },
  };
}

// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ resetPassword }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(
  reduxForm({
    form: 'ResetPasswordForm',
  })(ResetPasswordForm),
);
