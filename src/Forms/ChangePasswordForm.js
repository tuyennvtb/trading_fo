import React from 'react';
import { Field, reduxForm, SubmissionError, reset } from 'redux-form';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RenderSingleField } from './Renders';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import {
  isRequired,
  isValidPassword,
  compareNewPassword,
  diffOldPassword,
} from './Validation';
import { changePassword } from '../Redux/actions/user';

class ChangePasswordForm extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      changePassword: PropTypes.func.isRequired,
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
    this.onSubmit = this.onSubmit.bind(this);
  }

  async onSubmit(value) {
    const { actions, dispatch } = this.props;
    const err = await actions.changePassword(value);
    if (err) {
      throw new SubmissionError({
        _error: err,
      });
    } else {
      dispatch(reset('ChangePasswordForm'));
    }
  }

  render() {
    const {
      handleSubmit,
      submitting,
      error,
      submitSucceeded,
      intl,
    } = this.props;
    const oldPassword = intl.formatMessage({
      id: 'app.changepassword.label.oldpass',
    });
    const newPassword = intl.formatMessage({
      id: 'app.changepassword.label.newpass',
    });
    const confirmPassword = intl.formatMessage({
      id: 'app.changepassword.label.confirmpass',
    });
    return (
      <form onSubmit={handleSubmit(this.onSubmit)}>
        <Field
          name="password"
          label={oldPassword}
          type="password"
          component={RenderSingleField}
          id="password"
          icon="fa-lock"
          validate={[isRequired, isValidPassword]}
        />
        <Field
          name="newPassword"
          label={newPassword}
          type="password"
          component={RenderSingleField}
          id="newPassword"
          icon="fa-lock"
          validate={[isRequired, isValidPassword, diffOldPassword]}
        />
        <Field
          name="confirmPassword"
          label={confirmPassword}
          type="password"
          component={RenderSingleField}
          icon="fa-search"
          id="confirmPassword"
          validate={[isRequired, compareNewPassword]}
        />
        {submitSucceeded && (
          <div className="alert alert-success">
            <strong>Success!</strong> Your password has been changed
            successfully.
          </div>
        )}
        {error && (
          <div className="alert alert-danger">
            <strong>Error!</strong> {error}.
          </div>
        )}
        <div className="footer">
          <button type="submit" className="md-btn btn" disabled={submitting}>
            <FormattedMessage id="app.global.button.update" />
          </button>
        </div>
      </form>
    );
  }
}

// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ changePassword }, dispatch),
  };
}

export default injectIntl(
  connect(null, mapDispatchToProps)(
    reduxForm({
      form: 'ChangePasswordForm',
    })(ChangePasswordForm),
  ),
);
