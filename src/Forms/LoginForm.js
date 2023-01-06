import React from 'react';
import {
  Field,
  reduxForm,
  SubmissionError,
  formValueSelector,
} from 'redux-form';
import GoogleAuthHandleForm from '../Forms/GoogleAuthHandleForm';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RenderInfinityField, RenderCheckBoxField } from './Renders';
import { isRequired, isEmail } from './Validation';
import { logIn } from '../Redux/actions/user';
import Link from '../Link';
import { Cookies } from 'react-cookie';
import { GLOBAL_VARIABLES } from '../Helpers/constants/system';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { withGoogleReCaptcha } from 'react-google-recaptcha-v3';

class LoginForm extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      logIn: PropTypes.func.isRequired,
    }).isRequired,
    handleSubmit: PropTypes.func.isRequired,
    error: PropTypes.any, // eslint-disable-line react/forbid-prop-types, react/require-default-props
    pristine: PropTypes.bool.isRequired,
    reset: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    submitSucceeded: PropTypes.bool.isRequired,
    intl: intlShape.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      isResetPass: false,
      isTokenTimeout: false,
      isIPRestriction: false,
      isRememberDeviceInCookie: false,
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.cookies = new Cookies();
  }

  verifyCaptchaCallback = recaptchaToken => {
    console.log(recaptchaToken, '<= your recaptcha token');
  };

  renderRememberDeviceCheckboxField(label) {
    let defaultChecked = false;
    const rememberDevice = this.cookies.get('rememberDevice');
    if (rememberDevice === '1') {
      defaultChecked = true;
    }
    return (
      <Field
        id="rememberDevice"
        name="rememberDevice"
        type="checkbox"
        defaultChecked={defaultChecked}
        label={label}
        component={RenderCheckBoxField}
      />
    );
  }

  componentDidMount() {
    const isResetPassword = this.cookies.get('redirect_from_resetpassword');
    const isTokenTimeout = this.cookies.get('token_timeout');

    const hasRememberDeviceCookie = this.cookies.get('rememberDevice');
    if (isTokenTimeout) {
      this.setState({
        isTokenTimeout: isTokenTimeout,
      });
      this.cookies.remove('token_timeout', { path: '/' });
    }

    if (isResetPassword) {
      this.setState({
        isResetPass: isResetPassword,
      });
      this.cookies.remove('redirect_from_resetpassword', { path: '/' });
    }
    if (hasRememberDeviceCookie === '1') {
      this.setState({
        isRememberDeviceInCookie: true,
      });
      this.props.change('rememberDevice', true);
    }
  }

  async onSubmit(value) {
    const { isRememberDeviceInCookie } = this.state;
    const params = { ...value };
    const { actions, rememberDevice, googleReCaptchaProps } = this.props;
    // const recaptchaToken = await googleReCaptchaProps.executeRecaptcha('login');
    // params.rememberDevice = isRememberDeviceInCookie;
    // params.recaptchaToken = recaptchaToken;
    const err = await actions.logIn(params);

    if (err === 'INVALID_IP') {
      this.setState({
        isIPRestriction: true,
      });
    } else {
      if (err) {
        throw new SubmissionError({
          _error: err,
        });
      } else {
        if (rememberDevice) {
          if (!isRememberDeviceInCookie) {
            this.cookies.set('rememberDevice', '1', {
              path: '/',
              maxAge: GLOBAL_VARIABLES.REMEMBER_DEVICE_COOKIE_MAX_AGE,
            });
          }
        } else {
          if (isRememberDeviceInCookie) {
            this.cookies.remove('rememberDevice', { path: '/' });
          }
        }
        this.setState({
          account: value,
        });
      }
    }
  }

  render() {
    const { userData, handleSubmit, submitting, error, intl } = this.props;
    const { isResetPass, isTokenTimeout, isIPRestriction } = this.state;
    const email = intl.formatMessage({
      id: 'app.placeholder.email',
    });
    const password = intl.formatMessage({
      id: 'app.placeholder.password',
    });
    const rememberDeviceLabel = intl.formatMessage({
      id: 'app.global.login.rememberdevice',
    });
    var isVerifyGoogleAuth = false;
    if (userData) {
      isVerifyGoogleAuth = userData.is_active_google_auth;
    }

    return (
      <div>
        {!isIPRestriction ? (
          <div>
            {isVerifyGoogleAuth ? (
              <GoogleAuthHandleForm
                isEnable="login"
                account={this.state.account}
              />
            ) : (
              <div>
                {isResetPass ? (
                  <div className="alert alert-warning">
                    <p>
                      <strong>
                        <FormattedMessage id="app.login.reset.success" />
                      </strong>
                    </p>
                    <p>
                      <FormattedMessage id="app.login.login.success.welcome" />
                    </p>
                  </div>
                ) : null}
                {isTokenTimeout ? (
                  <div className="alert alert-info">
                    <p>
                      <strong style={{ color: 'red' }}>
                        <FormattedMessage id="app.login.error.token.timeout" />
                      </strong>
                    </p>
                  </div>
                ) : null}
                <form onSubmit={handleSubmit(this.onSubmit)}>
                  <Field
                    name="email"
                    type="email"
                    component={RenderInfinityField}
                    id="email"
                    icon="fa fa-envelope"
                    placeholder={email}
                    validate={[isRequired, isEmail]}
                  />
                  <Field
                    name="password"
                    type="password"
                    component={RenderInfinityField}
                    placeholder={password}
                    id="password"
                    icon="fa-lock"
                    validate={[isRequired]}
                  />
                  {this.renderRememberDeviceCheckboxField(rememberDeviceLabel)}
                  {error && (
                    <div
                      className="alert alert-danger"
                      style={{ margin: '15px 0 0px 0', padding: '5px' }}
                    >
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
                      <FormattedMessage id="app.login.noaccount" /> &nbsp;
                      <Link href="/register" className="sign-up-color">
                        <FormattedMessage id="app.login.register" />
                      </Link>
                      <br />
                      <Link href="/quen-mat-khau">
                        <FormattedMessage id="app.login.forgotpsw" />
                      </Link>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        ) : (
          <div>
            {' '}
            <div className="alert alert-warning">
              <p>
                <strong>
                  <FormattedMessage id="v2.login.ipaddr.restriction1" />
                </strong>
              </p>
              <p>
                <FormattedMessage id="v2.login.ipaddr.restriction2" />
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }
}
// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ user }) {
  const userData = (user && user.profile) || null;
  return {
    userData,
  };
}

// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ logIn }, dispatch),
  };
}

const selector = formValueSelector('LoginForm'); // <-- same as form name
LoginForm = connect(state => {
  const rememberDevice = selector(state, 'rememberDevice') || false;
  return {
    rememberDevice,
  };
})(LoginForm);

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    reduxForm({
      form: 'LoginForm',
    })(withGoogleReCaptcha(LoginForm)),
  ),
);
