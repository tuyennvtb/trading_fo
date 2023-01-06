/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { FormattedMessage } from 'react-intl';
import { getActiveWallets, getWalletDetail } from '../Redux/actions/wallet';
import WalletSendForm from '../Forms/WalletSendForm';
import WalletForm from '../Forms/WalletForm';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { ERRORS, GLOBAL_VARIABLES } from '../Helpers/constants/system';
import { formatNumber } from '../Helpers/utils';
import ModalDialog from '../Processing/ModalDialog';
import { getCoinsInfo } from '../Redux/actions/coin';
import { SocketIOHost } from '../Core/config';
import openSocket from 'socket.io-client';
import CheckboxFilter from '../Helpers/CheckboxFilter';
import Checkbox from 'material-ui/Checkbox';
import Link from '../Link';
import history from '../history';
import ExchangeOptionDialog from '../Exchange/ExchangeOptionDialog';
import UserWarningMessage from '../Processing/UserWarningMessageOC';
import WalletDepositGroup from './WalletDepositGroup'
import WalletWithdrawGroup from './WalletWithdrawGroup'
import '../assets/css/pages/wallet.css';
import { getSettingsByItem } from '../Redux/actions/settings';

class Wallet extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      getActiveWallets: PropTypes.func.isRequired,
      getWalletDetail: PropTypes.func.isRequired,
    }).isRequired,
    wallets: PropTypes.array, // eslint-disable-line react/forbid-prop-types, react/require-default-props
    detail: PropTypes.object, // eslint-disable-line react/forbid-prop-types, react/require-default-props
    isEnable2FA: PropTypes.bool,
  };
  static defaultProps = {
    wallets: [],
    detail: null,
    isEnable2FA: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      isDetailLoadding: false,
      error: '',
      coinCode: '',
      coinName: '',
      isNoWallet: false,
      isOpenSendingPopup: false,
      isOpenReceivePopup: false,
      checked: false,
      isTriggeredDepositHandler: false,
      isShowExchangeOptions: false,
      selectedCoinId: '',
      isOpenSendingGroupPopup: false,
      isOpenWithdrawGroupPopup: false,
      coinGroup: null,
      isFetch: false,
      settingWithdrawDeposit: {}
    };
    this.generateDetail = this.generateDetail.bind(this);
    this.cellStringFormatter = this.cellStringFormatter.bind(this);
    this.allRemainingCoinsVND = this.allRemainingCoinsVND.bind(this);
    this.remainBalanceVND = this.remainBalanceVND.bind(this);
    this.socket = openSocket(SocketIOHost);
  }

  async componentDidMount() {
    const { actions } = this.props;
    await actions.getActiveWallets();
    actions.getCoinsInfo();
    this.loadSetting();
  }

  componentWillReceiveProps(nextProps) {
    const { settings } = nextProps;
    if (!this.state.isFetch
      && settings
      && settings.item === 'disabled_withdraw_deposit'
    ) {
      this.setState({
        settingWithdrawDeposit: settings.value,
        isFetch: true
      });
    }
  }

  componentDidUpdate() {
    const { user } = this.props;
    if (user && user.is_active_cmnd && !this.state.isTriggeredDepositHandler) {
      const { coinID, wallets } = this.props;
      if (coinID && wallets.length > 0) {
        const coin = wallets.find(x => x.coin_id === coinID);
        this.depositHandler(coin);
        this.setState({
          isTriggeredDepositHandler: true,
        });
      }
    }
  }

  componentWillUnmount() {
    this.socket.close();
  }

  loadSetting = () => {
    this.props.dispatch(getSettingsByItem('disabled_withdraw_deposit'));
  }

  checkEnableButton = (coin_id, type) => {
    if (!_.isEmpty(this.state.settingWithdrawDeposit)) {
      const setting = this.state.settingWithdrawDeposit;
      if (type == 'withdraw') {
        if (setting.withdraw_status) {
          let coins = setting.withdraw_allow_list.split(',');
          coins = coins.map(item => item.trim());
          if (coins.indexOf(coin_id) >= 0) {
            return true;
          }
          return false;
        }
      } else {
        if (setting.deposit_status) {
          let coins = setting.deposit_allow_list.split(',');
          coins = coins.map(item => item.trim());
          if (coins.indexOf(coin_id) >= 0) {
            return true;
          }
          return false;
        }
      }
    }
    return true;
  }

  updateCheck(event) {
    const isChecked = event.target.checked;
    this.setState({
      checked: event.target.checked,
    });
    this.refs.balance.customFilter.filter(isChecked);
  }
  allRemainingCoinsVND() {
    const { wallets, coinsInfo, coinsInfoUptoDate } = this.props;
    let currentCoinsInfo = coinsInfoUptoDate ? coinsInfoUptoDate : coinsInfo;
    let sum = 0;
    if (
      wallets &&
      wallets.length > 0 &&
      currentCoinsInfo &&
      currentCoinsInfo.length > 0
    ) {
      // let currentCoin = currentCoinsInfo.find(coin => coin.coin_id === val.coin_id)
      //currentCoin = currentCoin ? currentCoin : 0;
      for (let wallet of wallets) {
        let currentCoin = currentCoinsInfo.find(
          coin => coin.coin_id === wallet.coin_id,
        );
        if (wallet.current_balance > 0 && currentCoin) {
          sum += wallet.current_balance * currentCoin.ask_price_vnd;
        }
      }
      return sum;
    }
  }

  remainBalanceVND() {
    const { wallets } = this.props;
    if (wallets && wallets.length > 0) {
      const vndWallet = wallets.find(
        coin => coin.coin_id === GLOBAL_VARIABLES.BASE_CURRENCY,
      );
      let remainingBalance = vndWallet.current_balance
        ? vndWallet.current_balance
        : 0;
      return remainingBalance;
    }
  }

  async generateDetail(
    name,
    coin_code,
    coin_id,
    isActive,
    isSendingType = false,
  ) {
    const { actions } = this.props;
    this.setState({
      isDetailLoadding: true,
      error: '',
      coinCode: coin_code,
      coinId: coin_id,
      coinName: '',
      is_active: isActive,
      isNoWallet: false,
      isOpenSendingPopup: isSendingType,
      isOpenReceivePopup: !isSendingType,
    });

    const err = await actions.getWalletDetail(
      coin_id,
      true,
      'BUY',
      null,
      coin_code,
    );
    if (err && err === ERRORS.NO_WALLET) {
      return this.setState({
        isDetailLoadding: false,
        error: err,
        coinCode: coin_code,
        coinName: '',
        isNoWallet: true,
      });
    }

    return this.setState({
      isDetailLoadding: false,
      coinCode: coin_code,
      coinId: coin_id,
      coinName: name,
    });
  }

  getCustomFilter(filterHandler, customFilterParameters) {
    return (
      <CheckboxFilter
        filterHandler={filterHandler}
        textOK={customFilterParameters.textOK}
        setDefaultCheck={this.state.checked}
      />
    );
  }
  cellStringFormatter(cell, row) {
    return <strong>{formatNumber(cell)}</strong>;
  }

  depositHandler = row => {
    if (!!row.allow_deposit && !!row.is_fake_wallet && !!row.is_active) {
      if (row.coin_id === GLOBAL_VARIABLES.BASE_CURRENCY) {
        history.push('/cash');
      } else {
        history.push(`/coin-deposit/${row.coin_id}`);
      }
    } else if (row.group) {
      this.setState({
        isOpenSendingGroupPopup: true,
        group: row.group,
        coinCode: row.coin_code,
        coinId: row.coin_id,
        coinName: row.coin_name,
      })
    } else {
      this.generateDetail(
        row.coin_name,
        row.coin_code,
        row.coin_id,
        row.is_wallet_active,
        false,
      );
    }
  };
  withdrawalHandler = row => {
    if (row.coin_id === GLOBAL_VARIABLES.BASE_CURRENCY) {
      history.push('/cash/withdraw');
    } else if (row.group) {
      this.setState({
        isOpenWithdrawGroupPopup: true,
        group: row.group,
        coinCode: row.coin_code,
        coinId: row.coin_id,
        coinName: row.coin_name,
      })
    } else {
      this.generateDetail(
        row.coin_name,
        row.coin_code,
        row.coin_id,
        row.is_wallet_active,
        true,
      );
    }
  };
  coinNameFormatter(cell, row) {
    return (
      <div>
        <img
          className="img-responsive coin-logo lazy"
          alt="..."
          src={`/assets/global/img/coin-logo/${row.coin_id}.png`}
        />
        <span className="coin-name">{cell}</span>
      </div>
    );
  }
  cellCombinedFormatter(cell, row) {
    return (
      <div>
        <div className="hidden-xs hidden-sm">
          <strong>{formatNumber(cell)}</strong>
        </div>
        <div className="visible-xs visible-sm combined-block">
          <p className="title">
            <FormattedMessage id="app.coin.wallet.table.header.sendpending" />:
          </p>
          <p>{formatNumber(cell)}</p>
          <p className="title">
            <FormattedMessage id="app.coin.wallet.table.header.depositpending" />:
          </p>
          <p>{formatNumber(row.receive_holding_balance)}</p>
          <p className="title">
            <FormattedMessage id="app.coin.wallet.table.header.availabletouse" />:
          </p>
          <p>{formatNumber(row.current_balance)}</p>
        </div>
      </div>
    );
  }

  withdrawLinkFormatter(cell, row) {
    let cellLink = (
      <button
        type="button"
        className="btn btn-outline btn-circle red-mint disabled"
      >
        <FormattedMessage id="app.coin.wallet.disable.name" />
      </button>
    );
    if (!!row.allow_withdraw) {
      if (this.checkEnableButton(row.coin_id, 'withdraw')) {
        cellLink = (
          <a
            onClick={() => this.withdrawalHandler(row)}
            className="btn btn-outline btn-circle red-mint wallet-button"
            data-toggle="modal"
          >
            <i className="fa fa-upload" />{' '}
            <span className="hidden-xs hidden-sm">
              <FormattedMessage id="app.coin.wallet.withdraw.enable.name" />
            </span>
            <span className="visible-xs visible-sm">
              <FormattedMessage id="app.coin.wallet.withdraw.enable.name.short" />
            </span>
          </a>
        );
      }
    }

    return cellLink;
  }

  depositLinkFormatter(cell, row) {
    let cellLink = (
      <button
        type="button"
        className="btn btn-outline btn-circle blue disabled wallet-button"
      >
        <FormattedMessage id="app.coin.wallet.disable.name" />
      </button>
    );
    if (!!row.allow_deposit && !!row.is_active) {
      if (this.checkEnableButton(row.coin_id, 'deposit')) {
        cellLink = (
          <Link
            onClick={() => this.depositHandler(row)}
            className="btn btn-outline btn-circle blue wallet-button"
          >
            <i className="fa fa-download" />{' '}
            <span className="hidden-xs hidden-sm">
              <FormattedMessage id="app.coin.wallet.deposit.name" />
            </span>
            <span className="visible-xs visible-sm">
              <FormattedMessage id="app.coin.wallet.deposit.name.short" />
            </span>
          </Link>
        );
      }
    }

    return (
      <div>
        <div>{cellLink}</div>
        <div className="visible-xs visible-sm margin-top-15">
          {this.withdrawLinkFormatter(cell, row)}
        </div>
        <div className="visible-xs visible-sm margin-top-15">
          {this.exchangeLinkFormatter(cell, row)}
        </div>
      </div>
    );
  }

  onCompletion = () => {
    this.setState({
      isShowExchangeOptions: false,
    });
    history.push(`/mua-ban/${this.state.selectedCoinId}`);
  };

  handleExchangeButtonPressed = row => {
    const isNormal = true;
    if (!!row.is_allow_simple_trade && isNormal) {
      this.setState({
        isShowExchangeOptions: true,
        selectedCoinId: row.coin_id,
      });
    } else if (!!row.is_allow_simple_trade) {
      history.push(`/mua-ban-nhanh/${row.coin_id}`);
    } else {
      history.push(`/mua-ban/${row.coin_id}`);
    }
  };

  closeExchangeOptionDialog = isShow => {
    this.setState({
      isShowExchangeOptions: isShow,
    });
  };

  exchangeLinkFormatter(cell, row) {
    let cellLink = null;
    cellLink = (
      <button
        onClick={() => this.handleExchangeButtonPressed(row)}
        className="btn btn-outline btn-circle yellow wallet-button"
      >
        <i className=" icon-layers" />{' '}
        <span className="hidden-xs hidden-sm">
          <FormattedMessage id="app.coin.wallet.exchange.name" />
        </span>
        <span className="visible-xs visible-sm">
          <FormattedMessage id="app.coin.wallet.exchange.name.short" />
        </span>
      </button>
    );
    if (row.coin_code !== 'VND') {
      return cellLink;
    } else {
      return null;
    }
  }

  onGroupCloseModal = () => {
    this.setState({
      isOpenSendingGroupPopup: false,
    });
  }

  onWithdrawGroupCloseModal = () => {
    this.setState({
      isOpenWithdrawGroupPopup: false,
    });
  }

  onCloseHandler() {
    this.setState({
      isOpenSendingPopup: false,
    });
  }

  onDepositFormCloseHandler() {
    this.setState({
      isOpenReceivePopup: false,
    });
  }

  render() {
    const { detail, isEnable2FA } = this.props;
    let { wallets } = this.props;
    const { group } = this.state;
    const {
      isDetailLoadding,
      coinName,
      coinCode,
      coinId,
      is_active,
      isNoWallet,
    } = this.state;
    var customStyles = {
      content: {
        top: '55%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
      },
    };
    const styles = {
      block: {
        maxWidth: 250,
      },
      checkbox: {
        marginBottom: 16,
      },
    };
    const labelStyle = {
      color: '#000000',
      fontWeight: 'bold',
    };

    if (wallets && wallets.length > 0) {
      wallets = wallets.sort(
        (a, b) =>
          parseInt(a.sort_no, 10) - parseInt(b.sort_no, 10) ||
          a.coin_id.localeCompare(b.coin_id),
      );
    }
    return (
      <div className="row">
        <div className="col-md-12">
          <div className="portlet mt-element-ribbon light portlet-fit bordered paper-3">
            <div className="ribbon ribbon-left ribbon-vertical-left ribbon-shadow ribbon-border-dash-vert ribbon-color-primary uppercase">
              <div className="ribbon-sub ribbon-bookmark" />
              <i className="icon-support" />
            </div>
            <div className="portlet-title">
              <div className="caption">
                <span
                  className="caption-subject bold uppercase"
                  style={{ color: '#c27d0e', paddingLeft: '10px' }}
                >
                  <FormattedMessage id="app.leftnavigation.profile.wallet" />
                </span>
              </div>
              <div className="col-md-12">
                <p className="text-center title col-md-6 col-xs-12">
                  <span className="caption-subject font-blue bold uppercase">
                    <i
                      className=" icon-wallet font-blue"
                      style={{ padding: '0 5px 0 0' }}
                    />
                    <FormattedMessage id="p2.wallet.allcoinbalance" /> : &nbsp;
                  </span>
                  <span className="bold font-blue">
                    {`${formatNumber(this.allRemainingCoinsVND())} VNĐ`}
                  </span>
                </p>
                <p className="text-center title col-md-6 col-xs-12">
                  <span className="caption-subject font-blue bold uppercase">
                    <i
                      className=" icon-wallet font-blue"
                      style={{ padding: '0 5px 0 0' }}
                    />
                    <FormattedMessage id="p2.wallet.vndbalance" /> : &nbsp;
                  </span>
                  <span className="bold font-blue">
                    {`${formatNumber(this.remainBalanceVND())} VNĐ`}
                  </span>
                </p>
              </div>
            </div>
            <div className="portlet-body wallet">
              {wallets && wallets.length > 0 ? (
                <div>
                  <Checkbox
                    label={
                      <FormattedMessage id="p2.wallet.checkbox.filterbalance" />
                    }
                    checked={this.state.checked}
                    onCheck={this.updateCheck.bind(this)}
                    style={styles.checkbox}
                    labelStyle={labelStyle}
                  />

                  <BootstrapTable
                    data={wallets}
                    bordered={false}
                    hover
                    pagination
                    condensed
                    multiColumnSort={3}
                    search
                    options={{
                      clearSearch: true,
                      searchPosition: 'left',
                    }}
                  >
                    <TableHeaderColumn
                      dataField="id"
                      // width="50px"
                      dataAlign="center"
                      hidden
                      columnClassName="id-col"
                      className="id-col-header"
                    >
                      #
                    </TableHeaderColumn>
                    <TableHeaderColumn
                      dataFormat={this.coinNameFormatter}
                      dataField="coin_name"
                      dataSort
                      columnClassName="coin-name-col"
                      className="coin-name-col-header"
                    >
                      <FormattedMessage id="app.coin.wallet.table.header.name" />
                    </TableHeaderColumn>
                    <TableHeaderColumn
                      hidden
                      // width="150px"
                      dataField="coin_code"
                      dataSort
                    >
                      <FormattedMessage id="app.coin.wallet.table.header.name" />
                    </TableHeaderColumn>
                    <TableHeaderColumn
                      dataFormat={this.cellCombinedFormatter}
                      dataAlign="right"
                      // width="20%"
                      dataField="send_holding_balance"
                      columnClassName="send-holding-balance-col"
                      className="send-holding-balance-col-header"
                      dataSort
                    >
                      <FormattedMessage id="app.coin.wallet.table.header.sendpending" />
                    </TableHeaderColumn>
                    <TableHeaderColumn
                      dataField="receive_holding_balance"
                      dataSort
                      dataAlign="right"
                      // width="15%"
                      hidden
                      columnClassName="receive-holding-balance-col"
                      className="receive-holding-balance-col-header"
                      dataFormat={this.cellStringFormatter}
                    >
                      <FormattedMessage id="app.coin.wallet.table.header.depositpending" />
                    </TableHeaderColumn>
                    <TableHeaderColumn
                      ref="balance"
                      filter={{
                        type: 'CustomFilter',
                        getElement: this.getCustomFilter.bind(this),
                        customFilterParameters: { textOK: 'yes' },
                      }}
                      dataSort
                      dataField="current_balance"
                      dataAlign="right"
                      hidden
                      columnClassName="current-balance-col"
                      className="current-balance-col-header"
                      dataFormat={this.cellStringFormatter}
                    >
                      <FormattedMessage id="app.coin.wallet.table.header.availabletouse" />
                    </TableHeaderColumn>
                    <TableHeaderColumn
                      dataField="current_balance"
                      dataAlign="center"
                      columnClassName="deposit-link-col"
                      className="deposit-link-col-header"
                      dataFormat={this.depositLinkFormatter.bind(this)}
                      disable={true}
                    />
                    <TableHeaderColumn
                      dataField="current_balance"
                      dataAlign="center"
                      columnClassName="withdraw-link-col"
                      className="withdraw-link-col-header"
                      dataFormat={this.withdrawLinkFormatter.bind(this)}
                    />
                    <TableHeaderColumn
                      dataField="current_balance"
                      dataAlign="center"
                      columnClassName="withdraw-link-col"
                      className="withdraw-link-col-header"
                      dataFormat={this.exchangeLinkFormatter.bind(this)}
                    />
                    <TableHeaderColumn
                      hidden
                      isKey
                      dataField="coin_code"
                      dataSort
                    >
                      Coin Code
                    </TableHeaderColumn>
                  </BootstrapTable>
                </div>
              ) : (
                  <p className="spin-loading">
                    <FormattedMessage id="app.home.ucoin.banner.header.title" />
                  </p>
                )}
            </div>
          </div>
        </div>

        <ModalDialog
          isOpen={this.state.isOpenSendingPopup}
          customStyles={customStyles}
        >
          <div className="modal-dialog sending-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-hidden="true"
                  onClick={this.onCloseHandler.bind(this)}
                />
                <h4 className="modal-title">
                  <i className="fa fa-upload" />&nbsp;<FormattedMessage id="app.sendcoin.withdraw.header" />
                </h4>
              </div>
              <div className="modal-body">
                {(!isDetailLoadding && isNoWallet) ||
                  (detail &&
                    detail.result &&
                    detail.result[0].coin_id.toLowerCase() ===
                    (coinId && coinId.toLowerCase())) ? (
                    <WalletSendForm
                      coinCode={coinCode}
                      coinName={coinName}
                      coinId={coinId}
                      isEnable2FA={isEnable2FA}
                      depositCloseModal={this.onCloseHandler.bind(this)}
                    />
                  ) : (
                    <p className="spin-loading">
                      <FormattedMessage id="app.global.text.loading" />
                    </p>
                  )}
              </div>
            </div>
          </div>
        </ModalDialog>

        <ModalDialog
          isOpen={this.state.isOpenReceivePopup}
          customStyles={customStyles}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-hidden="true"
                  onClick={this.onDepositFormCloseHandler.bind(this)}
                />
                <h4 className="modal-title">
                  <i className="fa fa-download" />&nbsp;<FormattedMessage id="app.global.button.deposit" />
                </h4>
              </div>
              <div className="modal-body">
                {(!isDetailLoadding && isNoWallet) ||
                  (detail &&
                    detail.result &&
                    detail.result[0].coin_id.toLowerCase() ===
                    (coinId && coinId.toLowerCase())) ? (
                    <div className="row">
                      <div className="col-md-12">
                        <WalletForm
                          coinCode={coinCode}
                          coinName={coinName}
                          coinId={coinId}
                          isActive={is_active}
                          closeModal={this.onDepositFormCloseHandler.bind(this)}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="spin-loading">
                      <FormattedMessage id="app.global.text.loading" />
                    </p>
                  )}
              </div>
            </div>
          </div>
        </ModalDialog>

        <ModalDialog
          isOpen={this.state.isOpenSendingGroupPopup}
          customStyles={customStyles}
        >
          <div className="modal-dialog sending-dialog">
            <div className="modal-content">
              <WalletDepositGroup
                coinId={coinId}
                group={group && group.sort().reverse()}
                coinName={coinName}
                isEnable2FA={isEnable2FA}
                closeModal={this.onGroupCloseModal}
              />

            </div>
          </div>
          <div>
          </div>
        </ModalDialog>

        <ModalDialog
          isOpen={this.state.isOpenWithdrawGroupPopup}
          customStyles={customStyles}
        >
          <div className="modal-dialog sending-dialog">
            <div className="modal-content">
              <WalletWithdrawGroup
                coinId={coinId}
                group={group && group.sort().reverse()}
                coinName={coinName}
                isEnable2FA={isEnable2FA}
                depositCloseModal={this.onWithdrawGroupCloseModal}
              />
              <div>
              </div></div>
          </div>
        </ModalDialog>

        <ExchangeOptionDialog
          isShowExchangeOptions={this.state.isShowExchangeOptions}
          selectedCoinId={this.state.selectedCoinId}
          closeExchangeOptionDialog={this.closeExchangeOptionDialog}
          onCompletion={this.onCompletion}
        />
      </div>
    );
  }
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ wallet, coinsInfo, user: { profile }, settings }) {
  const wallets = (wallet && wallet.list) || null;
  const detail = (wallet && wallet.detail) || null;
  const coins = (coinsInfo && coinsInfo.coinsList) || null;
  const coinsInfoUptoDate = (coinsInfo && coinsInfo.coinsListUptoDate) || null;
  return {
    wallets,
    detail,
    user: profile,
    isEnable2FA: (profile && profile.is_active_google_auth) || false,
    coinsInfo: coins,
    coinsInfoUptoDate,
    settings
  };
}

// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      { getActiveWallets, getWalletDetail, getCoinsInfo },
      dispatch,
    ),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(
  UserWarningMessage(Wallet),
);
