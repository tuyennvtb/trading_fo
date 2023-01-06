import React from 'react';
import {
  Field,
  reduxForm,
  formValueSelector,
  SubmissionError,
} from 'redux-form';
import Link from '../Link';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { getBankList } from '../Redux/actions/cash';
import { RenderSingleFieldWithLabel, RenderSelect2Field } from './Renders';
import { isRequired } from './Validation';
import accounting from 'accounting';
import HighlightablePrice from '../Processing/HighlightablePrice.js';
import { simpleSellCoin } from '../Redux/actions/exchange';
import { toast } from 'react-toastify';
import { ERRORS } from '../Helpers/constants/system';
import {
  formatNumberWithoutThousandSeparator,
  formatNumber,
} from '../Helpers/utils';
import ModalDialog from '../Processing/ModalDialog';
import Timer from '../Processing/Timer';
import { BigNumber } from 'bignumber.js';
BigNumber.config({ DECIMAL_PLACES: 5 });
class TradingSellCoinForm extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      simpleSellCoin: PropTypes.func.isRequired,
    }).isRequired,
    handleSubmit: PropTypes.func.isRequired,
    error: PropTypes.any, // eslint-disable-line react/forbid-prop-types, react/require-default-props
    pristine: PropTypes.bool.isRequired,
    reset: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    submitSucceeded: PropTypes.bool.isRequired,
    wallet: PropTypes.object,
    intl: intlShape.isRequired,
  };

  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.state = {
      isSellCoinConfirmPopup: false,
      transactionData: null,
      isTimerEnded: false,
      step: 1,
      isEnable2FAConfig: false,
    };
  }
  onCompletion = () => {
    this.setState({
      isTimerEnded: true,
      isSellCoinConfirmPopup: false,
    });
  };
  async componentDidMount() {
    const { actions } = this.props;
    //Temporarily disable feature getBankList
    //await actions.getBankList();
    this.toastSuccessID = null;
    this.toastErrorID = null;
  }

  notify(message, type) {
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

  calculateTotal = (amount, price) => {
    const { trade_sell_fee } = this.props;
    var total = 0;
    if (amount && price && trade_sell_fee != null) {
      total = amount * price - trade_sell_fee / 100 * amount * price;
    }
    return total;
  };

  handleAmountChange(event) {
    if (!this.props.user) return;
    let currentAmount = event.target.rawValue;
    let currentPrice = this.props.bid_price;
    currentAmount = isNaN(currentAmount) ? 0 : currentAmount;
    currentPrice = isNaN(currentPrice) ? 0 : currentPrice;
    this.props.change(
      'total',
      formatNumberWithoutThousandSeparator(
        this.calculateTotal(currentAmount, currentPrice),
      ),
    );
  }

  handleTotalChange(event) {
    let currentTotal = event.target.rawValue;
    let { bid_price, trade_sell_fee } = this.props;
    let amount = currentTotal / (1 - trade_sell_fee / 100) / bid_price;
    if (bid_price > 0) {
      this.props.change(
        'amount_to_sell',
        formatNumberWithoutThousandSeparator(amount),
      );
    }
  }

  onCloseHandler() {
    this.setState({
      isSellCoinConfirmPopup: false,
    });
  }
  async onConfirmBuyCoinTransaction() {
    const { simpleTradingConfirmData, actions, wallet, intl } = this.props;
    const { temporaryData, isEnable2FAConfig } = this.state;
    const confirmationData = {
      coin_id: simpleTradingConfirmData.data.coin,
      amount: simpleTradingConfirmData.data.amount,
      price: simpleTradingConfirmData.data.price,
      bank_code: temporaryData.bank_code,
      user_bank_account: temporaryData.user_bank_account,
      user_account_name: temporaryData.user_account_name,
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

    let confirmResult = await actions.simpleSellCoin(confirmationData);
    if (confirmResult) {
      this.setState({
        isSellCoinConfirmPopup: false,
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
  async onSubmit(value) {
    if (!this.props.user) return;
    const {
      amountToSell,
      actions,
      wallet,
      coin_id,
      intl,
      bid_price,
      user,
      total,
    } = this.props;
    let sell_minimum = new BigNumber(wallet.sell_minimum);
    const isEnable2FA = (user && user.is_active_google_auth) || false;
    this.setState({ step: 1, isTimerEnded: false });

    const isEnable2FAConfig =
      isEnable2FA && value.user_bank_account && value.user_account_name;
    this.setState({
      isEnable2FAConfig: isEnable2FAConfig,
    });

    let data = {
      coin_id: this.props.coin_id,
      amount: amountToSell,
      price: bid_price,
      bank_code: value.bank_code,
      user_bank_account: value.user_bank_account,
      user_account_name: value.user_account_name,
      google_auth_code: value.google_auth_code || '',
      totalPrice: total,
    };

    const overBalance = intl.formatMessage(
      {
        id: 'v2.simpleexchange.popup.sell.maxvalue.error',
      },
      {
        value: `${formatNumber((wallet.available_to_use || 0) * 1)} ${coin_id}`,
      },
    );
    const sellLimitErrorMessage = intl.formatMessage(
      {
        id: 'app.exchange.form.sell.underlimit.error',
      },
      {
        coin_amount: formatNumber(sell_minimum),
      },
    );

    if (new BigNumber(total).isLessThan(sell_minimum)) {
      if (!toast.isActive(this.toastErrorID)) {
        this.notify(sellLimitErrorMessage, 'error');
      }
      throw new SubmissionError({
        _error: 'Invalid value',
      });
    }

    if (amountToSell > wallet.available_to_use) {
      if (!toast.isActive(this.toastErrorID)) {
        this.notify(overBalance, 'error');
      }
      throw new SubmissionError({
        _error: 'Invalid value',
      });
    }

    const err = await actions.simpleSellCoin(data);
    if (err) {
      if (err && err.error_code === ERRORS.SIMPLE_EXCHANGE.MAX_AMOUNT_REACHED) {
        const maxAmountReached = intl.formatMessage(
          {
            id: 'error.simple.buy.maxamount.sell',
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
        _error: 'Invalid value',
      });
    } else {
      this.setState({
        isSellCoinConfirmPopup: true,
        temporaryData: {
          bank_code: value.bank_code,
          user_bank_account: value.user_bank_account,
          user_account_name: value.user_account_name,
        },
      });
    }
  }
  render() {
    const {
      handleSubmit,
      submitting,
      pristine,
      coin_id,
      isCreatingWallet,
      intl,
      bankList,
      simpleTradingConfirmData,
      trade_sell_fee,
      wallet,
      bid_price,
      user,
    } = this.props;
    const { isEnable2FAConfig } = this.state;
    const { step } = this.state;
    const bankName = intl.formatMessage({
      id: 'user.withdraw.bankaccount.bankname',
    });
    const accountNumber = intl.formatMessage({
      id: 'user.withdraw.bankaccount.accountnumber',
    });
    const accountName = intl.formatMessage({
      id: 'user.simpletrade.bankaccount.accountname',
    });
    const sellQuantityPlaceholder = intl.formatMessage({
      id: 'v2.simpleexchange.wallet.sellquantity.placeholder',
    });
    const amountToGetPlaceholder = intl.formatMessage({
      id: 'v2.simpleexchange.wallet.amounttoget.placeholder',
    });
    const gg2faCode = intl.formatMessage({
      id: 'v2.wallet.popup.send.confirm.gg2fa',
    });
    let options = [];
    if (bankList && bankList.length > 0) {
      options = bankList.filter(item => !!item.allow_withdraw);
    }
    return (
      <div className="panel panel-default panel-exchange">
        <div className="panel-heading">
          <div className="panel-title clearfix">
            <span className="caption-subject font-red bold uppercase">
              <i
                className=" icon-layers font-red"
                style={{ padding: '0 5px 0 0' }}
              />{' '}
              <FormattedMessage
                id="app.exchange.simple.currentsellprice"
                values={{
                  coin_id: coin_id,
                }}
              />
              <HighlightablePrice
                isBlinkOnly={true}
                price={formatNumber(bid_price)}
              />{' '}
              VNĐ / 1 {coin_id}
            </span>
            {user && (
              <Link
                href={`/wallet/${coin_id}`}
                className="btn font-white bg-green-jungle pull-right"
              >
                <i className="fa fa-plus-square" />
                Nạp thêm {coin_id.toUpperCase()}
              </Link>
            )}
          </div>
        </div>
        <div className="panel-body">
          <div>
            <div className="tab-content">
              <div className="tab-pane fade active in" id="sendTo">
                {user && (
                  <div className="title-section text-center font-red bold">
                    <span className="available-title">
                      {`${formatNumber(
                        (wallet && wallet.available_to_use) || 0,
                      )} ${coin_id} `}
                      <FormattedMessage id="app.exchange.available_to_use" />
                    </span>
                  </div>
                )}
                <form onSubmit={handleSubmit(this.onSubmit)}>
                  <div className="clearfix" />
                  <div className="row">
                    <div className="col-md-6">
                      <Field
                        name="amount_to_sell"
                        type="text"
                        options={{
                          numeral: true,
                          numeralThousandsGroupStyle: 'thousand',
                          numeralDecimalScale: 4,
                          numeralPositiveOnly: true,
                        }}
                        component={RenderSingleFieldWithLabel}
                        id="amount_to_sell"
                        placeholder={sellQuantityPlaceholder}
                        labelText="Bạn muốn bán"
                        lastLabelText={
                          (coin_id && coin_id.toUpperCase()) || 'Unit'
                        }
                        validate={[isRequired]}
                        icon="fa-book"
                        onChange={this.handleAmountChange.bind(this)}
                        props={{ min: 0 }}
                        readOnly={user === null}
                      />
                    </div>
                    <div className="col-md-6">
                      <Field
                        name="total"
                        type="text"
                        options={{
                          numeral: true,
                          numeralThousandsGroupStyle: 'thousand',
                          numeralDecimalScale: 4,
                          numeralPositiveOnly: true,
                        }}
                        component={RenderSingleFieldWithLabel}
                        icon="fa-balance-scale"
                        id="total"
                        placeholder={amountToGetPlaceholder}
                        labelText="Bạn sẽ nhận được"
                        lastLabelText="VND"
                        onChange={this.handleTotalChange.bind(this)}
                        validate={[isRequired]}
                        readOnly={user === null}
                      />
                    </div>
                  </div>
                  <div className="row margin-top-15">
                    <div className="col-md-9">
                      <div className="note">
                        <p>
                          Lưu ý: Bạn hoàn toàn có thể để tiền lại Bitmoon.net và
                          rút ra bất cứ khi nào bạn muốn.
                        </p>
                        {/* <p>
                          Trong trường hợp bạn muốn rút tiền về tài khoản ngay,
                          vui lòng điền thông tin ngân hàng ở dưới
                        </p> */}
                      </div>
                    </div>
                    {user && (
                      <div className="col-md-3">
                        <div className="form-group form-md-line-input bitmoon-input bitmoon-thin">
                          <button
                            type="submit"
                            className="btn red md-btn uppercase"
                            disabled={
                              submitting || pristine || isCreatingWallet
                            }
                          >
                            <span>
                              <i className="fa fa-shopping-cart" /> Bán nhanh
                            </span>
                          </button>
                        </div>
                        <label className="pull-right trading-fee-label">
                          *{' '}
                          <FormattedMessage
                            id="app.exchange.feeincluded"
                            values={{
                              fee: trade_sell_fee,
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  {/* <div className="row">
                    <div className="col-md-12">
                      <Field
                        name="bank_code"
                        type="text"
                        component={RenderSelect2Field}
                        id="bank_code"
                        label={bankName}
                        options={options}
                        readOnly={user === null}
                      />
                    </div>
                  </div> */}
                  {/* <div className="row">
                    <div className="col-md-6">
                      <Field
                        name="user_bank_account"
                        type="text"
                        component={RenderSingleFieldWithLabel}
                        icon="fa-balance-scale"
                        id="user_bank_account"
                        placeholder={accountNumber}
                        labelText={accountNumber}
                        readOnly = {user === null}
                      />
                    </div>
                    <div className="col-md-6">
                      <Field
                        name="user_account_name"
                        type="text"
                        component={RenderSingleFieldWithLabel}
                        icon="fa-balance-scale"
                        id="user_account_name"
                        placeholder={accountName}
                        labelText={accountName}
                        readOnly = {user === null}
                      />
                    </div>
                  </div> */}
                </form>
              </div>
            </div>
          </div>
        </div>
        <ModalDialog isOpen={this.state.isSellCoinConfirmPopup}>
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
                  <i className="fa fa-upload" />&nbsp; Xác nhận giao dịch
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
                              id="app.exchange.simple.yourorderinfo.detail.sell"
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
                          <div className="note bg-green-jungle font-white">
                            <h4 className="block bold">
                              <FormattedMessage id="app.exchange.simple.thanksforyourorder.sell" />
                            </h4>
                            <p className="bold">
                              <FormattedMessage id="app.exchange.simple.yourorderinfo" />:
                            </p>
                            <p>
                              <FormattedMessage
                                id="app.exchange.simple.yourorderinfo.detail.sell"
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
                          <div>
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
                  onClick={this.onCloseHandler.bind(this)}
                >
                  <FormattedMessage id="app.global.button.close" />
                </button>
                {step === 1 && (
                  <button
                    style={{ marginTop: '10px' }}
                    type="submit"
                    className="btn md-btn pull-right blue"
                    disabled={submitting || this.state.isTimerEnded}
                    onClick={this.onConfirmBuyCoinTransaction.bind(this)}
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

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ cash, wallet, exchange, user }) {
  const userData = (user && user.profile) || null;
  const simpleTradingConfirmData = exchange && exchange.simpleTradeResponse;
  const bankList = (cash && cash.list) || [];
  const detail = (wallet && wallet.detail_for_coin) || null;
  const firstWallet =
    detail && detail.result && detail.result[0] ? detail.result[0] : null;
  const walletUptoDate = (wallet && wallet.walletUptoDate) || {};
  const walletUptoDateData =
    walletUptoDate.result && walletUptoDate.result[0]
      ? walletUptoDate.result[0]
      : {};
  return {
    user: userData,
    bankList: bankList,
    wallet: firstWallet,
    walletUptoDateData,
    simpleTradingConfirmData,
  };
}
// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ simpleSellCoin, getBankList }, dispatch),
  };
}

TradingSellCoinForm = connect(mapStateToProps, mapDispatchToProps)(
  reduxForm({
    form: 'TradingSellCoinForm',
    asyncBlurFields: [],
  })(TradingSellCoinForm),
);

const selector = formValueSelector('TradingSellCoinForm'); // <-- same as form name
TradingSellCoinForm = connect(state => {
  // can select values individually
  const amountToSell = selector(state, 'amount_to_sell') || 0;
  const total = selector(state, 'total') || 0;
  return {
    amountToSell: accounting.unformat(amountToSell),
    total: accounting.unformat(total),
  };
})(TradingSellCoinForm);

export default injectIntl(
  connect(null, mapDispatchToProps)(
    reduxForm({
      form: 'TradingSellCoinForm',
    })(TradingSellCoinForm),
  ),
);
