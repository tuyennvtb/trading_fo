import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { reduxForm, Field, SubmissionError } from 'redux-form';
import { bindActionCreators } from 'redux';
import { Cookies } from 'react-cookie';
import { toast } from 'react-toastify';
import { BigNumber } from 'bignumber.js';
import history from '../history';
import { redirect } from '../Core/config';
import ToastNotification from '../Processing/ToastNotification.js';
import '../assets/css/pages/exchange.css';
import ModalDialog from '../Processing/ModalDialog';
import { formatNumber, formatPureNumber } from '../Helpers/utils';
import Input from '../Forms/Renders/Input';
import openSocket from 'socket.io-client';
import { SocketIOHost } from '../Core/config';
import { getSWAPListCoins, getSwapHistory, estimateSwap, resetEstimateSwap } from '../Redux/actions/swap';
import SwapConfirm from './SwapConfirm';
import SelectCoin from './SelectCoin';
import { ERRORS } from '../Helpers/constants/system';
import { createWallet, getWalletDetail } from '../Redux/actions/wallet';
import SwapHistory from './SwapHistory';
import { setRuntimeVariable } from '../Redux/actions/runtime';
BigNumber.config({ DECIMAL_PLACES: 5 });


const cookies = new Cookies();
class SwapCoin extends React.Component {
  constructor(props) {
    super(props);
    this.socket = openSocket(SocketIOHost);
  }

  state = {
    isAuthenticated: cookies.get('uid_btm_token') ? true : false,
    optionA: [],
    selectedA: '',
    optionB: [],
    selectedB: '',
    highlightPercent: 0,
    openModal: false,
    objCoins: {},
    arrCurrency: [],
    arrCoins: [],
    fee: 0,
    minimun_swap: 0,
    dataConfirm: {},
    tab: "tab1"
  }

  componentDidMount() {
    const { actions, coins } = this.props;
    actions.getSWAPListCoins(this.socket);
    this.setupPage();
    if (this.state.isAuthenticated) {
      this.getHistory();
    }

    if (coins && coins.length) {
      this.loadListSwap(coins);
    }
  }

  async componentWillReceiveProps(nextProps) {
    if (nextProps.coins.length) {
      const listCoin = nextProps.coins;
      this.loadListSwap(listCoin);
    }

    const { swapConfirm, actions } = this.props;
    if (swapConfirm && swapConfirm.status) {
      actions.resetEstimateSwap();
      this.updateDataConfirm(swapConfirm.confirm);
      actions.loading({
        name: 'loading',
        value: false,
      });
    }
  }

  componentWillUnmount() {
    this.socket.close();
  }

  loadListSwap = async (listCoin) => {
    if (_.isEmpty(this.state.objCoins)) {
      const objCoins = {};
      const arrCurrency = [];
      listCoin.forEach(item => {
        if (!objCoins[item.from_coin_id]) {
          objCoins[item.from_coin_id] = [];
        }
        objCoins[item.from_coin_id].push(item);
        arrCurrency.push(item.from_coin_id);
        if (!objCoins[item.to_coin_id]) {
          objCoins[item.to_coin_id] = [];
        }
        objCoins[item.to_coin_id].push(item);
      });
      await this.setState({
        objCoins,
        arrCurrency: _.uniq(arrCurrency),
      })

      const { from_coin, to_coin } = this.props;
      this.loadOptionSelect(from_coin, to_coin);
    }
  }

  getHistory = () => {
    const { actions } = this.props;
    actions.getSwapHistory();
  }

  updateDataConfirm = (confirm) => {
    const { dataConfirm } = this.state;
    this.setState({
      dataConfirm: { ...dataConfirm, ...confirm },
      openModal: true
    })
  }

  setupPage = async (from_coin = null, to_coin = null) => {
    if (!from_coin) from_coin = this.props.from_coin;
    if (!to_coin) to_coin = this.props.to_coin;
    from_coin = from_coin.toUpperCase();
    to_coin = to_coin.toUpperCase();
    const { isAuthenticated } = this.state;
    if (isAuthenticated) {
      const err1 = await this._getDetailWallet(from_coin, 'BUY');
      const err2 = await this._getDetailWallet(to_coin, 'SELL');
      if (err1 === ERRORS.NO_WALLET) {
        this.createUserWallet(from_coin, 'BUY');
      }

      if (err2 === ERRORS.NO_WALLET) {
        this.createUserWallet(to_coin, 'SELL');
      }
    }
  };

  _getDetailWallet = async (coin_id, type) => {
    const { actions } = this.props;
    return await actions.getWalletDetail(
      coin_id,
      true,
      type,
      this.socket,
    );
  }

  createUserWallet = (coin_id, type) => {
    const { actions } = this.props;
    const { isAuthenticated } = this.state;
    if (isAuthenticated) {
      this.toastCreateWalletID = null;
      const toastOptions = {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        position: 'top-center',
        className: 'toast-notify-custom',
      };
      this.toastCreateWalletID = toast.info(
        <FormattedMessage id="cash.deposit.createwallet.start" />,
        toastOptions,
      );

      actions.createWallet(coin_id);
      let myHandler = setInterval(async () => {
        const err = await this._getDetailWallet(coin_id, type);
        if (!err) {
          clearInterval(myHandler);
          toast.update(this.toastCreateWalletID, {
            render: <FormattedMessage id="cash.deposit.createwallet.success" />,
            type: toast.TYPE.SUCCESS,
            autoClose: 3000,
            closeButton: null, // The closeButton defined on ToastContainer will be used
          });
        }
      }, 3000);
    }
  };

  loadOptionSelect = (from_coin, to_coin) => {
    const { arrCurrency, objCoins } = this.state;
    if (arrCurrency.indexOf(from_coin) >= 0) {
      if (objCoins[from_coin] && objCoins[from_coin].length) {
        let selectedFrom = '';
        let optionFrom = [];
        let selectedTo = '';
        let optionTo = [];
        objCoins[from_coin].map(item => {
          if (!selectedFrom && from_coin == item.from_coin_id) {
            selectedFrom = this.getOptionSelect(item.from_coin_id, item.from_coin_code);
            optionFrom.push(this.getOptionSelect(item.from_coin_id, item.from_coin_code));
          }

          if (!selectedTo && to_coin == item.to_coin_id) {
            selectedTo = this.getOptionSelect(item.to_coin_id, item.to_coin_code);
          }
          optionTo.push(this.getOptionSelect(item.to_coin_id, item.to_coin_code));
        });
        this.setState({
          optionA: optionFrom,
          selectedA: selectedFrom,
          optionB: optionTo,
          selectedB: selectedTo
        });
      }
    } else if (arrCurrency.indexOf(to_coin) >= 0) {
      if (objCoins[to_coin] && objCoins[to_coin].length) {
        let selectedFrom = '';
        let optionFrom = [];
        let selectedTo = '';
        let optionTo = [];
        objCoins[to_coin].map(item => {
          if (!selectedFrom && to_coin == item.from_coin_id) {
            selectedFrom = this.getOptionSelect(item.from_coin_id, item.from_coin_code);
            optionFrom.push(this.getOptionSelect(item.from_coin_id, item.from_coin_code));
          }

          if (!selectedTo && from_coin == item.to_coin_id) {
            selectedTo = this.getOptionSelect(item.to_coin_id, item.to_coin_code);
          }
          optionTo.push(this.getOptionSelect(item.to_coin_id, item.to_coin_code));
        });
        this.setState({
          optionA: optionFrom,
          selectedA: selectedFrom,
          optionB: optionTo,
          selectedB: selectedTo
        });
      }
    }
  }

  getOptionSelect = (value, code) => {
    const option = {
      value: value,
      label: <span className="icon">
        <img alt={code} src={`/assets/global/img/coin-logo/${value}.png`} className="lazy" />
        {code}
      </span>,
      data: {
        coin_id: value,
        coin_code: code
      }
    };;
    return option
  }

  _enableHistory = () => {
    this.setState({
      tab: 'tab2'
    });
  }

  customFilter = (option, searchText) => {
    if (
      option.data.coin_code.toLowerCase().includes(searchText.toLowerCase()) ||
      option.data.coin_id.toLowerCase().includes(searchText.toLowerCase())
    ) {
      return true;
    } else {
      return false;
    }
  }

  _onChangeDropdown = (from, to) => {
    const url = `${redirect.swap}/${from}/${to}`;
    this.loadOptionSelect(from, to);
    history.push(url)
  }

  _reset = () => {
    const { change } = this.props;
    change('from', 0);
    change('to', 0);
  }

  _onChangeIcoin = async (type, option) => {
    this._reset();
    if (option) {
      const { arrCurrency } = this.state;
      const { from_coin, to_coin } = this.props;
      let from = from_coin;
      let to = to_coin;
      if (arrCurrency.indexOf(from_coin) >= 0) {
        if (type == 'currency') {
          from = option.value
        } else if (type == 'coin') {
          to = option.value
        }
      } else if (arrCurrency.indexOf(to_coin) >= 0) {
        if (type == 'currency') {
          to = option.value
        } else if (type == 'coin') {
          from = option.value
        }
      }
      this._onChangeDropdown(from, to);
      this.setupPage(from, to);
    }
  }

  getMinumunSwap = () => {
    const { arrCurrency } = this.state;
    const pairCoin = this._getPairCoin();
    const minimun_swap = pairCoin.minimum_swap_amount_in_eth;
    const { from_coin } = this.props;
    let minimun = 0;
    if (arrCurrency.indexOf(from_coin) >= 0) {
      minimun = pairCoin.to_token_price * minimun_swap;
    } else {
      minimun = pairCoin.from_token_price * minimun_swap;
    }
    return minimun;
  }

  getMaximunSwap = () => {
    const { arrCurrency } = this.state;
    const pairCoin = this._getPairCoin();
    const { from_coin } = this.props;
    let maximun = 0;
    if (arrCurrency.indexOf(from_coin) >= 0) {
      maximun = pairCoin.reserve_eth;
    } else {
      maximun = pairCoin.to_token_price * pairCoin.reserve_eth;
    }
    return maximun;
  }

  notify = (message, type) => {
    switch (type) {
      case 'success':
        this.toastSuccessID = toast.success(message, {
          className: 'toast-notify-custom',
        });
        break;
      case 'error':
        this.toastErrorID = toast.error(message, {
          className: 'toast-notify-custom',
        });
        break;
      case 'warning':
        toast.warn(message, {
          className: 'toast-notify-custom',
        });
        break;
      default:
        toast(message, {
          className: 'toast-notify-custom',
        });
        break;
    }
  }

  getToAddress = () => {
    const { arrCurrency } = this.state;
    const pairCoin = this._getPairCoin();
    let toAddress = '';
    const { from_coin } = this.props;
    if (arrCurrency.indexOf(from_coin) >= 0) {
      toAddress = pairCoin.to_token_address;
    } else {
      toAddress = pairCoin.from_token_price;
    }
    return toAddress;
  }


  _onSubmit = async (values) => {
    if (!this.state.isAuthenticated) {
      history.push(redirect.noneAuthenticated);
    }

    const {
      intl, wallet, secondWallet,
      from_coin, to_coin, actions
    } = this.props;
    const pairCoin = this._getPairCoin();
    const minimun_swap = this.getMinumunSwap();
    const maximun_swap = this.getMaximunSwap();
    const toAddress = this.getToAddress();
    let balance = 0;
    let coin_code = '';
    let to_coin_code = '';
    if (wallet && wallet.coin_id
      && wallet.coin_id.toLowerCase() == from_coin) {
      balance = wallet.available_to_use;
      coin_code = wallet.coin_code;
      to_coin_code = secondWallet.coin_code;
    } else if (secondWallet && secondWallet.coin_id
      && secondWallet.coin_id.toLowerCase() == from_coin) {
      balance = secondWallet.available_to_use;
      coin_code = secondWallet.coin_code;
      to_coin_code = wallet.coin_code;
    }

    const from = formatPureNumber(values.from);
    const to = formatPureNumber(values.to);

    const tradingPurchaseErrorMessage = intl.formatMessage({
      id: 'page.swap.confirm.swap_error'
    });

    const overBalance = intl.formatMessage(
      { id: 'page.swap.confirm.max_error' },
      { value: `${formatNumber(balance, 5)} ${coin_code}` }
    );

    const swapMaximun = intl.formatMessage(
      { id: 'page.swap.confirm.max_error' },
      { value: `${maximun_swap} ${to_coin_code}` }
    );

    const swapMinimun = intl.formatMessage(
      { id: 'page.swap.confirm.min_error' },
      { value: `${minimun_swap} ${to_coin_code}` }
    );
    if (from == 0 && to == 0) {
      if (!toast.isActive(this.toastErrorID)) {
        this.notify('Invalid value', 'error');
      }
      throw new SubmissionError({
        _error: 'Invalid value',
      });
    }

    if (new BigNumber(to).isLessThan(minimun_swap)) {
      if (!toast.isActive(this.toastErrorID)) {
        this.notify(swapMinimun, 'error');
      }
      throw new SubmissionError({
        _error: 'Invalid value',
      });
    }

    if (from <= 0) {
      if (!toast.isActive(this.toastErrorID)) {
        this.notify(tradingPurchaseErrorMessage, 'error');
      }
      throw new SubmissionError({
        _error: 'Invalid value',
      });
    } else if (from > balance) {
      if (!toast.isActive(this.toastErrorID)) {
        this.notify(overBalance, 'error');
      }
      throw new SubmissionError({
        _error: 'Invalid value',
      });
    } else if (from > maximun_swap) {
      if (!toast.isActive(this.toastErrorID)) {
        this.notify(swapMaximun, 'error');
      }
      throw new SubmissionError({
        _error: 'Invalid value',
      });
    }

    // send estimaste swap
    const data = {
      from_coin: from_coin,
      to_coin: to_coin,
      from_amount: from,
      to_amount: to,
      cex_system: pairCoin.cex_system,
      minimum_output: pairCoin.minimum_output,
      from_coin_code: coin_code,
      to_coin_code: to_coin_code,
      transaction_id: '',
      min_receive_amount: 0,
      max_recieve_amount: 0
    };

    const dataEstimate = {
      from_coin: from_coin,
      to_coin: to_coin,
      from_amount: from,
      cex_system: pairCoin.cex_system,
      minimum_output: pairCoin.minimum_output,
      to_address: toAddress,
      pair_address: pairCoin.pair_address,
      swap_fee: this._getFee()
    };
    actions.estimateSwap(dataEstimate);

    // dataConfirm
    this.setState({
      dataConfirm: data
    });

    actions.loading({
      name: 'loading',
      value: true,
    });
  }

  _onClickSwitch = () => {
    this._reset();
    const { from_coin, to_coin } = this.props;
    let fromCoin = to_coin;
    let toCoin = from_coin;
    this._onChangeDropdown(fromCoin, toCoin);
    this.setState({
      highlightPercent: 0
    });
  }

  _swapCurrencyToCoin = (value) => {
    const pairCoin = this._getPairCoin();
    if (pairCoin) {
      const { change } = this.props;
      const fee = this._getFee();
      const from = value;
      const to = (from * pairCoin.to_token_price) - ((fee / 100) * pairCoin.to_token_price);
      change('to', formatNumber(to, 5));
    }
  }

  _swapCoinToCurrency = (value) => {
    const pairCoin = this._getPairCoin();
    if (pairCoin) {
      const { change } = this.props;
      const fee = this._getFee();
      const from = value;
      const to = (from * pairCoin.from_token_price) - ((fee / 100) * pairCoin.from_token_price);
      change('to', formatNumber(to, 5));
    }
  }

  _getPairCoin = () => {
    const { from_coin, to_coin, coins } = this.props;
    const { arrCurrency } = this.state;
    if (arrCurrency.indexOf(from_coin) >= 0) {
      // currency -> coin
      const pairCoin = coins.filter(item => {
        if (item.from_coin_id == from_coin
          && item.to_coin_id == to_coin) {
          return true;
        }
        return false;
      });
      return pairCoin[0];
    } else if (arrCurrency.indexOf(to_coin) >= 0) {
      // coin -> currency
      const pairCoin = coins.filter(item => {
        if (item.from_coin_id == to_coin
          && item.to_coin_id == from_coin) {
          return true;
        }
        return false;
      });
      return pairCoin[0];
    }

    return null;
  }

  _getFee = () => {
    const pairCoin = this._getPairCoin();
    let fee = 0;
    if (pairCoin) {
      fee = pairCoin.swap_fee;
      if (this.state.isAuthenticated) {
        // fee = 3;
      }
    }
    return fee;
  }

  _onChangeFromTo = (value) => {
    if (value > 0) {
      const { from_coin, to_coin } = this.props;
      const { arrCurrency } = this.state;
      if (arrCurrency.indexOf(from_coin) >= 0) {
        // currency -> coin
        this._swapCurrencyToCoin(value);
      } else if (arrCurrency.indexOf(to_coin) >= 0) {
        // coin -> currency
        this._swapCoinToCurrency(value);
      }
    } else {
      const { change } = this.props;
      change('to', 0);
    }

    this.setState({
      highlightPercent: 0
    });
  }

  _afterFee = (price) => {
    const fee = this._getFee();
    return price - (price * (fee / 100));
  }

  _getSwap = () => {
    const { from_coin } = this.props;
    const pairCoin = this._getPairCoin();
    if (pairCoin) {
      if (pairCoin.from_coin_id == from_coin) {
        return (
          <span>1 {pairCoin.from_coin_code} = {formatNumber(this._afterFee(pairCoin.to_token_price), 5)} {pairCoin.to_coin_code}</span>
        );
      } else {
        return (
          <span>1 {pairCoin.to_coin_code} = {formatNumber(this._afterFee(pairCoin.from_token_price), 5)} {pairCoin.from_coin_code}</span>
        );
      }
    } else {
      return;
    }
  }

  _amountFromTo = (percent) => {
    let balance = 0;
    const { wallet, secondWallet, from_coin, change } = this.props;
    if (wallet && wallet.coin_id
      && wallet.coin_id.toLowerCase() == from_coin) {
      balance = wallet.available_to_use;
    } else if (secondWallet && secondWallet.coin_id
      && secondWallet.coin_id.toLowerCase() == from_coin) {
      balance = secondWallet.available_to_use;
    }
    const from = balance * (percent / 100);
    change('from', from + '');
    this._onChangeFromTo(from);
    this.setState({
      highlightPercent: percent
    });
  }

  _renderListCurrency = () => {
    return (
      <SelectCoin selected={this.state.selectedA}
        name='currency'
        _onChangeIcoin={(option) => this._onChangeIcoin('currency', option)}
        options={this.state.optionA} />
    );
  }

  _renderListCoins = () => {
    return (
      <SelectCoin selected={this.state.selectedB}
        name='coin'
        _onChangeIcoin={(option) => this._onChangeIcoin('coin', option)}
        options={this.state.optionB} />
    );
  }

  renderSelectFrom = () => {
    const { arrCurrency } = this.state;
    const { from_coin, to_coin } = this.props;
    if (arrCurrency.indexOf(from_coin) >= 0) {
      return this._renderListCurrency();
    } else if (arrCurrency.indexOf(to_coin) >= 0) {
      return this._renderListCoins();
    }
    return null;
  }

  renderSelectTo = () => {
    const { arrCurrency } = this.state;
    const { from_coin, to_coin } = this.props;
    if (arrCurrency.indexOf(from_coin) >= 0) {
      return this._renderListCoins();
    } else if (arrCurrency.indexOf(to_coin) >= 0) {
      return this._renderListCurrency();
    }
    return null;
  }

  renderBalance = () => {
    const { wallet, secondWallet, from_coin } = this.props;
    if (wallet) {
      if (wallet.coin_id && wallet.coin_id.toLowerCase() == from_coin) {
        return (
          <span>{formatNumber(wallet.available_to_use, 5)} {wallet.coin_code}</span>
        );
      }
    }

    if (secondWallet) {
      if (secondWallet.coin_id && secondWallet.coin_id.toLowerCase() == from_coin) {
        return (
          <span>{formatNumber(secondWallet.available_to_use, 5)} {secondWallet.coin_code}</span>
        );
      }
    }

    return (
      <span></span>
    );
  }

  render() {
    const { handleSubmit, submitting, } = this.props;
    const { highlightPercent, tab, isAuthenticated } = this.state;
    return (
      <React.Fragment>
        <div id="order-trade">
          <div className="order-nav">
            <a className={`item item-buy ${tab == 'tab1' && 'active'}`}
              onClick={() => this.setState({ tab: 'tab1' })}>
              <FormattedMessage id="page.swap.title" />
            </a>
            {isAuthenticated &&
              <a className={`item text-red item-sell ${tab == 'tab2' && 'active'}`}
                onClick={() => this.setState({ tab: 'tab2' })}>
                <FormattedMessage id="page.swap.history" />
              </a>
            }
          </div>

          {tab == 'tab1' &&
            <div className="ui-view">
              <div className="box-container">
                <form className="form-verticals" onSubmit={handleSubmit(this._onSubmit)}>
                  <div className="form-group">
                    <div className="control-label">
                      <FormattedMessage id="page.swap.iwanttoswap" />
                      {this.state.isAuthenticated &&
                        <span className="pull-right">
                          <span className="light-text">
                            <FormattedMessage id="page.swap.balance" />:
                        </span>
                          <span>{this.renderBalance()}</span>
                        </span>
                      }
                    </div>
                    <div className="trading-input">
                      <div className="left">
                        <span className="input-label">
                          <FormattedMessage id="app.exchange.simple.spending" />
                        </span>

                        <Field
                          name="from"
                          placeholder="0.0"
                          component={Input}
                          normalize={(value) => {
                            const pureNumeric = formatPureNumber(value);
                            if (RegExp(/^\d*(\.(\d*)?)?$/).test(pureNumeric)) {
                              this._onChangeFromTo(pureNumeric)
                              if (typeof pureNumeric == 'string' && pureNumeric.indexOf('.') == pureNumeric.length - 1) {
                                return value;
                              } else if (pureNumeric == 0) {
                                return value;
                              }
                              return formatNumber(pureNumeric, 5);
                            }
                            return 0;
                          }}
                        />
                      </div>
                      {this.renderSelectFrom()}
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="row">
                      <div className="col-xs-12 center">
                        <div className="col-xs-4"></div>
                        <button onClick={this._onClickSwitch} className="btn col-xs-4" type="button">
                          <i className="fa fa-exchange" aria-hidden="true"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  {this.state.isAuthenticated &&
                    <div className="form-group">
                      <div className="text-percent">
                        <a className={highlightPercent == 25 ? 'text-yellow' : ''} href="javascript:void(0)" onClick={() => this._amountFromTo(25)}>25%</a>
                        <a className={highlightPercent == 50 ? 'text-yellow' : ''} href="javascript:void(0)" onClick={() => this._amountFromTo(50)}>50%</a>
                        <a className={highlightPercent == 75 ? 'text-yellow' : ''} href="javascript:void(0)" onClick={() => this._amountFromTo(75)}>75%</a>
                        <a className={highlightPercent == 100 ? 'text-yellow' : ''} href="javascript:void(0)" onClick={() => this._amountFromTo(100)}>100%</a>
                      </div>
                    </div>
                  }

                  <div className="form-group">
                    <div className="trading-input">
                      <div className="left">
                        <span className="input-label">
                          <FormattedMessage id="app.exchange.simple.receiving" />
                        </span>
                        <Field
                          name="to"
                          placeholder="0.0"
                          component={Input}
                          readOnly
                        />
                      </div>

                      {this.renderSelectTo()}
                    </div>
                  </div>
                  <div className="footer-info">
                    <div className="item">
                      <span className="left">
                        <FormattedMessage id="page.swap.title" />
                      </span>
                      <span className="right">{this._getSwap()}</span>
                    </div>
                    <div className="item">
                      <span className="left">
                        <FormattedMessage id="page.swap.fee" />
                      </span>
                      <span className="right">{this._getFee()} %</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <button className="btn bg-blue font-white btn-block" type="submit">
                      <FormattedMessage id="page.swap.btn.swap" />
                    </button>
                  </div>
                </form>
              </div>

              <ModalDialog isOpen={this.state.openModal}>
                <SwapConfirm
                  _getDetailWallet={this._getDetailWallet}
                  _getHistory={this.getHistory}
                  _enableHistory={this._enableHistory}
                  closeDialog={() => this.setState({ openModal: false })}
                  dataConfirm={this.state.dataConfirm}
                  submitting={submitting} />
              </ModalDialog>
            </div>
          }

          {tab == 'tab2' &&
            <SwapHistory />
          }
        </div>
        <ToastNotification />
      </React.Fragment >
    );
  }
}

function mapStateToProps(state, ownProps) {
  const { swap, wallet } = state;
  const coins = swap.coins;
  const detail = (wallet && wallet.detail) || null;
  const firstWallet = (detail && detail.result && detail.result[0])
    ? detail.result[0]
    : {};
  const detailForCoin = (wallet && wallet.detail_for_coin) || null;
  const secondWallet = (detailForCoin && detailForCoin.result && detailForCoin.result[0])
    ? detailForCoin.result[0]
    : {};
  return {
    coins: coins,
    wallet: firstWallet,
    secondWallet: secondWallet,
    swapConfirm: swap.confirm
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      getSWAPListCoins,
      createWallet,
      getWalletDetail,
      getSwapHistory,
      estimateSwap,
      resetEstimateSwap,
      loading: setRuntimeVariable
    }, dispatch),
  };
}


export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(reduxForm({
  form: 'formSwap',
  enableReinitialize: true
})(SwapCoin)));
