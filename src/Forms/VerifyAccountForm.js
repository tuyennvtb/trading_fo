import React from 'react';
import {
  Field,
  reduxForm,
  SubmissionError,
  formValueSelector,
} from 'redux-form';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RenderImageUploadField } from './Renders';
import { isRequired } from './Validation';
import { getVerifyImages, verifyAccount } from '../Redux/actions/user';
import {
  getUserLevelDefinitions,
  getCurrentUserLevelDefinitions,
  getUserComission,
} from '../Redux/actions/userLevelDinitions';
import { setRuntimeVariable } from '../Redux/actions/runtime';
import renderHTML from 'react-render-html';
import {
  FormattedMessage,
  FormattedHTMLMessage,
  injectIntl,
  intlShape,
} from 'react-intl';
import { TOAST_TYPE, USER_GROUP_TYPE } from '../Helpers/constants/system';
import { formatNumber } from '../Helpers/utils';

class VerifyAccountForm extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      getVerifyImages: PropTypes.func.isRequired,
      verifyAccount: PropTypes.func.isRequired,
      getUserLevelDefinitions: PropTypes.func.isRequired,
      getCurrentUserLevelDefinitions: PropTypes.func.isRequired,
      getUserComission: PropTypes.func.isRequired,
    }).isRequired,
    handleSubmit: PropTypes.func.isRequired,
    error: PropTypes.any, // eslint-disable-line react/forbid-prop-types, react/require-default-props
    pristine: PropTypes.bool.isRequired,
    reset: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    submitSucceeded: PropTypes.bool.isRequired,
    document: PropTypes.object,
    intl: intlShape.isRequired,
  };

  static defaultProps = {
    document: null,
  };

  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.state = {
      totalSteps: 3,
      currentStep: 1,
    };
  }

  async componentDidMount() {
    const { actions, profile } = this.props;
    await actions.getUserLevelDefinitions();
    await actions.getUserComission([
      USER_GROUP_TYPE.TRADE_FEE,
      USER_GROUP_TYPE.DAILY_TRANSFER_LIMITATION,
    ]);
    if (profile && profile.id) {
      await actions.getCurrentUserLevelDefinitions(
        profile.id,
        USER_GROUP_TYPE.VERIFICATION,
      );
    }
  }
  renderImageDescription() {
    switch (this.state.currentStep) {
      case 1:
        return (
          <label className="image-description pull-left">
            * <FormattedMessage id="app.verify.document.front.description" />
          </label>
        );

      case 2:
        return (
          <label className="image-description pull-left">
            * <FormattedMessage id="app.verify.document.back.description" />
          </label>
        );
      case 3:
        return (
          <label className="image-description pull-left">
            * <FormattedMessage id="app.verify.document.selfie.description" />
          </label>
        );
      default:
        break;
    }
  }

  nextStepButtonClicked = () => {
    const { imageSsnFront, imageSsnBack, actions } = this.props;
    const uploadImageMessage = {
      id: 'app.validation.image.invalid',
    };
    switch (this.state.currentStep) {
      case 1:
        if (imageSsnFront) {
          this.setState({
            currentStep: 2,
          });
        } else {
          actions.setRuntimeVariable({
            name: 'toast',
            value: {
              toastNotified: true,
              message: uploadImageMessage,
              type: TOAST_TYPE.ERROR,
            },
          });
        }
        break;
      case 2:
        if (imageSsnBack) {
          this.setState({
            currentStep: 3,
          });
        } else {
          actions.setRuntimeVariable({
            name: 'toast',
            value: {
              toastNotified: true,
              message: uploadImageMessage,
              type: TOAST_TYPE.ERROR,
            },
          });
        }
        break;
      default:
        break;
    }
  };

  previousStepButtonClicked = () => {
    this.setState({
      currentStep: this.state.currentStep - 1,
    });
  };

  async componentWillMount() {
    const { actions } = this.props;
    await actions.getVerifyImages();
  }

  async onSubmit(value) {
    const { actions } = this.props;
    const err = await actions.verifyAccount(value);
    if (err) {
      throw new SubmissionError({
        _error: err,
      });
    }
  }

  render() {
    const {
      handleSubmit,
      submitting,
      error,
      submitSucceeded,
      profile,
      intl,
      userLevelDataForVerification,
      currentUserLevel,
      userGroup,
    } = this.props;
    const { totalSteps, currentStep } = this.state;

    const frontDocumentLabel = intl.formatMessage({
      id: 'app.verify.document.front',
    });
    const backDocumentLabel = intl.formatMessage({
      id: 'app.verify.document.back',
    });
    const selfieDocumentLabel = intl.formatMessage({
      id: 'app.verify.document.selfie',
    });
    console.log(userLevelDataForVerification);
    var isLastStep = false;
    if (currentStep === totalSteps) {
      isLastStep = true;
    }

    const userLevel1 = userLevelDataForVerification
      ? userLevelDataForVerification.find(item => item.sort === '1')
      : null;
    const userLevel2 = userLevelDataForVerification
      ? userLevelDataForVerification.find(item => item.sort === '2')
      : null;
    const userLevel3 = userLevelDataForVerification
      ? userLevelDataForVerification.find(item => item.sort === '3')
      : null;
    const userLevel4 = userLevelDataForVerification
      ? userLevelDataForVerification.find(item => item.sort === '4')
      : null;

    const tradeFeeLv1 = userGroup
      ? userGroup.find(
          item => item.sort === '1' && item.type === USER_GROUP_TYPE.TRADE_FEE,
        )
      : null;
    const tradeFeeLv2 = userGroup
      ? userGroup.find(
          item => item.sort === '2' && item.type === USER_GROUP_TYPE.TRADE_FEE,
        )
      : null;
    const tradeFeeLv3 = userGroup
      ? userGroup.find(
          item => item.sort === '3' && item.type === USER_GROUP_TYPE.TRADE_FEE,
        )
      : null;
    const tradeFeeLv4 = userGroup
      ? userGroup.find(
          item => item.sort === '4' && item.type === USER_GROUP_TYPE.TRADE_FEE,
        )
      : null;

    const withdrawLimitLv1 = userGroup
      ? userGroup.find(
          item =>
            item.sort === '1' &&
            item.type === USER_GROUP_TYPE.DAILY_TRANSFER_LIMITATION,
        )
      : null;
    const withdrawLimitLv2 = userGroup
      ? userGroup.find(
          item =>
            item.sort === '2' &&
            item.type === USER_GROUP_TYPE.DAILY_TRANSFER_LIMITATION,
        )
      : null;
    const withdrawLimitLv3 = userGroup
      ? userGroup.find(
          item =>
            item.sort === '3' &&
            item.type === USER_GROUP_TYPE.DAILY_TRANSFER_LIMITATION,
        )
      : null;
    const withdrawLimitLv4 = userGroup
      ? userGroup.find(
          item =>
            item.sort === '4' &&
            item.type === USER_GROUP_TYPE.DAILY_TRANSFER_LIMITATION,
        )
      : null;
    const sortValueLevel2 = parseInt(userLevel2 && userLevel2.sort, 10) || 2;
    const sortValueLevel3 = parseInt(userLevel3 && userLevel3.sort, 10) || 3;
    const sortValueLevel4 = parseInt(userLevel4 && userLevel4.sort, 10) || 4;
    const currentUserLevelValue = currentUserLevel
      ? parseInt(currentUserLevel[0].sort, 10)
      : 1;

    const isVerifiedCMND = currentUserLevelValue > 1 ? true : false;
    return (
      <form
        onSubmit={handleSubmit(this.onSubmit)}
        className="verify-account-form"
      >
        <div className="mt-element-step verification-step">
          <div className="row step-line">
            <div className="mt-step-desc">
              <div className="caption-desc font-grey-cascade text-center">
                <span style={{ fontSize: '20px' }}>{profile.email} </span>
                {currentUserLevelValue <= 1 ? (
                  <p className="alert alert-warning verified-label">
                    <FormattedMessage id="app.global.login.unverify" />
                  </p>
                ) : (
                  <p className="alert alert-success verified-label">
                    <i className="fa fa-check" />{' '}
                    <FormattedMessage id="app.global.login.verified" />
                  </p>
                )}
              </div>
            </div>
            <div className="col-md-3 mt-step-col first active">
              <div className="mt-step-number bg-white">
                <i className="fa fa-diamond" />
              </div>
              <div className="mt-step-title uppercase font-grey-cascade">
                <strong>
                  {userLevel1 &&
                    userLevel1.description &&
                    renderHTML(userLevel1.description)}
                </strong>
              </div>
              {withdrawLimitLv1 &&
              withdrawLimitLv1.value !== 'undefined' && (
                <div className="mt-step-content font-grey-cascade">
                  <FormattedMessage
                    id="app.global.text.withdrawlimit"
                    values={{
                      amount: withdrawLimitLv1.value ? (
                        `${formatNumber(withdrawLimitLv1.value)} VND / ngày`
                      ) : (
                        <FormattedMessage id="app.global.text.withdrawlimit.nolimit" />
                      ),
                    }}
                  />
                </div>
              )}
              <div className="mt-step-content font-grey-cascade">
                <FormattedMessage
                  id="app.global.text.tradefee"
                  values={{
                    trade_fee:
                      tradeFeeLv1 &&
                      tradeFeeLv1.value &&
                      formatNumber(tradeFeeLv1.value),
                  }}
                />
              </div>
            </div>
            <div
              className={`col-md-3 mt-step-col ${currentUserLevelValue >=
              sortValueLevel2
                ? 'active'
                : ''}`}
            >
              <div className="mt-step-number bg-white">
                <i className="fa fa-diamond" />
              </div>
              <div className="mt-step-title uppercase font-grey-cascade">
                <strong>
                  {userLevel2 &&
                    userLevel2.description &&
                    renderHTML(userLevel2.description)}
                </strong>
              </div>
              {withdrawLimitLv2 &&
              withdrawLimitLv2.value !== 'undefined' && (
                <div className="mt-step-content font-grey-cascade">
                  <FormattedMessage
                    id="app.global.text.withdrawlimit"
                    values={{
                      amount: withdrawLimitLv2.value ? (
                        `${formatNumber(withdrawLimitLv2.value)} VND / ngày`
                      ) : (
                        <FormattedMessage id="app.global.text.withdrawlimit.nolimit" />
                      ),
                    }}
                  />
                </div>
              )}
              <div className="mt-step-content font-grey-cascade">
                <FormattedMessage
                  id="app.global.text.tradefee_2"
                  values={{
                    trade_fee:
                      tradeFeeLv2 &&
                      tradeFeeLv2.value &&
                      formatNumber(tradeFeeLv2.value),
                  }}
                />
              </div>
            </div>
            <div
              className={`col-md-3 mt-step-col ${currentUserLevelValue >=
              sortValueLevel3
                ? 'active'
                : ''}`}
            >
              <div className="mt-step-number bg-white">
                <i className="fa fa-diamond" />
              </div>
              <div className="mt-step-title uppercase font-grey-cascade">
                <strong>
                  {userLevel3 &&
                    userLevel3.description &&
                    renderHTML(userLevel3.description)}
                </strong>
              </div>
              {withdrawLimitLv3 &&
              withdrawLimitLv3.value !== 'undefined' && (
                <div className="mt-step-content font-grey-cascade">
                  <FormattedMessage
                    id="app.global.text.withdrawlimit"
                    values={{
                      amount: withdrawLimitLv3.value ? (
                        `${formatNumber(withdrawLimitLv3.value)} VND / ngày`
                      ) : (
                        <FormattedMessage id="app.global.text.withdrawlimit.nolimit" />
                      ),
                    }}
                  />
                </div>
              )}
              <div className="mt-step-content font-grey-cascade">
                <FormattedMessage
                  id="app.global.text.tradefee_2"
                  values={{
                    trade_fee:
                      tradeFeeLv3 &&
                      tradeFeeLv3.value &&
                      formatNumber(tradeFeeLv3.value),
                  }}
                />
              </div>
            </div>
            <div
              className={`col-md-3 mt-step-col last ${currentUserLevelValue >=
              sortValueLevel4
                ? 'active'
                : ''}`}
            >
              <div className="mt-step-number bg-white">
                <i className="fa fa-diamond" />
              </div>
              <div className="mt-step-title uppercase font-grey-cascade">
                <strong>
                  {userLevel4 &&
                    userLevel4.description &&
                    renderHTML(userLevel4.description)}
                </strong>
              </div>
              {withdrawLimitLv4 &&
              withdrawLimitLv4.value !== 'undefined' && (
                <div className="mt-step-content font-grey-cascade">
                  <FormattedMessage
                    id="app.global.text.withdrawlimit"
                    values={{
                      amount: withdrawLimitLv4.value ? (
                        `${formatNumber(withdrawLimitLv4.value)} VND / ngày`
                      ) : (
                        <FormattedMessage id="app.global.text.withdrawlimit.nolimit" />
                      ),
                    }}
                  />
                </div>
              )}
              {tradeFeeLv4 &&
              tradeFeeLv4.value !== 'undefined' && (
                <div className="mt-step-content font-grey-cascade">
                  <FormattedMessage
                    id="app.global.text.tradefee"
                    values={{
                      trade_fee: formatNumber(tradeFeeLv4.value),
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        {!isVerifiedCMND && [
          <div className="well verification-info">
            <h4 className="text-center title">
              <i className="fa fa-exclamation-triangle" />{' '}
              <FormattedMessage id="app.verify.button.update" />
            </h4>

            <p className="content">
              <span>
                <strong>
                  <FormattedMessage id="app.verify.verified.warning1" />
                </strong>
              </span>
              <br />
              <i style={{ fontSize: '14px', lineHeight: '28px' }}>
                <FormattedMessage id="app.verify.verified.warning2" />
              </i>
              <br />
              <FormattedHTMLMessage id="app.verify.verified.content" />
            </p>
          </div>,
          <div className="row upload-step">
            <div className="col-md-10 col-md-offset-1">
              <div className="mt-element-step verification-step">
                <div className="row step-line">
                  <div className="mt-step-desc">
                    <div className="col-md-3 mt-step-col first active">
                      <div className="mt-step-number bg-white font-grey-cascade">
                        <span>1</span>
                      </div>
                      <div className="mt-step-title uppercase font-grey-cascade">
                        <strong>{frontDocumentLabel}</strong>
                      </div>
                    </div>
                    <div
                      className={`col-md-3 mt-step-col ${currentStep > 1 ||
                      isVerifiedCMND
                        ? 'active'
                        : ''}`}
                    >
                      <div className="mt-step-number bg-white font-grey-cascade">
                        <span>2</span>
                      </div>
                      <div className="mt-step-title uppercase font-grey-cascade">
                        <strong>{backDocumentLabel}</strong>
                      </div>
                    </div>
                    <div
                      className={`col-md-3 mt-step-col ${isLastStep ||
                      isVerifiedCMND
                        ? 'active'
                        : ''}`}
                    >
                      <div className="mt-step-number bg-white">
                        <span>3</span>
                      </div>
                      <div className="mt-step-title uppercase font-grey-cascade">
                        <strong>Ảnh cầm CMND / Passport</strong>
                      </div>
                    </div>
                    <div
                      className={`col-md-3 mt-step-col last ${submitSucceeded ||
                      isVerifiedCMND
                        ? 'active'
                        : ''}`}
                    >
                      <div className="mt-step-number bg-white font-grey-cascade">
                        <i className="fa fa-check" />
                      </div>
                      <div className="mt-step-title uppercase font-grey-cascade">
                        <strong>
                          <FormattedMessage id="app.verify.document.upload.done" />
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
        ]}

        {!isVerifiedCMND && [
          <div
            className={`upload-section row ${currentStep === 1
              ? 'active'
              : ''}`}
          >
            <div className="col-lg-12 col-md-12 col-sm-12 clearfix">
              <div className="row">
                <div className="col-md-4">
                  <img
                    className="img-responsive lazy"
                    src="assets/global/img/bitmoon/IdentityCard_Front.jpg"
                    alt="selfie"
                  />
                  {this.renderImageDescription()}
                </div>
                <div className="col-md-8">
                  <Field
                    name="images[ssn_front]"
                    type="file"
                    sampleImg="assets/global/img/bitmoon/IdentityCard_Background.jpg"
                    component={RenderImageUploadField}
                    id="images[ssn_front]"
                    label={frontDocumentLabel}
                    disabled={isVerifiedCMND}
                    validate={[isRequired]}
                  />
                  <div>
                    <a
                      className={`btn btn-secondary btn-continue pull-right ${isLastStep
                        ? 'hidden'
                        : 'show'}`}
                      onClick={this.nextStepButtonClicked}
                    >
                      <FormattedMessage id="app.global.button.continue" />{' '}
                      <i className="fa fa-arrow-right fa-fw" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          <div
            className={`upload-section row ${currentStep === 2
              ? 'active'
              : ''}`}
          >
            <div className="col-lg-12 col-md-12 col-sm-12 clearfix">
              <div className="row">
                <div className="col-md-4">
                  <img
                    className="img-responsive lazy"
                    src="assets/global/img/bitmoon/IdentityCard_Back.jpg"
                    alt="selfie"
                  />
                  {this.renderImageDescription()}
                </div>
                <div className="col-md-8">
                  <Field
                    name="images[ssn_back]"
                    type="file"
                    sampleImg="assets/global/img/bitmoon/IdentityCard_Background.jpg"
                    component={RenderImageUploadField}
                    id="images[ssn_back]"
                    label={backDocumentLabel}
                    disabled={isVerifiedCMND}
                    validate={[isRequired]}
                  />
                  <div>
                    <a
                      className="btn btn-secondary btn-continue pull-right"
                      onClick={this.nextStepButtonClicked}
                    >
                      <FormattedMessage id="app.global.button.continue" />{' '}
                      <i className="fa fa-arrow-right fa-fw" />
                    </a>
                    <a
                      className="btn btn-default btn-back pull-left"
                      onClick={this.previousStepButtonClicked}
                    >
                      <i className="fa fa-arrow-left fa-fw" />{' '}
                      <FormattedMessage id="app.global.button.back" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          <div className={`upload-section row ${isLastStep ? 'active' : ''}`}>
            <div className="col-lg-12 col-md-12 col-sm-12 clearfix">
              <div className="row">
                <div className="col-md-4">
                  <img
                    className="img-responsive lazy"
                    src="assets/global/img/bitmoon/selfie-bitmoon.png"
                    alt="selfie"
                  />
                  {this.renderImageDescription()}
                </div>
                <div className="col-md-8">
                  <Field
                    name="images[ssn_selfie]"
                    type="file"
                    sampleImg="assets/global/img/bitmoon/IdentityCard_Background.jpg"
                    component={RenderImageUploadField}
                    id="images[ssn_selfie]"
                    label={selfieDocumentLabel}
                    disabled={isVerifiedCMND}
                    validate={[isRequired]}
                  />
                  <div>
                    {submitSucceeded && (
                      <div className="alert alert-success">
                        <FormattedMessage id="app.verify.document.uploadverificationinfo.success" />
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
                    <button
                      type="submit"
                      className={`btn btn-secondary pull-right ${isLastStep &&
                      !isVerifiedCMND
                        ? 'show'
                        : 'hidden'}`}
                      disabled={submitting || submitSucceeded}
                    >
                      <span className="fa fa-check-square" />&nbsp;<FormattedMessage id="app.profile.header.verify" />
                    </button>
                    <a
                      className={`btn btn-default btn-back pull-left ${submitSucceeded
                        ? 'hidden'
                        : 'show'}`}
                      onClick={this.previousStepButtonClicked}
                    >
                      <i className="fa fa-arrow-left fa-fw" />{' '}
                      <FormattedMessage id="app.global.button.back" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>,
        ]}

        <div className="clearfix" />
      </form>
    );
  }
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ user, userLevelDefinitions }) {
  const document = (user && user.document) || null;
  const profile = (user && user.profile) || null;
  const userLevelData =
    (userLevelDefinitions && userLevelDefinitions.data) || null;
  const currentUserLevel =
    (userLevelDefinitions && userLevelDefinitions.currentUserLevel) || null;
  const userLevelDataForVerification = userLevelData
    ? userLevelData.filter(item => item.type === 'VERIFICATION')
    : null;
  const userGroup =
    (userLevelDefinitions && userLevelDefinitions.userGroupList) || null;
  return {
    document,
    profile,
    userLevelDataForVerification,
    currentUserLevel,
    userGroup,
    initialValues: {
      images: {
        ...document,
      },
    },
    enableReinitialize: true, // re-install default value if any change
  };
}
// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        getVerifyImages,
        verifyAccount,
        setRuntimeVariable,
        getUserLevelDefinitions,
        getCurrentUserLevelDefinitions,
        getUserComission,
      },
      dispatch,
    ),
  };
}

const selector = formValueSelector('VerifyAccountForm'); // <-- same as form name
VerifyAccountForm = connect(state => {
  // can select values individually
  // var total = 0;
  const imageSsnSelfie = selector(state, 'images[ssn_selfie]');
  const imageSsnFront = selector(state, 'images[ssn_front]');
  const imageSsnBack = selector(state, 'images[ssn_back]');
  return {
    imageSsnSelfie,
    imageSsnFront,
    imageSsnBack,
  };
})(VerifyAccountForm);

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    reduxForm({
      form: 'VerifyAccountForm',
    })(VerifyAccountForm),
  ),
);
