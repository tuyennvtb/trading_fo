/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import RefereeListForm from '../Forms/RefereeListForm';
import ReferralDetailForm from '../Forms/ReferralDetailForm';
import SystemWalletHOC from '../Processing/SystemWalletHOC';
import renderHTML from 'react-render-html';
import {
  ERRORS,
  GLOBAL_VARIABLES,
  TOAST_TYPE,
  USER_GROUP_TYPE,
} from '../Helpers/constants/system';
import { getWalletDetail, createWallet } from '../Redux/actions/wallet';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { injectIntl, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { formatNumber } from '../Helpers/utils';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { setRuntimeVariable } from '../Redux/actions/runtime';
import ToastNotification from '../Processing/ToastNotification.js';
import {
  getCurrentUserLevelDefinitions,
  getUserComission,
  getUserLevelDefinitions,
} from '../Redux/actions/userLevelDinitions';
import '../assets/css/pages/referral.css';

class Referral extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
    };
  }
  async componentDidMount() {
    const { actions, user } = this.props;
    await actions.getCurrentUserLevelDefinitions(
      user.id,
      USER_GROUP_TYPE.MARKETING,
    );
    await actions.getUserLevelDefinitions();
    await actions.getUserComission([USER_GROUP_TYPE.MARKETING_COMMISSION]);
    if (user && user.id) {
      await actions.getCurrentUserLevelDefinitions(
        user.id,
        USER_GROUP_TYPE.MARKETING,
      );
    }
    const err1 = await actions.getWalletDetail(
      GLOBAL_VARIABLES.BASE_CURRENCY,
      false,
      'BUY',
    );
    if (err1 === ERRORS.NO_WALLET) {
      actions.createWallet(GLOBAL_VARIABLES.BASE_CURRENCY);
    }

    let myHandler = setInterval(async () => {
      const err = await actions.getWalletDetail(
        GLOBAL_VARIABLES.BASE_CURRENCY,
        false,
        'BUY',
      );
      if (!err) {
        clearInterval(myHandler);
      }
    }, 3000);
  }

  handleFocus(e) {
    e.target.select();
  }

  renderPriceTableScriptContent = size => {
    const { user, actions } = this.props;
    var scriptContent;
    var domain = `${window.location.protocol}//${window.location.host}`;
    var userId = user && user.id;

    switch (size) {
      case 'small':
        scriptContent = `<iframe scrolling="no" style="border: none; overflow: hidden;" src="${domain}/price-table-widget/${userId}" width="300px" height="680px"></iframe>`;
        break;
      case 'large':
        scriptContent = `<iframe scrolling="no" style="border: none; overflow: hidden;" src="${domain}/price-table-widget/${userId}" width="970px" height="650px"></iframe>`;

        break;
      default:
        break;
    }
    return (
      <div>
        <CopyToClipboard
          text={scriptContent}
          onCopy={() =>
            actions.setRuntimeVariable({
              name: 'toast',
              value: {
                toastNotified: true,
                message: {
                  id: 'app.referral.script.copy.success',
                },
                type: TOAST_TYPE.SUCCESS,
              },
            })}
        >
          <button
            type="button"
            className="btn blue md-btn uppercase pull-right"
          >
            <i className="fa fa-clipboard" />
            COPY CODE
          </button>
        </CopyToClipboard>
        <textarea
          className="form-control"
          rows="4"
          onFocus={this.handleFocus}
          defaultValue={scriptContent}
        />
      </div>
    );
  };

  renderCalculatorTableScriptContent = size => {
    const { user, actions } = this.props;
    var scriptContent;
    var domain = `${window.location.protocol}//${window.location.host}`;
    var userId = user && user.id;

    switch (size) {
      case 'small':
        scriptContent = `<iframe scrolling="no" style="border: none; overflow: hidden;" src="${domain}/calculator-widget/${userId}" width="300px" height="680px"></iframe>`;
        break;
      case 'large':
        scriptContent = `<iframe scrolling="no" style="border: none; overflow: hidden;" src="${domain}/calculator-widget/bitcoin/${userId}" width="100%" height="300px"></iframe>`;

        break;
      default:
        break;
    }
    return (
      <div>
        <CopyToClipboard
          text={scriptContent}
          onCopy={() =>
            actions.setRuntimeVariable({
              name: 'toast',
              value: {
                toastNotified: true,
                message: {
                  id: 'app.referral.script.copy.success',
                },
                type: TOAST_TYPE.SUCCESS,
              },
            })}
        >
          <button
            type="button"
            className="btn blue md-btn uppercase pull-right"
          >
            <i className="fa fa-clipboard" />
            COPY CODE
          </button>
        </CopyToClipboard>
        <textarea
          className="form-control"
          rows="4"
          onFocus={this.handleFocus}
          defaultValue={scriptContent}
        />
      </div>
    );
  };


  renderAffiliateScriptContent = size => {
    const { user, actions } = this.props;
    var scriptContent;
    var domain = `${window.location.protocol}//${window.location.host}`;
    var userId = user && user.id;

    switch (size) {
      case 'small':
        scriptContent = `<iframe scrolling="no" style="border: none; overflow: hidden;" src="${domain}/referral-widget/${userId}/234x60" width="234px" height="60px"></iframe>`;
        break;
      case 'medium':
        scriptContent = `<iframe scrolling="no" style="border: none; overflow: hidden;" src="${domain}/referral-widget/${userId}/468x60" width="468px" height="60px"></iframe>`;
        break;
      case 'large':
        scriptContent = `<iframe scrolling="no" style="border: none; overflow: hidden;" src="${domain}/referral-widget/${userId}/728x90" width="728px" height="90px"></iframe>`;
        break;
      default:
        break;
    }
    return (
      <div>
        <CopyToClipboard
          text={scriptContent}
          onCopy={() =>
            actions.setRuntimeVariable({
              name: 'toast',
              value: {
                toastNotified: true,
                message: {
                  id: 'app.referral.script.copy.success',
                },
                type: TOAST_TYPE.SUCCESS,
              },
            })}
        >
          <button
            type="button"
            className="btn blue md-btn uppercase pull-right"
          >
            <i className="fa fa-clipboard" />
            COPY CODE
          </button>
        </CopyToClipboard>
        <textarea
          className="form-control"
          rows="4"
          onFocus={this.handleFocus}
          defaultValue={scriptContent}
        />
      </div>
    );
  };

  render() {
    const {
      user,
      referees,
      actions,
      userLevelDataForVerification,
      currentUserLevel,
      userGroup,
    } = this.props;
    const userLevel1 = userLevelDataForVerification
      ? userLevelDataForVerification.find(item => item.sort === '1')
      : null;
    const userLevel2 = userLevelDataForVerification
      ? userLevelDataForVerification.find(item => item.sort === '2')
      : null;
    const userLevel3 = userLevelDataForVerification
      ? userLevelDataForVerification.find(item => item.sort === '3')
      : null;

    const marketingLv1 = userGroup
      ? userGroup.find(item => item.sort === '1')
      : null;
    const marketingLv2 = userGroup
      ? userGroup.find(item => item.sort === '2')
      : null;
    const marketingLv3 = userGroup
      ? userGroup.find(item => item.sort === '3')
      : null;
    const sortValueLevel2 = parseInt(userLevel2 && userLevel2.sort, 10) || 2;
    const sortValueLevel3 = parseInt(userLevel3 && userLevel3.sort, 10) || 3;
    const currentUserLevelValue = currentUserLevel
      ? parseInt(currentUserLevel[0].sort, 10)
      : 1;

    let refererProfit = 0.2;
    const referLink = ` ${window.location.protocol}//${window.location
      .host}/register/referer/${user && user.id}`;
    let totalBonus = 0;

    if (referees) {
      totalBonus = referees.reduce((acc, val) => {
        return acc + val.bonus_amount;
      }, 0);
    }
    return [
      <div key="user-level" className="portlet light bordered paper-3">
        <div className="portlet-body">
          <div className="mt-element-step verification-step">
            <div className="row step-line">
              <div className="mt-step-desc">
                <div className="caption-desc font-grey-cascade text-center">
                  <span style={{ fontSize: '20px' }}>{user.email} </span>
                </div>
              </div>
              <div className="col-md-4 mt-step-col first active">
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
                {marketingLv1 &&
                  marketingLv1.value !== 'undefined' && (
                    <div className="mt-step-content font-grey-cascade">
                      <FormattedMessage
                        id="app.global.text.referal"
                        values={{
                          bonus: marketingLv1.value
                            ? `${formatNumber(marketingLv1.value)}`
                            : 20,
                        }}
                      />
                    </div>
                  )}
              </div>
              <div
                className={`col-md-4 mt-step-col ${currentUserLevelValue >=
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
                {marketingLv2 &&
                  marketingLv2.value !== 'undefined' && (
                    <div className="mt-step-content font-grey-cascade">
                      <FormattedMessage
                        id="app.global.text.referal"
                        values={{
                          bonus: marketingLv2.value
                            ? `${formatNumber(marketingLv2.value)}`
                            : 20,
                        }}
                      />
                    </div>
                  )}
              </div>
              <div
                className={`col-md-4 mt-step-col ${currentUserLevelValue >=
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
                {marketingLv3 &&
                  marketingLv3.value !== 'undefined' && (
                    <div className="mt-step-content font-grey-cascade">
                      <FormattedMessage
                        id="app.global.text.referal"
                        values={{
                          bonus: marketingLv3.value
                            ? `${formatNumber(marketingLv3.value)}`
                            : 20,
                        }}
                      />
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>,
      <div key="referral" className="container-fluid referral">
        <div className="portlet light bordered paper-3">
          <div className="portlet-body">
            <div className="row">
              <div className="col-md-8 col-md-offset-2">
                <p className="text-center title">
                  <span className="caption-subject font-blue bold uppercase">
                    <i
                      className=" icon-wallet font-blue"
                      style={{ padding: '0 5px 0 0' }}
                    />
                    <FormattedMessage id="app.referral.table.header.text" />
                  </span>
                </p>
                <p className="text-center title">
                  <span className="caption-subject font-blue bold uppercase">
                    <FormattedMessage id="app.referral.bonus.total.text" /> :
                  </span>{' '}
                  <span className="caption-subject font-red bold uppercase">
                    {` ${formatNumber(totalBonus)} VND`}
                  </span>
                </p>
                <p className="note note-info wallet-description">
                  <FormattedHTMLMessage
                    id="app.referral.term.text"
                    values={{
                      amount: `${refererProfit * 100}%`,
                    }}
                  />
                </p>
                <div
                  className="note note-info clearfix"
                  style={{ marginTop: '25px', padding: '0' }}
                >
                  <span
                    style={{
                      marginLeft: '10px',
                      marginTop: '10px',
                      display: 'inline-block',
                    }}
                  >
                    <FormattedHTMLMessage id="app.referral.link.text" /> :{' '}
                    <span className="caption-subject font-blue bold">
                      {referLink}
                    </span>
                  </span>
                  <CopyToClipboard
                    text={referLink}
                    onCopy={() =>
                      actions.setRuntimeVariable({
                        name: 'toast',
                        value: {
                          toastNotified: true,
                          message: {
                            id: 'app.referral.link.copy.success',
                          },
                          type: TOAST_TYPE.SUCCESS,
                        },
                      })}
                  >
                    <button
                      type="button"
                      className="btn blue md-btn uppercase"
                      style={{ float: 'right' }}
                    >
                      <i className="fa fa-clipboard" />
                      <FormattedHTMLMessage id="app.referral.link.copy" />
                    </button>
                  </CopyToClipboard>
                </div>
              </div>
              <div className="col-md-10 col-md-offset-1">
                <div className="affiliate">
                  <p className="text-center title">
                    <span className="caption-subject font-blue bold uppercase">
                      <i className=" icon-wallet font-blue" />{' '}
                      <span className="bold">
                        <FormattedMessage id="app.referral.banner.title" />
                      </span>
                    </span>
                  </p>
                  <div className="affiliate-script-content">
                    <p>
                      <FormattedMessage id="app.referral.banner.pleasecopythecode" />
                    </p>
                    <div className="row">
                      <div className="col-md-6">
                        {this.renderAffiliateScriptContent('small')}
                      </div>
                      <div className="col-md-6">
                        <p className="banner-title">
                          <FormattedMessage id="app.referral.banner.small" />
                        </p>

                        <img
                          className="img-responsive lazy"
                          alt="bitmoon referral banner small"
                          src="/assets/global/img/bitmoon/bitmoon_ref_234x60.png"
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        {this.renderAffiliateScriptContent('medium')}
                      </div>
                      <div className="col-md-6">
                        <p className="banner-title">
                          <FormattedMessage id="app.referral.banner.medium" />
                        </p>

                        <img
                          className="img-responsive lazy"
                          alt="bitmoon referral banner medium"
                          src="/assets/global/img/bitmoon/bitmoon_ref_468x60.png"
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        {this.renderAffiliateScriptContent('large')}
                      </div>
                      <div className="col-md-6">
                        <p className="banner-title">
                          <FormattedMessage id="app.referral.banner.large" />
                        </p>

                        <img
                          className="img-responsive lazy"
                          alt="bitmoon referral banner large"
                          src="/assets/global/img/bitmoon/bitmoon_ref_728x90.png"
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        {this.renderPriceTableScriptContent('small')}
                      </div>
                      <div className="col-md-6">
                        <p className="banner-title">
                          <FormattedMessage id="app.referral.pricetable.small" />
                        </p>

                        <img
                          className="img-responsive price-table-design lazy"
                          alt="bitmoon referral banner large"
                          src="/assets/global/img/bitmoon/mini-price-table.png"
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        {this.renderPriceTableScriptContent('large')}
                      </div>
                      <div className="col-md-6">
                        <p className="banner-title">
                          <FormattedMessage id="app.referral.pricetable.large" />
                        </p>

                        <img
                          className="img-responsive mini-price-table-design lazy"
                          alt="bitmoon referral banner large"
                          src="/assets/global/img/bitmoon/price-table.png"
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        {this.renderCalculatorTableScriptContent('large')}
                      </div>
                      <div className="col-md-6">
                        <p className="banner-title">
                          <FormattedMessage id="app.referral.calculator.large" />
                        </p>

                        <img
                          className="img-responsive lazy"
                          alt="bitmoon referral banner large"
                          src="/assets/global/img/bitmoon/calculator-widget.png"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            <RefereeListForm />
          </div>
          <div className="col-md-6">
            <ReferralDetailForm />
          </div>
        </div>
        <ToastNotification />
      </div>,
    ];
  }
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({
  wallet,
  user,
  user: { profile },
  userLevelDefinitions,
}) {
  const detail = (wallet && wallet.detail) || null;
  const firstWallet =
    detail && detail.result && detail.result[0] ? detail.result[0] : null;
  const referees = (user && user.refereeList) || null;
  const userLevelData =
    (userLevelDefinitions && userLevelDefinitions.data) || null;
  const currentUserLevel =
    (userLevelDefinitions && userLevelDefinitions.currentUserLevel) || null;
  const userLevelDataForVerification = userLevelData
    ? userLevelData.filter(item => item.type === USER_GROUP_TYPE.MARKETING)
    : null;
  const userGroup =
    (userLevelDefinitions && userLevelDefinitions.userGroupList) || null;
  return {
    referees,
    user: profile,
    wallet: firstWallet,
    userLevelDataForVerification,
    currentUserLevel,
    userGroup,
  };
}

// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        getWalletDetail,
        createWallet,
        setRuntimeVariable,
        getCurrentUserLevelDefinitions,
        getUserLevelDefinitions,
        getUserComission,
      },
      dispatch,
    ),
  };
}

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(SystemWalletHOC(Referral)),
);
