import React from 'react';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  RenderInfinityField,
  RenderCheckBox,
  RenderSelect2Field,
} from './Renders';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import {
  isRequired,
  isEmail,
  isValidPassword,
  comparePassword,
} from './Validation';
import Link from '../Link';
import { Cookies } from 'react-cookie';
import { register } from '../Redux/actions/user';
import { withGoogleReCaptcha } from 'react-google-recaptcha-v3';

class RegisterForm extends React.Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    actions: PropTypes.shape({
      register: PropTypes.func.isRequired,
    }).isRequired,
    error: PropTypes.any, // eslint-disable-line react/forbid-prop-types, react/require-default-props
    pristine: PropTypes.bool.isRequired,
    reset: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    intl: intlShape.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      isRegistered: false,
    };
    this.onSubmit = this.onSubmit.bind(this);
  }

  async onSubmit(value) {
    if (!value.term) {
      throw new SubmissionError({
        _error: <FormattedMessage id="v2.register.term.error" />,
      });
    }

    const { actions, googleReCaptchaProps } = this.props;
    const cookies = new Cookies();
    const refererId = cookies.get('ref_id');

    if (refererId) {
      value.refererId = refererId;
    }
    // const recaptchaToken = await googleReCaptchaProps.executeRecaptcha(
    //   'register',
    // );
    // value.recaptchaToken = recaptchaToken;
    const err = await actions.register(value);
    if (err) {
      throw new SubmissionError({
        _error: err,
      });
    } else {
      this.setState({
        isRegistered: true,
      });
    }
  }

  render() {
    const { handleSubmit, submitting, error, intl } = this.props;
    const { isRegistered } = this.state;
    const fullNamePlaceholder = intl.formatMessage({
      id: 'app.placeholder.name',
    });
    const emailPlaceholder = intl.formatMessage({
      id: 'app.placeholder.email',
    });
    const passwordPlaceholder = intl.formatMessage({
      id: 'app.placeholder.password',
    });
    const confirmPasswordPlaceholder = intl.formatMessage({
      id: 'app.placeholder.confirmpassword',
    });
    const referralResourcePlaceHolder = intl.formatMessage({
      id: 'app.placeholder.referralResource',
    });
    const termAndConditionPlaceHolder = (
      <FormattedMessage
        id="v2.register.term.label"
        values={{
          term: (
            <strong>
              <Link href="/privacy" target="_blank">
                <FormattedMessage id="app.footer.link.term" />
              </Link>
            </strong>
          ),
          risk: (
            <strong>
              <Link href="/risk" target="_blank" rel="noopener noreferrer">
                <FormattedMessage id="app.footer.link.risk" />
              </Link>
            </strong>
          ),
        }}
      />
    );
    const referralResource = [
      {
        key: 'NONE',
        name: 'None',
      },
      {
        key: 'YOUTUBE',
        name: 'Qua thông tin trên Google, Youtube',
      },
      {
        key: 'BLOG',
        name: 'Qua các website, blog về tiền điện tử',
      },
      {
        key: 'SOCIAL_NETWORK',
        name: 'Qua mạng xã hội (facebook, twitter, instagram,...)',
      },
      {
        key: 'FRIEND',
        name: 'Qua sự giới thiệu của bạn bè, người thân...',
      },
      {
        key: 'OTHER',
        name: 'Qua các nguồn khác',
      },
    ];
    return (
      <div>
        {isRegistered ? (
          <div>
            <p>
              <strong>
                <FormattedMessage id="app.register.success.text1" />
              </strong>
              <FormattedMessage id="app.register.success.text2" />
            </p>
            <p>
              <FormattedMessage id="app.register.success.text3" />
            </p>
            <div className="forgot-password">
              <FormattedMessage id="app.register.activated" />&nbsp;
              <Link href="/login" className="sign-up-color">
                <FormattedMessage id="app.register.login" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(this.onSubmit)}>
            <div className="container-fluid">
              <div className="row">
                <div className="col-lg-6 col-md-6">
                  <Field
                    name="name"
                    type="text"
                    component={RenderInfinityField}
                    id="name"
                    icon="fa-user"
                    placeholder={fullNamePlaceholder}
                    validate={[isRequired]}
                  />
                  <Field
                    name="email"
                    type="email"
                    component={RenderInfinityField}
                    id="email"
                    icon="fa fa-envelope"
                    placeholder={emailPlaceholder}
                    validate={[isRequired, isEmail]}
                  />
                </div>
                <div className="col-lg-6 col-md-6">
                  <Field
                    name="password"
                    type="password"
                    component={RenderInfinityField}
                    placeholder={passwordPlaceholder}
                    id="password"
                    icon="fa-lock"
                    validate={[isRequired, isValidPassword]}
                  />

                  <Field
                    name="confirmPassword"
                    type="password"
                    component={RenderInfinityField}
                    placeholder={confirmPasswordPlaceholder}
                    icon="fa-lock"
                    id="confirmPassword"
                    validate={[isRequired, comparePassword]}
                  />
                </div>
                <div className="col-lg-12 col-md-12">
                  <Field
                    name="referral_resource"
                    id="referral_resource"
                    type="text"
                    externalClasses="referral-resource"
                    component={RenderSelect2Field}
                    searchable={false}
                    placeholder={referralResourcePlaceHolder}
                    valueKey="key"
                    labelKey="name"
                    options={referralResource}
                  />
                </div>
                <div className="col-lg-12 col-md-12">
                  <Field
                    name="term"
                    id="term"
                    type="checkbox"
                    label={termAndConditionPlaceHolder}
                    component={RenderCheckBox}
                    validate={[isRequired]}
                  />
                </div>
              </div>
            </div>
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
                <FormattedMessage id="app.login.hadaccount" />&nbsp;
                <Link href="/login" className="sign-up-color">
                  <FormattedMessage id="app.register.login" />
                </Link>
              </div>
            </div>
          </form>
        )}
      </div>
    );
  }
}

// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ register }, dispatch),
  };
}

export default reduxForm({
  form: 'RegisterForm',
  initialValues: {
    term: false,
  },
  enableReinitialize: true, // re-install default value if any change
})(
  injectIntl(
    connect(null, mapDispatchToProps)(withGoogleReCaptcha(RegisterForm)),
  ),
);
