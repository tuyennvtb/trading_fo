import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  getGoogleAuthCode,
  handleGoogleAuth,
} from '../Redux/actions/google-auth';
import { logInWithGoogleAuth } from '../Redux/actions/user';
import { isRequired } from './Validation';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import { RenderInfinityField } from './Renders';
import { FormattedMessage } from 'react-intl';
import history from '../history';
import { redirect } from '../Core/config';

class GoogleAuthHandleForm extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      getGoogleAuthCode: PropTypes.func.isRequired,
    }).isRequired,
    code: PropTypes.object,
  };

  static defaultProps = {
    code: null,
  };
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }
  async onSubmit(value) {
    const { actions, isEnable, account } = this.props;
    let err;
    if (isEnable === 'login') {
      err = await actions.logInWithGoogleAuth(account, value);
    } else {
      err = await actions.handleGoogleAuth(isEnable, value, account);
    }
    if (err) {
      throw new SubmissionError({
        _error: err,
      });
    } else {
      history.push(redirect.verify_account);
    }
  }

  render() {
    const { handleSubmit, submitting, error } = this.props;
    return (
      <form onSubmit={handleSubmit(this.onSubmit)}>
        <Field
          name="googleEnableCode"
          type="number"
          component={RenderInfinityField}
          id="googleEnableCode"
          icon="fa-key"
          placeholder="Authentication Code"
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
            <FormattedMessage id="app.global.button.continue" />
          </button>
        </div>
      </form>
    );
  }
}

// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      { getGoogleAuthCode, handleGoogleAuth, logInWithGoogleAuth },
      dispatch,
    ),
  };
}

export default connect(null, mapDispatchToProps)(
  reduxForm({
    form: 'GoogleAuthHandleForm',
  })(GoogleAuthHandleForm),
);
