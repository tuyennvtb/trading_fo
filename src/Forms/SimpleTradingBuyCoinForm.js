import React from 'react';
import {
  Field,
  reduxForm,
  SubmissionError,
  formValueSelector,
} from 'redux-form';
import { ERRORS } from '../Helpers/constants/system';
import Link from '../Link';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RenderSingleFieldWithLabel } from './Renders';
import accounting from 'accounting';
import HighlightablePrice from '../Processing/HighlightablePrice.js';
import { simpleBuyCoin } from '../Redux/actions/exchange';
import { FormattedMessage, injectIntl } from 'react-intl';
import { toast } from 'react-toastify';
import {
  formatNumberWithoutThousandSeparator,
  formatNumber,
} from '../Helpers/utils';
import ModalDialog from '../Processing/ModalDialog';
import Timer from '../Processing/Timer';
import { isRequired, isNumber, isMaxLength10 } from './Validation';
import { BigNumber } from 'bignumber.js';
BigNumber.config({ DECIMAL_PLACES: 5 });
class SimpleTradingBuyCoinForm extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      simpleBuyCoin: PropTypes.func.isRequired,
    }).isRequired,
    handleSubmit: PropTypes.func.isRequired,
    error: PropTypes.any, // eslint-disable-line react/forbid-prop-types, react/require-default-props
    pristine: PropTypes.bool.isRequired,
    reset: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    submitSucceeded: PropTypes.bool.isRequired,
    wallet: PropTypes.object,
  };

  static defaultProps = {
    wallet: null,
  };

  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.state = {
      isBuyCoinConfirmPopup: false,
      transactionData: null,
      isTimerEnded: false,
      step: 1,
      isEnable2FAConfig: false,
    };
  }
  // this.renderModal = props => {
  onCompletion = () => {
    this.setState({
      isTimerEnded: true,
      isBuyCoinConfirmPopup: false,
    });
  };
  async componentDidMount() {
    this.toastSuccessID = null;
    this.toastErrorID = null;
  }

  calculateTotal = (amount, price) => {
    const { trade_buy_fee } = this.props;
    var total = 0;
    if (amount && price && trade_buy_fee != null) {
      total = amount * price + trade_buy_fee / 100 * amount * price;
    }
    return total;
  };

  onCloseHandler() {
    this.setState({
      isBuyCoinConfirmPopup: false,
    });
  }
  handleAmountChange(event) {
    if (!this.props.user) return;
    let currentAmount = event.target.rawValue;
    let currentPrice = this.props.ask_price;
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
    let { ask_price, trade_buy_fee } = this.props;
    currentTotal = isNaN(currentTotal) || currentTotal <= 0 ? 0 : currentTotal;
    if (ask_price > 0) {
      let amount = currentTotal / (1 + trade_buy_fee / 100) / ask_price;
      this.props.change(
        'amount_to_buy',
        formatNumberWithoutThousandSeparator(amount),
      );
    }
  }

  async onConfirmBuyCoinTransaction() {
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

  async onSubmit(value) {
    if (!this.props.user) return;
    const {
      wallet,
      secondWallet,
      amountToBuy,
      actions,
      total,
      coin_id,
      intl,
      ask_price,
      user,
    } = this.props;
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
      amount: amountToBuy,
      price: ask_price,
      totalPrice: total,
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
        temporaryData: {
          wallet_address: value.address,
          tag: value.tag,
        },
      });
    }
  }

  render() {
    const {
      handleSubmit,
      pristine,
      submitting,
      isCreatingWallet,
      simpleTradingConfirmData,
      trade_buy_fee,
      wallet,
      intl,
      secondWallet,
      coin_id,
      ask_price,
      user,
    } = this.props;

    const coinCode = secondWallet && secondWallet.coin_code;

    const walletAddressPlaceholder = intl.formatMessage(
      {
        id: 'v2.simpleexchange.wallet.address.placeholder',
      },
      {
        coin_id: coin_id,
      },
    );
    const buyQuantityPlaceholder = intl.formatMessage({
      id: 'v2.simpleexchange.wallet.buyquantity.placeholder',
    });
    const amountNeedToPayPlaceholder = intl.formatMessage({
      id: 'v2.simpleexchange.wallet.amounttopay.placeholder',
    });
    const gg2faCode = intl.formatMessage({
      id: 'v2.wallet.popup.send.confirm.gg2fa',
    });
    const { step } = this.state;
    const { isEnable2FAConfig } = this.state;
    return (
      <div className="panel panel-default panel-exchange">
        <div className="panel-heading">
          <div className="panel-title clearfix">
            <span className="caption-subject font-blue bold uppercase">
              <i
                className=" icon-layers font-blue"
                style={{ padding: '0 5px 0 0' }}
              />{' '}
              <FormattedMessage
                id="app.exchange.simple.currentbuyprice"
                values={{
                  coin_id: coin_id,
                }}
              />
              <HighlightablePrice
                isBlinkOnly={true}
                price={formatNumber(ask_price)}
              />{' '}
              VNĐ / 1 {coin_id}
            </span>
            {user && (
              <Link
                href="/cash"
                className="btn font-white bg-green-jungle pull-right"
              >
                <i className="fa fa-plus-square" />
                Nạp thêm VND
              </Link>
            )}
          </div>
        </div>
        <div className="panel-body">
          <div>
            <div className="tab-content">
              <div className="tab-pane fade in active" id="sendTo">
                {user && (
                  <div className="title-section text-center font-blue bold">
                    <span className="available-title">
                      {`${formatNumber(
                        (wallet && wallet.available_to_use) || 0,
                      )} VND `}
                      <FormattedMessage id="app.exchange.available_to_use" />
                    </span>
                  </div>
                )}
                <form onSubmit={handleSubmit(this.onSubmit)}>
                  <div className="clearfix" />
                  <div className="row">
                    <div className="col-md-6">
                      <Field
                        name="amount_to_buy"
                        type="text"
                        options={{
                          numeral: true,
                          numeralThousandsGroupStyle: 'thousand',
                          numeralDecimalScale: 4,
                          numeralPositiveOnly: true,
                        }}
                        component={RenderSingleFieldWithLabel}
                        id="amount_to_buy"
                        placeholder={buyQuantityPlaceholder}
                        lastLabelText={
                          (coinCode && coinCode.toUpperCase()) || 'Unit'
                        }
                        labelText="Bạn muốn mua"
                        onChange={this.handleAmountChange.bind(this)}
                        validate={[isRequired]}
                        icon="fa-book"
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
                        id="total"
                        icon="fa-balance-scale"
                        labelText="Bạn cần trả"
                        placeholder={amountNeedToPayPlaceholder}
                        lastLabelText="VND"
                        validate={[isRequired]}
                        onChange={this.handleTotalChange.bind(this)}
                        readOnly={user === null}
                      />
                    </div>
                  </div>
                  <div className="row margin-top-15">
                    <div className="col-md-9">
                      <div className="note">
                        <p>
                          <FormattedMessage id="v2.simpletrade.note.description1" />
                        </p>
                        {/* <p>
                          <FormattedMessage
                            id="v2.simpletrade.note.description2"
                            values={{
                              fee: (secondWallet && secondWallet.fee) || 0,
                              coin_id: coin_id,
                            }}
                          />
                        </p>
                        <p className="text-danger">
                          <FormattedMessage
                            id="v2.simpletrade.note.fee"
                            values={{
                              fee: (secondWallet && secondWallet.fee) || 0,
                              coin_id: coin_id,
                            }}
                          />
                        </p> */}
                      </div>
                    </div>
                    {user && (
                      <div className="col-md-3">
                        <div className="form-group form-md-line-input bitmoon-input bitmoon-thin">
                          <button
                            type="submit"
                            className="btn blue md-btn uppercase"
                            disabled={
                              pristine || submitting || isCreatingWallet
                            }
                          >
                            <span>
                              <i className="fa fa-shopping-cart" /> Mua nhanh
                            </span>
                          </button>
                        </div>
                        <label className="pull-right trading-fee-label">
                          *{' '}
                          <FormattedMessage
                            id="app.exchange.feeincluded"
                            values={{
                              fee: trade_buy_fee,
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  {/* <div className="row">
                    <div className="col-md-6">
                      <Field
                        name="address"
                        type="text"
                        component={RenderSingleFieldWithLabel}
                        icon="fa-balance-scale"
                        id="address"
                        placeholder={walletAddressPlaceholder}
                        labelText="Địa chỉ ví"
                        readOnly={user === null}
                      />
                    </div>
                    {secondWallet &&
                    !!secondWallet.allow_3rd_column && (
                      <div className="col-md-6">
                        {secondWallet &&
                        secondWallet.additional_column_name &&
                        secondWallet.additional_column_name
                          .toLowerCase()
                          .indexOf('tag') !== -1 ? (
                          <Field
                            name="tag"
                            type="text"
                            validate={[isNumber, isMaxLength10]}
                            component={RenderSingleFieldWithLabel}
                            id="tag"
                            placeholder={
                              secondWallet.additional_column_name || 'Tag'
                            }
                            icon="fa-tag"
                            labelText={
                              (secondWallet &&
                                secondWallet.additional_column_name) ||
                              'Tag'
                            }
                          />
                        ) : (
                          <Field
                            name="tag"
                            type="text"
                            component={RenderSingleFieldWithLabel}
                            id="tag"
                            placeholder={
                              (secondWallet &&
                                secondWallet.additional_column_name) ||
                              'Tag'
                            }
                            icon="fa-tag"
                            labelText={
                              (secondWallet &&
                                secondWallet.additional_column_name) ||
                              'Tag'
                            }
                          />
                        )}
                      </div>
                    )}
                  </div> */}
                </form>
              </div>
            </div>
          </div>
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
function mapStateToProps({ wallet, exchange, user }) {
  const userData = (user && user.profile) || null;
  const simpleTradingConfirmData = exchange && exchange.simpleTradeResponse;
  const detail = (wallet && wallet.detail) || null;
  const firstWallet =
    detail && detail.result && detail.result[0] ? detail.result[0] : null;

  const detailForCoin = (wallet && wallet.detail_for_coin) || null;
  const secondWallet =
    detailForCoin && detailForCoin.result && detailForCoin.result[0]
      ? detailForCoin.result[0]
      : null;

  const walletUptoDate = (wallet && wallet.walletUptoDate) || {};
  const walletUptoDateData =
    walletUptoDate.result && walletUptoDate.result[0]
      ? walletUptoDate.result[0]
      : {};
  return {
    user: userData,
    wallet: firstWallet,
    secondWallet: secondWallet,
    exchange: exchange,
    walletUptoDateData,
    simpleTradingConfirmData,
  };
}
// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ simpleBuyCoin }, dispatch),
  };
}

const validater = values => {
  const errors = {};
  if (values.amount_to_buy <= 0) {
    errors.amount_to_buy = 'Amount must be greater 0';
  }
  return errors;
};

SimpleTradingBuyCoinForm = connect(mapStateToProps, mapDispatchToProps)(
  reduxForm({
    form: 'SimpleTradingBuyCoinForm',
    validater,
    asyncBlurFields: [],
  })(SimpleTradingBuyCoinForm),
);

const selector = formValueSelector('SimpleTradingBuyCoinForm'); // <-- same as form name
SimpleTradingBuyCoinForm = connect(state => {
  const amountToBuy = selector(state, 'amount_to_buy') || 0;
  const total = selector(state, 'total') || 0;
  return {
    amountToBuy: accounting.unformat(amountToBuy),
    total: accounting.unformat(total),
  };
})(SimpleTradingBuyCoinForm);

export default injectIntl(
  connect(null, mapDispatchToProps)(
    reduxForm({
      form: 'SimpleTradingBuyCoinForm',
    })(SimpleTradingBuyCoinForm),
  ),
);
