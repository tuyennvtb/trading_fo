import React from 'react';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import history from '../history';
import { redirect } from '../Core/config';
import { FormattedMessage, FormattedHTMLMessage, injectIntl } from 'react-intl';
import {
  RenderTelPhoneField,
  RenderDateFieldInputMask,
  RenderIconSingleField,
} from './Renders';
import { isRequired, isEmail, isDDMMYYYYFormat } from './Validation';
import { updateProfile } from '../Redux/actions/user';
import moment from 'moment';
class ProfileForm extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      updateProfile: PropTypes.func.isRequired,
    }).isRequired,
    handleSubmit: PropTypes.func.isRequired,
    error: PropTypes.any, // eslint-disable-line react/forbid-prop-types, react/require-default-props
    pristine: PropTypes.bool.isRequired,
    reset: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    submitSucceeded: PropTypes.bool.isRequired,
    change: PropTypes.func.isRequired,
    isAllowToChange: PropTypes.bool,
  };

  static defaultProps = {
    isAllowToChange: true,
  };

  constructor(props) {
    super(props);
    this.state = {
      country_code: '',
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.onHandleLocation = this.onHandleLocation.bind(this);
  }

  // update location after user choose valu from google suggestion box
  onHandleLocation(value) {
    const { change } = this.props;
    change('city', value.city);
    change('state', value.state);
    change('country', value.country);
    this.setState({
      country_code: value.country_id,
    });
  }

  async onSubmit(value) {
    const { actions, isAllowToChange } = this.props;
    const { country_code } = this.state;
    if (isAllowToChange) {
      value.country_code = country_code;
      var birthdayDate = moment(value.birthday, 'DD/MM/YYYY').toDate();
      value.user_birthday = new Date(
        birthdayDate.getTime() + 7 * 60 * 60 * 1000,
      ).toISOString();
      const err = await actions.updateProfile(value);
      if (err) {
        throw new SubmissionError({
          _error: err,
        });
      } else {
        history.push(redirect.security);
      }
    } else {
      throw new SubmissionError({
        _error: <FormattedMessage id="app.profile.verified" />,
      });
    }
  }

  render() {
    const {
      handleSubmit,
      submitting,
      error,
      submitSucceeded,
      isAllowToChange,
      intl,
    } = this.props;

    const ssnFieldMessage = intl.formatMessage({
      id: 'app.profile.ssn',
    });
    const birthdayFieldMessage = intl.formatMessage({
      id: 'app.profile.birthdaywithformat',
    });
    const addressFieldMessage = intl.formatMessage({
      id: 'app.profile.fulladdress',
    });
    const stateFieldMessage = intl.formatMessage({
      id: 'app.profile.stateprovince',
    });
    const cityFieldMessage = intl.formatMessage({
      id: 'app.profile.city',
    });
    const countryFieldMessage = intl.formatMessage({
      id: 'app.profile.country',
    });
    const nameFieldMessage = intl.formatMessage({
      id: 'app.placeholder.name',
    });
    return (
      <form onSubmit={handleSubmit(this.onSubmit)}>
        {!isAllowToChange ? (
          <div className="alert alert-warning">
            <span>
              <FormattedHTMLMessage id="app.leftnavigation.myprofile.isallowtochange" />
            </span>
          </div>
        ) : (
          <div className="alert alert-warning">
            <span>
              <FormattedMessage id="app.leftnavigation.myprofile.isallowtochange.remind" />
            </span>
          </div>
        )}
        <h4 className="underline">
          <FormattedMessage id="app.profile.header.personalinfo" />
        </h4>
        {isAllowToChange ? (
          <p>
            <span style={{ fontSize: '13px' }}>
              <FormattedHTMLMessage id="app.profile.header.verify.warning" />
            </span>
          </p>
        ) : (
          <p>
            <span style={{ fontSize: '13px' }}>
              <FormattedHTMLMessage id="app.profile.header.verified" />
            </span>
          </p>
        )}
        <div className="row">
          <div className="col-lg-6 col-md-6">
            <Field
              name="name"
              type="text"
              component={RenderIconSingleField}
              id="name"
              placeholder={nameFieldMessage}
              validate={[isRequired]}
              icon="fa-user"
              disabled={!isAllowToChange}
            />
          </div>
          <div className="col-lg-6 col-md-6">
            <Field
              name="ssn"
              type="text"
              component={RenderIconSingleField}
              id="ssn"
              placeholder={ssnFieldMessage}
              validate={[isRequired]}
              icon="fa-user"
              disabled={!isAllowToChange}
            />
          </div>
          <div className="col-lg-6 col-md-6">
            <Field
              name="birthday"
              type="text"
              component={RenderDateFieldInputMask}
              id="birthday"
              label={birthdayFieldMessage}
              disabled={!isAllowToChange}
              validate={[isDDMMYYYYFormat, isRequired]}
            />
          </div>

          <div className="col-lg-6 col-md-6">
            <Field
              name="mobile"
              validate={[isRequired]}
              type="text"
              component={RenderTelPhoneField}
              id="mobile"
              label="Mobile"
              disabled={!isAllowToChange}
            />
          </div>

          <div className="col-lg-12 col-md-12">
            <Field
              name="email"
              type="email"
              component={RenderIconSingleField}
              id="email"
              placeholder="Email"
              validate={[isRequired, isEmail]}
              readOnly
              icon="fa-envelope"
            />
          </div>

          <div className="col-lg-12 col-md-12">
            <Field
              name="street_addr"
              type="text"
              component={RenderIconSingleField}
              id="street_addr"
              placeholder={addressFieldMessage}
              icon="fa fa-map-marker"
              disabled={!isAllowToChange}
              validate={[isRequired]}
            />
          </div>

          <div className="col-lg-6 col-md-6">
            <Field
              name="city"
              type="text"
              component={RenderIconSingleField}
              id="city"
              placeholder={cityFieldMessage}
              icon="fa fa-industry"
              disabled={!isAllowToChange}
              autoComplete="new-password"
              validate={[isRequired]}
            />
          </div>

          <div className="col-lg-6 col-md-6">
            <Field
              name="state"
              type="text"
              component={RenderIconSingleField}
              id="state"
              placeholder={stateFieldMessage}
              icon="fa fa-map-signs"
              disabled={!isAllowToChange}
              autoComplete="new-password"
              validate={[isRequired]}
            />
          </div>

          <div className="col-lg-12 col-md-12">
            <Field
              name="country"
              type="text"
              component={RenderIconSingleField}
              id="country"
              placeholder={countryFieldMessage}
              icon="fa fa-map"
              disabled={!isAllowToChange}
              autoComplete="new-password"
              validate={[isRequired]}
            />
          </div>
        </div>
        <div className="clearfix" />
        <div
          className="row"
          style={{ marginTop: '30px', marginBottom: '10px' }}
        >
          <div className="col-lg-12 col-md-12">
            {submitSucceeded && (
              <div className="alert alert-success">
                <FormattedHTMLMessage id="app.profile.button.update.success" />
              </div>
            )}
            {error && (
              <div className="alert alert-danger">
                <strong>
                  <FormattedMessage id="app.global.button.warning" />
                </strong>{' '}
                {error}.
              </div>
            )}
            {isAllowToChange ? (
              <div className="footer">
                <button
                  type="submit"
                  className="md-btn btn"
                  disabled={submitting || !isAllowToChange}
                >
                  <span className="icon-settings" />&nbsp;<FormattedMessage id="app.profile.button.update" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <div className="clearfix" />
      </form>
    );
  }
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ user }) {
  const userData = (user && user.profile) || null;
  return {
    initialValues: {
      ...userData,
    },
    enableReinitialize: true, // re-install default value if any change
  };
}
// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ updateProfile }, dispatch),
  };
}

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    reduxForm({
      form: 'ProfileForm',
    })(ProfileForm),
  ),
);
