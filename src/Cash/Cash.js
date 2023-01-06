/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import DepositCashForm from '../Forms/DepositCashForm';
import WithdrawCashForm from '../Forms/WithdrawCashForm';
import { FormattedMessage } from 'react-intl';
import CashHistoryDepositForm from '../Forms/CashHistoryDepositForm';
import CashHistoryWithdrawForm from '../Forms/CashHistoryWithdrawForm';
import BankManagementForm from '../Forms/BankManagementForm';
import { ToastContainer, toast } from 'react-toastify';
import { createWallet, getWalletDetail } from '../Redux/actions/wallet';
import { ERRORS, GLOBAL_VARIABLES, BANK_MANAGEMENT } from '../Helpers/constants/system';
import { formatNumber } from '../Helpers/utils';
import '../assets/css/pages/cash.css';

class Cash extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isCreatingWallet: false,
      isSelectedTab: '',
    };
    this.createUserWallet = this.createUserWallet.bind(this);
  }

  static propTypes = {
    user: PropTypes.object,
    actions: PropTypes.shape({
      createWallet: PropTypes.func.isRequired,
      getWalletDetail: PropTypes.func.isRequired,
    }).isRequired,
  };

  static defaultProps = {
    user: null,
    isEnable2FA: false,
  };

  async createUserWallet() {
    const { actions } = this.props;
    this.toastCreateWalletID = null;
    const toastOptions = {
      autoClose: false,
      closeOnClick: false,
      closeButton: false,
      position: 'top-center',
    };
    this.toastCreateWalletID = toast.info(
      <FormattedMessage id="cash.deposit.createwallet.start" />,
      toastOptions,
    );
    this.setState({
      isCreatingWallet: true,
    });
    await actions.createWallet(GLOBAL_VARIABLES.BASE_CURRENCY);
    let myHandler = setInterval(async () => {
      const err = await actions.getWalletDetail(GLOBAL_VARIABLES.BASE_CURRENCY);
      if (!err) {
        clearInterval(myHandler);
        toast.update(this.toastCreateWalletID, {
          render: <FormattedMessage id="cash.deposit.createwallet.success" />,
          type: toast.TYPE.SUCCESS,
          autoClose: 3000,
          closeButton: null, // The closeButton defined on ToastContainer will be used
        });
        this.setState({
          isCreatingWallet: false,
        });
      }
    }, 3000);
  }
  async componentDidMount() {
    const { actions, type } = this.props;
    const err = await actions.getWalletDetail(GLOBAL_VARIABLES.BASE_CURRENCY);
    if (err === ERRORS.NO_WALLET) {
      this.createUserWallet();
    }
    if (type === GLOBAL_VARIABLES.WALLET_TYPE.WITHDRAWAL) {
      this.setState({
        isSelectedTab: GLOBAL_VARIABLES.WALLET_TYPE.WITHDRAWAL,
      });
    }
  }

  _onClickTab = (tab) => {
    this.setState({
      isSelectedTab: tab
    });
  }

  render() {
    const { user, wallet } = this.props;
    const { isCreatingWallet, isSelectedTab } = this.state;
    const isEnable2FA = (user && user.is_active_google_auth) || false;

    return (
      <div>
        <div className="portlet light bordered paper-3 cash">
          <div className="portlet-body">
            <div className="row">
              <div className="col-md-4 col-md-offset-4">
                <p className="text-center title">
                  <span className="caption-subject font-blue bold uppercase">
                    <i
                      className=" icon-wallet font-blue"
                      style={{ padding: '0 5px 0 0' }}
                    />
                    <FormattedMessage id="app.coin.wallet.table.header.availabletouse" />{' '}
                    : &nbsp;
                  </span>
                  <span className="bold font-blue">
                    {`${formatNumber(
                      (wallet && wallet.available_to_use) || 0,
                    )} VND `}
                  </span>
                </p>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="row visible-xs visible-sm">
                  <div className="col-md-12">
                    <ul className="nav nav-tabs cash-tab">
                      <li
                        className={`${isSelectedTab ===
                          GLOBAL_VARIABLES.WALLET_TYPE.DEPOSIT && 'active'}`}
                      >
                        <a
                          className="tab-deposit-link"
                          href="#tab_deposit"
                          onClick={() => this._onClickTab(GLOBAL_VARIABLES.WALLET_TYPE.DEPOSIT)}
                          data-toggle="tab"
                        >
                          <i className="fa fa-plus-square" />{' '}
                          <FormattedMessage id="app.global.button.deposit" />
                        </a>
                      </li>
                      <li
                        className={`${isSelectedTab ===
                          GLOBAL_VARIABLES.WALLET_TYPE.WITHDRAWAL && 'active'}`}
                      >
                        <a
                          className="tab-withdrawal-link"
                          href="#tab_withdrawal"
                          onClick={() => this._onClickTab(GLOBAL_VARIABLES.WALLET_TYPE.WITHDRAWAL)}
                          data-toggle="tab"
                          aria-expanded="false"
                        >
                          <i className="fa fa-minus-square" />{' '}
                          <FormattedMessage id="app.global.button.withdraw" />
                        </a>
                      </li>
                      <li
                        className={`${isSelectedTab === BANK_MANAGEMENT && 'active'}`}
                      >
                        <a
                          className="tab-bank-link"
                          href="#tab_bank"
                          onClick={() => this._onClickTab(BANK_MANAGEMENT)}
                          data-toggle="tab"
                          aria-expanded="false"
                        >
                          <i className="fa fa-bank" />{' '}
                          <FormattedMessage id="app.global.button.bankManagement" />
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-3 hidden-xs hidden-sm">
                    <ul className="nav nav-tabs tabs-left cash-tab">
                      <li
                        className={`${isSelectedTab ===
                          GLOBAL_VARIABLES.WALLET_TYPE.DEPOSIT && 'active'}`}
                      >
                        <a
                          className="tab-deposit-link"
                          href="#tab_deposit"
                          data-toggle="tab"
                          aria-expanded="true"
                        >
                          <i className="fa fa-plus-square" />{' '}
                          <FormattedMessage id="app.global.button.deposit" />
                        </a>
                      </li>
                      <li
                        className={`${isSelectedTab ===
                          GLOBAL_VARIABLES.WALLET_TYPE.WITHDRAWAL && 'active'}`}
                      >
                        <a
                          className="tab-withdrawal-link"
                          href="#tab_withdrawal"
                          data-toggle="tab"
                          aria-expanded="false"
                        >
                          <i className="fa fa-minus-square" />{' '}
                          <FormattedMessage id="app.global.button.withdraw" />
                        </a>
                      </li>
                      <li
                        className={`${isSelectedTab === BANK_MANAGEMENT && 'active'}`}
                      >
                        <a
                          className="tab-bank-link"
                          href="#tab_bank"
                          data-toggle="tab"
                          aria-expanded="false"
                        >
                          <i className="fa fa-bank" />{' '}
                          <FormattedMessage id="app.global.button.bankManagement" />
                        </a>
                      </li>
                      <li className="empty-li" />
                    </ul>
                  </div>
                  <div className="col-md-9 col-sm-12 col-xs-12">
                    <div className="tab-content">
                      {!isSelectedTab &&
                        <div className="tab-pane active" id="tab-launch">
                          <div className="col-md-12 mt-50">
                            <div className="col-md-6 col-sm-6 col-xs-6">
                              <button type="button"
                                onClick={() => this._onClickTab(GLOBAL_VARIABLES.WALLET_TYPE.DEPOSIT)}
                                className="btn blue col-md-8 col-sm-6 col-xs-12">
                                <FormattedMessage id="app.global.button.deposit" />
                              </button>
                            </div>
                            <div className="col-md-6 col-sm-6 col-xs-6">
                              <button type="button"
                                onClick={() => this._onClickTab(GLOBAL_VARIABLES.WALLET_TYPE.WITHDRAWAL)}
                                className="btn red col-md-8 col-sm-6 col-xs-12">
                                <FormattedMessage id="app.global.button.withdraw" />
                              </button>
                            </div>
                          </div>
                        </div>
                      }

                      <div
                        className={`tab-pane ${isSelectedTab ===
                          GLOBAL_VARIABLES.WALLET_TYPE.DEPOSIT
                          ? 'active in'
                          : 'fade'}`}
                        id="tab_deposit"
                      >
                        <div className="panel panel-default">
                          <div className="panel-body">
                            <DepositCashForm
                              isCreatingWallet={isCreatingWallet}
                            />
                          </div>
                        </div>
                      </div>
                      <div
                        className={`tab-pane ${isSelectedTab ===
                          GLOBAL_VARIABLES.WALLET_TYPE.WITHDRAWAL
                          ? 'active in'
                          : 'fade'}`}
                        id="tab_withdrawal"
                      >
                        <div className="panel panel-default">
                          <div className="panel-body">
                            <WithdrawCashForm
                              isEnable2FA={isEnable2FA}
                              isCreatingWallet={isCreatingWallet}
                            />
                          </div>
                        </div>
                      </div>
                      <div
                        className={`tab-pane ${isSelectedTab ===
                          BANK_MANAGEMENT
                          ? 'active in'
                          : 'fade'}`}
                        id="tab_bank"
                      >
                        <div className="panel panel-default">
                          <div className="panel-body">
                            <BankManagementForm
                              isEnable2FA={isEnable2FA}
                              isCreatingWallet={isCreatingWallet}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={isSelectedTab === GLOBAL_VARIABLES.WALLET_TYPE.DEPOSIT
          ? 'hidden-xs hidden-sm show'
          : 'hidden-xs hidden-sm'}>
          <div className="row">
            <div className="col-md-12">
              <div className="portlet-body">
                <CashHistoryDepositForm />
              </div>
            </div>
          </div>
        </div>
        <div className={isSelectedTab === GLOBAL_VARIABLES.WALLET_TYPE.WITHDRAWAL
          ? 'hidden-xs hidden-sm show'
          : 'hidden-xs hidden-sm'}>
          <div className="row">
            <div className="col-md-12">
              <div className="portlet-body">
                <CashHistoryWithdrawForm />
              </div>
            </div>
          </div>
        </div>
        <div className="clearfix" />
        <ToastContainer />
      </div>
    );
  }
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ user, wallet }) {
  const userData = (user && user.profile) || null;
  const detail = (wallet && wallet.detail) || null;
  const firstWallet =
    detail && detail.result && detail.result[0] ? detail.result[0] : null;
  return {
    user: userData,
    wallet: firstWallet,
  };
}

// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ getWalletDetail, createWallet }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Cash);
