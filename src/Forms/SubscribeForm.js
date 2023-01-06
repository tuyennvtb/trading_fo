import React from 'react';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RenderInfinityField } from './Renders';
import { isEmail, isRequired } from './Validation';
import { newsletterSubscribe } from '../Redux/actions/user';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';

class SubscribeForm extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      newsletterSubscribe: PropTypes.func.isRequired,
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
    this.state = {
      subscribed: false,
    };
  }

  async onSubmit(value) {
    const { actions } = this.props;
    const err = await actions.newsletterSubscribe(value);
    if (err) {
      this.setState({ subscribed: false });
      throw new SubmissionError({
        _error: err,
      });
    } else {
      this.setState({ subscribed: true });
    }
  }

  render() {
    const { handleSubmit, submitting, error, intl } = this.props;
    const emailPlaceholder = intl.formatMessage({
      id: 'app.placeholder.email',
    });
    return (
      <form onSubmit={handleSubmit(this.onSubmit)} className="newsletter-form">
        <Field
          name="email"
          type="email"
          component={RenderInfinityField}
          id="email"
          icon="fa-paper-plane"
          placeholder={emailPlaceholder}
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
        {this.state.subscribed && (
          <div className="alert alert-success">
            <i>
              {' '}
              <FormattedMessage id="app.confirm.newsletter.message" />
            </i>
          </div>
        )}
        <span className="input-group-btn">
          <button
            type="submit"
            className="btn btn-secondary btn-subscribe"
            disabled={submitting}
          >
            <FormattedMessage id="app.global.button.subscribe" />
          </button>
        </span>
      </form>
    );
  }
}

// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ newsletterSubscribe }, dispatch),
  };
}

export default injectIntl(
  connect(null, mapDispatchToProps)(
    reduxForm({
      form: 'SubscribeForm',
    })(SubscribeForm),
  ),
);
