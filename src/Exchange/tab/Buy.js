import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { reduxForm, Field, getFormValues, SubmissionError } from 'redux-form';
import { Cookies } from 'react-cookie';
import { BigNumber } from 'bignumber.js';
import { toast } from 'react-toastify';
import { FormattedMessage, injectIntl, FormattedHTMLMessage } from 'react-intl';
import DropdownCoin from '../../Helpers/DropdownCoin';
import { formatNumber, formatNumberWithoutThousandSeparator, floorMoney, formatPureNumber } from '../../Helpers/utils';
import { ERRORS } from '../../Helpers/constants/system';
import history from '../../history';
import { redirect } from '../../Core/config';
import { simpleBuyCoin } from '../../Redux/actions/exchange';
import ModalDialog from '../../Processing/ModalDialog';
import Timer from '../../Processing/Timer';
import Input from '../../Forms/Renders/Input';

BigNumber.config({ DECIMAL_PLACES: 5 });
const cookies = new Cookies();
class Buy extends React.Component {
  state = {
    isAuthenticated: cookies.get('uid_btm_token') ? true : false,
    isBuyCoinConfirmPopup: false,
    transactionData: null,
    isTimerEnded: false,
    step: 1,
    isEnable2FAConfig: false,
    isFetched: false,
    isChangeCoin: false,
    currentCoin: '',
    temporaryData: {},
    highlightPercent: 0
  }

  componentDidMount() {
    this._setCurrentCoin(this.props.coin_id);
    this.toastSuccessID = null;
    this.toastErrorID = null;
  }

  componentWillReceiveProps(nextProps) {
    const { wallet } = nextProps;
    const { currentCoinInfo } = this.props;
    // fist time fetch data
    if (wallet
      && wallet.available_to_use
      && !this.state.isFetched) {
      const total = wallet.available_to_use;
      this.setState({
        isFetched: true
      })
      this.props.change('total', formatNumber(total));
      this._onChangeVNDToCoin(total);
    }

    // when changing coin
    if (currentCoinInfo
      && this.state.currentCoin
      && currentCoinInfo.coin_id
      && this.state.currentCoin.toLowerCase() === currentCoinInfo.coin_id.toLowerCase()
      && this.state.isChangeCoin) {
      const { formValues = {} } = this.props;
      let total = formatPureNumber(formValues.total) || 0;
      if (this.state.isAuthenticated) {
        total = formatPureNumber(formValues.total) || wallet.available_to_use || 0;
      }
      this._onChangeVNDToCoin(total);

      this.setState({
        isChangeCoin: false
      })
    }
  }

  _setCurrentCoin = (coin_id) => {
    this.setState({
      currentCoin: coin_id
    })
  }

  _onChangeDropdown = async (coin_id) => {
    await this.setState({
      isChangeCoin: true,
      currentCoin: coin_id
    });
    history.push(`${redirect.simple_exchange}/${coin_id}?tab=buy`);
  }

  calculateTotal = (amount, price) => {
    const { trade_buy_fee } = this.props.currentCoinInfo;
    var total = 0;
    if (amount && price && trade_buy_fee != null) {
      total = amount * price + trade_buy_fee / 100 * amount * price;
    }
    return total;
  };

  onCloseHandler = () => {
    this.setState({
      isBuyCoinConfirmPopup: false,
    });
  }

  _onChangeVNDToCoin = (vnd) => {
    let currentTotal = vnd;
    let { fast_ask_price, trade_buy_fee } = this.props.currentCoinInfo;
    currentTotal = isNaN(currentTotal) || currentTotal <= 0 ? 0 : currentTotal;
    if (fast_ask_price > 0) {
      let amount = currentTotal / (1 + trade_buy_fee / 100) / fast_ask_price;
      this.props.change(
        'amount_to_buy',
        formatNumberWithoutThousandSeparator(amount),
      );
    }

    this.setState({
      highlightPercent: 0
    })
  }

  _onChangeCoinToVND = (coin) => {
    const { fast_ask_price } = this.props.currentCoinInfo;
    let currentAmount = coin;
    let currentPrice = fast_ask_price;
    currentAmount = isNaN(currentAmount) ? 0 : currentAmount;
    currentPrice = isNaN(currentPrice) ? 0 : currentPrice;
    this.props.change(
      'total',
      formatNumber(floorMoney(
        this.calculateTotal(currentAmount, currentPrice),
      )),
    );

    this.setState({
      highlightPercent: 0
    })
  }

  onConfirmBuyCoinTransaction = async () => {
    const { simpleTradingConfirmData, actions, wallet, intl } = this.props;
    const { temporaryData, isEnable2FAConfig } = this.state;
    const confirmationData = {
      coin_id: simpleTradingConfirmData.data.coin,
      amount: simpleTradingConfirmData.data.amount,
      price: simpleTradingConfirmData.data.price,
      wallet_address: temporaryData.wallet_address,
      tag: temporaryData.tag,
      transaction_id: simpleTradingConfirmData.data.transaction_id,
      from_coin_address: (wallet && wallet.coin_address) || '',
    };
    if (isEnable2FAConfig) {
      const google2FA = this.google2FA.value;
      const requireGG2FA = intl.formatMessage({
        id: 'error.account.missing_gg2fa_code',
      });
      if (!google2FA) {
        if (!toast.isActive(this.toastErrorID)) {
          this.notify(requireGG2FA, 'error');
        }
        return false;
      } else {
        confirmationData.google_auth_code = google2FA;
      }
    }

    let confirmResult = await actions.simpleBuyCoin(confirmationData);
    if (confirmResult) {
      this.setState({
        isBuyCoinConfirmPopup: false,
      });
      if (!toast.isActive(this.toastErrorID)) {
        this.notify(confirmResult, 'error');
      }
    } else {
      this.setState({
        step: 2,
      });
    }
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

  _amountCoinToBuy = (percent) => {
    const { wallet } = this.props;
    if (wallet && wallet.available_to_use) {
      const money = wallet.available_to_use * (percent / 100);
      this.props.change('total', formatNumber(floorMoney(money)));
      this._onChangeVNDToCoin(money)

      this.setState({
        highlightPercent: percent
      })
    }
  }

  onCompletion = () => {
    this.setState({
      isTimerEnded: true,
      isBuyCoinConfirmPopup: false,
    });
  };

  _onSubmit = async (value) => {
    // check authentication
    if (this.state.isAuthenticated) {
      const {
        wallet,
        secondWallet,
        actions,
        coin_id,
        intl,
        user,
      } = this.props;
      const total = formatPureNumber(value.total);
      const { fast_ask_price } = this.props.currentCoinInfo;
      const ask_price = fast_ask_price;
      let buy_minimum = new BigNumber(secondWallet.buy_minimum);
      const isEnable2FA = (user && user.is_active_google_auth) || false;
      this.setState({
        step: 1,
        isTimerEnded: false,
      });
      const isEnable2FAConfig = isEnable2FA && value.address;
      this.setState({
        isEnable2FAConfig: isEnable2FAConfig,
      });
      let data = {
        coin_id: this.props.coin_id,
        amount: value.amount_to_buy,
        price: ask_price,
        totalPrice: parseInt(total).toFixed(2),
        wallet_address: value.address,
        tag: value.tag,
      };

      const tradingPurchaseErrorMessage = intl.formatMessage({
        id: 'app.exchange.form.purchase_error',
      });

      const overBalance = intl.formatMessage(
        {
          id: 'v2.simpleexchange.popup.send.maxvalue.error',
        },
        {
          value: `${formatNumber((wallet.available_to_use || 0) * 1)} VND`,
        },
      );

      const buyLimitErrorMessage = intl.formatMessage(
        {
          id: 'app.exchange.form.buy.underlimit.error',
        },
        {
          coin_amount: formatNumber(buy_minimum),
        },
      );
      if (new BigNumber(total).isLessThan(buy_minimum)) {
        if (!toast.isActive(this.toastErrorID)) {
          this.notify(buyLimitErrorMessage, 'error');
        }
        throw new SubmissionError({
          _error: 'Invalid value',
        });
      }

      if (value.amount_to_buy <= 0 || value.current_buy_price < 0) {
        if (!toast.isActive(this.toastErrorID)) {
          this.notify(tradingPurchaseErrorMessage, 'error');
        }
        throw new SubmissionError({
          _error: 'Invalid value',
        });
      } else if (total > wallet.available_to_use) {
        if (!toast.isActive(this.toastErrorID)) {
          this.notify(overBalance, 'error');
        }
        throw new SubmissionError({
          _error: tradingPurchaseErrorMessage,
        });
      }
      const err = await actions.simpleBuyCoin(data);
      if (err) {
        if (err && err.error_code === ERRORS.SIMPLE_EXCHANGE.MAX_AMOUNT_REACHED) {
          const maxAmountReached = intl.formatMessage(
            {
              id: 'error.simple.buy.maxamount',
            },
            {
              max_amount: `${formatNumber((err.max_amount || 0) * 1)}`,
              coin_id: coin_id,
            },
          );
          if (!toast.isActive(this.toastErrorID)) {
            this.notify(maxAmountReached, 'error');
          }
        } else {
          if (!toast.isActive(this.toastErrorID)) {
            this.notify(err, 'error');
          }
        }
        throw new SubmissionError({
          _error: err,
        });
      } else {
        this.setState({
          isBuyCoinConfirmPopup: true,
        });
      }
    } else {
      history.push(redirect.noneAuthenticated);
    }
  }

  render() {
    const {
      coin_id,
      currentCoinInfo,
      handleSubmit,
      wallet,
      simpleTradingConfirmData,
      intl,
      submitting,

    } = this.props;
    const gg2faCode = intl.formatMessage({
      id: 'v2.wallet.popup.send.confirm.gg2fa',
    });
    const { step, isEnable2FAConfig, highlightPercent } = this.state;
    return (
      <div className="ui-view">
        <div className="box-container">
          <form className="form-verticals" onSubmit={handleSubmit(this._onSubmit)}>
            <div className="form-group">
              <div className="control-label">
                <FormattedMessage id="app.exchange.simple.iwanttobuy" />
                {this.state.isAuthenticated &&
                  <span className="pull-right">
                    <span className="light-text">
                      <FormattedMessage id="app.exchange.simple.balance" />:
                    </span>
                    <span>{formatNumber(wallet.available_to_use)}</span>
                  </span>
                }
              </div>
              <div className="trading-input">
                <div className="left">
                  <span className="input-label">
                    <FormattedMessage id="app.exchange.simple.spending" />
                  </span>

                  <Field
                    name="total"
                    placeholder="0.0"
                    component={Input}
                    normalize={(value) => {
                      if (RegExp(/^([0-9,])*/).test(value)) {
                        const pureNumeric = formatPureNumber(value);
                        this._onChangeVNDToCoin(pureNumeric);
                        return formatNumber(pureNumeric);
                      }
                      return 0;
                    }}
                  />
                </div>
                <div className="right">
                  <span className="icon">
                    <img src="/assets/global/img/coin-logo/icon_vnd.png" alt="VND" className="lazy"/>
                  </span>
                  <span className="mt-2">
                    VND
                    </span>
                </div>
              </div>
            </div>

            {this.state.isAuthenticated &&
              <div className="form-group">
                <div className="text-percent">
                  <a className={highlightPercent == 25 ? 'text-yellow' : ''} href="javascript:void(0)" onClick={() => this._amountCoinToBuy(25)}>25%</a>
                  <a className={highlightPercent == 50 ? 'text-yellow' : ''} href="javascript:void(0)" onClick={() => this._amountCoinToBuy(50)}>50%</a>
                  <a className={highlightPercent == 75 ? 'text-yellow' : ''} href="javascript:void(0)" onClick={() => this._amountCoinToBuy(75)}>75%</a>
                  <a className={highlightPercent == 100 ? 'text-yellow' : ''} href="javascript:void(0)" onClick={() => this._amountCoinToBuy(100)}>100%</a>
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
                    name="amount_to_buy"
                    placeholder="0.0"
                    component={Input}
                    normalize={(value) => {
                      if (RegExp(/^\d*(\.(\d*)?)?$/).test(value)) {
                        this._onChangeCoinToVND(value)
                        return value;
                      }
                      return 0;
                    }}
                  />
                </div>
                <div className="right no-padding">
                  <div className="btn-group">
                    <DropdownCoin coin_id={coin_id}
                      onChangeDropdown={(coin_id) => this._onChangeDropdown(coin_id)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="footer-info">
              <div className="item">
                <span className="left">
                  <FormattedMessage id="app.exchange.simple.price" />
                </span>
                <span className="right">1 {currentCoinInfo['coin']} = {formatNumber(currentCoinInfo['fast_ask_price'])} VND</span>
              </div>
              <div className="item">
                <span className="left">
                  <FormattedMessage id="app.exchange.simple.fee" />
                </span>
                <span className="right">{formatNumber(currentCoinInfo['trade_buy_fee'])} %</span>
              </div>
            </div>
            <div className="form-group">
              <button className="btn bg-blue font-white btn-block" type="submit">
                <FormattedMessage id="app.exchange.simple.buy" />
                &nbsp; {currentCoinInfo['coin']}
              </button>
            </div>
          </form>
        </div>

        <ModalDialog isOpen={this.state.isBuyCoinConfirmPopup}>
          <div className="modal-dialog order-confirmation-dialog">
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
                  <i className="fa fa-upload" />
                  &nbsp; <FormattedMessage id="app.exchange.simple.confirmtransaction" />
                </h4>
              </div>
              {simpleTradingConfirmData && simpleTradingConfirmData.data ? (
                <div className="modal-body">
                  <div className="panel panel-warning">
                    <div className="panel-body">
                      {step === 1 ? (
                        <div>
                          <p className="order-info-detail">
                            <FormattedMessage
                              id="app.exchange.simple.yourorderinfo.detail"
                              values={{
                                unit: simpleTradingConfirmData.data.amount,
                                coin_id: simpleTradingConfirmData.data.coin,
                                order_id:
                                  simpleTradingConfirmData.data.transaction_id,
                                amount: formatNumber(
                                  simpleTradingConfirmData.data.cost_amount,
                                ),
                              }}
                            />
                          </p>
                          {isEnable2FAConfig && (
                            <div
                              style={{ marginBottom: '30px' }}
                              className="form-group form-md-line-input form-md-floating-label bitmoon-input"
                            >
                              <div className="input-group">
                                <span className="input-group-addon">
                                  <i className="fa fa-unlock-alt" />
                                </span>
                                <input
                                  ref={c => {
                                    this.google2FA = c;
                                  }}
                                  className="form-control"
                                  id="google_2fa"
                                  type="text"
                                  placeholder={gg2faCode}
                                />
                                <div className="form-control-focus" />
                              </div>
                            </div>
                          )}
                          <FormattedMessage
                            id="app.exchange.simple.yourorderinfo.timeleft"
                            values={{
                              time: (
                                <Timer
                                  timeRemainingInSeconds={10}
                                  onCompletion={this.onCompletion}
                                />
                              ),
                            }}
                          />
                        </div>
                      ) : (
                          [
                            <div
                              className="note bg-green-jungle font-white"
                              key="orderInfo"
                            >
                              <h4 className="block bold">
                                <FormattedMessage id="app.exchange.simple.thanksforyourorder" />
                              </h4>
                              <p className="bold">
                                <FormattedMessage id="app.exchange.simple.yourorderinfo" />:
                            </p>
                              <p>
                                <FormattedMessage
                                  id="app.exchange.simple.yourorderinfo.detail"
                                  values={{
                                    unit: formatNumber(
                                      simpleTradingConfirmData.data.amount,
                                    ),
                                    coin_id: simpleTradingConfirmData.data.coin,
                                    order_id:
                                      simpleTradingConfirmData.data
                                        .transaction_id,
                                    amount: formatNumber(
                                      simpleTradingConfirmData.data.cost_amount,
                                    ),
                                  }}
                                />
                              </p>
                              <p>
                                <FormattedMessage id="app.exchange.simple.systemprocessing" />
                              </p>
                            </div>,
                            <div key="transaction">
                              <p className="alert alert-warning">
                                <FormattedMessage
                                  id="v2.wallet.popup.confirmation"
                                  values={{
                                    link: (
                                      <a href="/trade-history" target="_blank">
                                        <FormattedMessage id="v2.wallet.transactions.suggest" />
                                      </a>
                                    ),
                                  }}
                                />
                              </p>
                            </div>,
                          ]
                        )}
                    </div>
                  </div>
                </div>
              ) : (
                  <span>Loading....</span>
                )}
              <div className="modal-footer">
                <button
                  type="button"
                  className={'btn md-btn pull-right red btn-wallet'}
                  style={{
                    marginTop: '10px',
                    marginLeft: '10px',
                    marginBottom: '10px',
                  }}
                  onClick={this.onCloseHandler}
                >
                  <FormattedMessage id="app.global.button.close" />
                </button>
                {step === 1 && (
                  <button
                    style={{ marginTop: '10px' }}
                    type="submit"
                    className="btn md-btn pull-right blue"
                    disabled={submitting || this.state.isTimerEnded}
                    onClick={this.onConfirmBuyCoinTransaction}
                  >
                    <FormattedMessage id="app.global.button.confirm" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </ModalDialog>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { wallet, exchange, user } = state;
  const userData = (user && user.profile) || null;
  const simpleTradingConfirmData = exchange && exchange.simpleTradeResponse;
  const detail = (wallet && wallet.detail) || null;
  const firstWallet = (detail && detail.result && detail.result[0])
    ? detail.result[0]
    : {};

  const detailForCoin = (wallet && wallet.detail_for_coin) || null;
  const secondWallet = (detailForCoin && detailForCoin.result && detailForCoin.result[0])
    ? detailForCoin.result[0]
    : {};

  const walletUptoDate = (wallet && wallet.walletUptoDate) || {};
  const walletUptoDateData = (walletUptoDate.result && walletUptoDate.result[0])
    ? walletUptoDate.result[0]
    : {};

  const formValues = getFormValues('formExchangeBuy')(state);

  return {
    user: userData,
    wallet: firstWallet,
    secondWallet: secondWallet,
    exchange: exchange,
    walletUptoDateData,
    simpleTradingConfirmData,
    formValues
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ simpleBuyCoin }, dispatch),
  };
}

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(reduxForm({
    form: 'formExchangeBuy',
    enableReinitialize: true
  })(Buy)));