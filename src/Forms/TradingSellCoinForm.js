import React from 'react';
import {
  Field,
  reduxForm,
  SubmissionError,
  formValueSelector,
} from 'redux-form';
import Link from '../Link';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  RenderSingleFieldWithButton,
  RenderSingleFieldWithLabel,
} from './Renders';
import { isRequired } from './Validation';
import { sellCoin } from '../Redux/actions/exchange';
import { FormattedMessage, injectIntl } from 'react-intl';
import { toast } from 'react-toastify';
import ModalDialog from '../Processing/ModalDialog';
import {
  formatNumber,
  formatNumberWithoutThousandSeparator,
  floorMoney,
} from '../Helpers/utils';
import accounting from 'accounting';
import {
  EXCHANGE_ORDER_TYPE,
} from '../Helpers/constants/system';
import { BigNumber } from 'bignumber.js';
BigNumber.config({ DECIMAL_PLACES: 5 });
class TradingSellCoinForm extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      sellCoin: PropTypes.func.isRequired,
    }).isRequired,
    handleSubmit: PropTypes.func.isRequired,
    error: PropTypes.any, // eslint-disable-line react/forbid-prop-types, react/require-default-props
    pristine: PropTypes.bool.isRequired,
    reset: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    submitSucceeded: PropTypes.bool.isRequired,
    wallet: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      isOpenConfirmDialog: false,
      highlightPercent: 0,
      rangePercent: 5,
      filledInput: false,
      filledPrice: 0
    };
    this.isReadyToMakeOrder = false;
    this.handleMaxAmountButtonClick = this.handleMaxAmountButtonClick.bind(
      this,
    );
    this.onSubmit = this.onSubmit.bind(this);
    this.handlePriceButtonClick = this.handlePriceButtonClick.bind(this);
  }

  handleCancelOrderButtonClick = () => {
    this.setState({
      isOpenConfirmDialog: false,
    });
  };

  handleConfirmOrderButtonClick = () => {
    this.isReadyToMakeOrder = true;
    const submitter = this.props.handleSubmit(this.onSubmit);
    submitter();
  };

  async componentDidMount() {
    this.toastSuccessID = null;
    this.toastErrorID = null;
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.selectedOrderBookPrice !== this.props.selectedOrderBookPrice
    ) {
      const { amountToSell, selectedOrderBookPrice } = this.props;
      const currentPrice = selectedOrderBookPrice;
      this.props.change('current_sell_price', currentPrice);
      this.props.change(
        'total',
        formatNumberWithoutThousandSeparator(
          this.calculateTotal(amountToSell, currentPrice),
        ),
      );
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

  calculateTotal = (amount, price) => {
    const { trade_sell_fee } = this.props;
    var total = 0;
    if (amount && price && trade_sell_fee != null) {
      total = Math.floor(amount * price - trade_sell_fee / 100 * amount * price);
    }
    return total;
  };

  handleAmountChange(event) {
    let currentAmount = event.target.rawValue;
    let { priceToSell } = this.props;
    currentAmount = isNaN(currentAmount) ? 0 : currentAmount;
    priceToSell = isNaN(priceToSell) ? 0 : priceToSell;
    this.props.change(
      'total',
      formatNumberWithoutThousandSeparator(
        this.calculateTotal(currentAmount, priceToSell),
      ),
    );
  }
  handlePriceChange(event) {
    let currentPrice = event.target.rawValue;
    let { amountToSell, setSelectedOrderBookPrice } = this.props;
    amountToSell = isNaN(amountToSell) ? 0 : amountToSell;
    currentPrice = isNaN(currentPrice) ? 0 : currentPrice;
    setSelectedOrderBookPrice(currentPrice, EXCHANGE_ORDER_TYPE.BUY);
    this.props.change(
      'total',
      formatNumberWithoutThousandSeparator(
        this.calculateTotal(amountToSell, currentPrice),
      ),
    );

    this.setState({
      highlightPercent: 0,
      filledInput: true,
      filledPrice: currentPrice
    });
  }
  handleTotalChange(event) {
    let currentTotal = event.target.rawValue;
    let {
      amountToSell,
      priceToSell,
      bid_price,
      setSelectedOrderBookPrice,
      trade_sell_fee,
    } = this.props;
    amountToSell = isNaN(amountToSell) || amountToSell <= 0 ? 0 : amountToSell;
    priceToSell = isNaN(priceToSell) || priceToSell <= 0 ? 0 : priceToSell;
    if (amountToSell > 0 && priceToSell === 0) {
      let price = currentTotal / (1 - trade_sell_fee / 100) / amountToSell;
      this.props.change(
        'current_sell_price',
        formatNumberWithoutThousandSeparator(price),
      );
    } else if (amountToSell === 0 && priceToSell === 0) {
      priceToSell = bid_price;
      this.props.change('current_sell_price', priceToSell);
      let amount = currentTotal / (1 - trade_sell_fee / 100) / priceToSell;
      this.props.change(
        'amount_to_sell',
        formatNumberWithoutThousandSeparator(amount),
      );
    } else {
      let amount = currentTotal / (1 - trade_sell_fee / 100) / priceToSell;
      this.props.change(
        'amount_to_sell',
        formatNumberWithoutThousandSeparator(amount),
      );
    }
    setSelectedOrderBookPrice(priceToSell, EXCHANGE_ORDER_TYPE.BUY);
  }

  handleMaxAmountButtonClick() {
    let { wallet, priceToSell } = this.props;
    priceToSell = isNaN(priceToSell) || priceToSell <= 0 ? 0 : priceToSell;
    let maxAmount = wallet
      ? formatNumberWithoutThousandSeparator(wallet.available_to_use)
      : 0;
    this.props.change('amount_to_sell', maxAmount);
    this.props.change(
      'total',
      formatNumberWithoutThousandSeparator(
        this.calculateTotal(maxAmount, priceToSell),
      ),
    );
  }

  handlePriceButtonClick() {
    let { bid_price, amountToSell, orderBookBuy } = this.props;
    let bestPrice = bid_price;
    if (
      orderBookBuy &&
      orderBookBuy.buyOrders &&
      orderBookBuy.buyOrders.length > 0
    ) {
      const firstOrderBook = orderBookBuy.buyOrders[0];
      bestPrice = firstOrderBook.Rate;
      bestPrice = parseFloat(bestPrice).toFixed(4);
    }
    amountToSell = isNaN(amountToSell) || amountToSell <= 0 ? 0 : amountToSell;
    this.props.change('current_sell_price', bestPrice);
    this.props.change(
      'total',
      formatNumberWithoutThousandSeparator(
        this.calculateTotal(amountToSell, bestPrice),
      ),
    );
    this.setState({
      filledInput: false
    });
  }

  async onSubmit(value) {
    const {
      amountToSell,
      priceToSell,
      bid_price,
      actions,
      reset,
      dispatch,
      wallet,
      coin_id,
      coin_code,
      intl,
      total,
    } = this.props;
    let { isReadyToMakeOrder } = this;
    let sell_minimum = new BigNumber(wallet.sell_minimum);
    let data = {
      coin_id: this.props.coin_id,
      amount: amountToSell,
      price: priceToSell,
      totalPrice: total,
    };

    const tradingSuccessMessage = intl.formatMessage(
      {
        id: 'app.exchange.form.sell.success',
      },
      {
        coin_amount: value.amount_to_sell,
        coin_unit: coin_id,
        cash_amount: value.current_sell_price,
        cash_unit: 'VND',
      },
    );

    const tradingErrorMessage = intl.formatMessage({
      id: 'app.exchange.form.purchase.error',
    });

    const tradingPurchaseErrorMessage = intl.formatMessage({
      id: 'app.exchange.form.purchase_error',
    });

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
        this.notify(tradingPurchaseErrorMessage, 'error');
      }
      throw new SubmissionError({
        _error: 'Quantity not enough to sell',
      });
    }

    if (!isReadyToMakeOrder) {
      let warningThreshold = bid_price - (bid_price * (this.state.rangePercent / 100));
      if (priceToSell <= warningThreshold) {
        this.setState({
          isOpenConfirmDialog: true,
        });
        return;
      }
    }

    const err = await actions.sellCoin(data);
    this.setState({
      isOpenConfirmDialog: false,
    });
    this.isReadyToMakeOrder = false;
    if (err) {
      if (!toast.isActive(this.toastErrorID)) {
        this.notify(err, 'error');
      }
      throw new SubmissionError({
        _error: err,
      });
    } else {
      this.notify(tradingSuccessMessage, 'success');
      dispatch(reset('TradingSellCoinForm'));
      this.props.change('amount_to_sell', 0);
      this.props.change('current_sell_price', 0);
    }
  }

  _onChangeCoinToVND = (coin) => {
    const { bid_price } = this.props;
    let currentAmount = coin;
    let currentPrice = bid_price;
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

  _amountCoinToSell = (percent) => {

    const { wallet } = this.props;
    if (wallet && wallet.available_to_use) {
      if (!this.state.filledInput) {
        this.handlePriceButtonClick();
        const coin = wallet.available_to_use * (percent / 100);
        this.props.change('amount_to_sell', coin);
        this._onChangeCoinToVND(coin);
      } else {
        const currentPrice = this.state.filledPrice;
        if (currentPrice > 0) {
          const totalAmount = wallet.available_to_use / currentPrice;
          const amount = totalAmount * (percent / 100);
          this.props.change('amount_to_sell', amount);
          this.props.change('total', formatNumber(floorMoney(amount * currentPrice)));
        }
      }

      this.setState({
        highlightPercent: percent
      });
    }
  }

  render() {
    const {
      userAuthenticated,
      handleSubmit,
      submitting,
      wallet,
      pristine,
      coin_id,
      coin_code,
      isCreatingWallet,
      walletUptoDateData,
      trade_sell_fee,
      bid_price,
      priceToSell,
      intl,
    } = this.props;
    const { isOpenConfirmDialog, highlightPercent } = this.state;
    let walletData = wallet;
    if (walletUptoDateData && walletUptoDateData.coin_id === coin_id) {
      walletData = walletUptoDateData;
    }
    var maxSellButtonTitleMessage = intl.formatMessage(
      {
        id: 'app.exchange.max.sell.title',
      },
      {
        coin_id: coin_id,
      },
    );
    var lastSellButtonTitleMessage = intl.formatMessage(
      {
        id: 'app.exchange.price.sell.title',
      },
      {
        coin_id: coin_id,
      },
    );
    return (
      <div className="panel panel-default panel-exchange">
        <div className="panel-heading">
          <div className="panel-title clearfix">
            <span className="caption-subject font-red bold uppercase">
              {`${formatNumber(
                (walletData && walletData.available_to_use) || 0,
              )} ${coin_id} `}
              <FormattedMessage id="app.exchange.available_to_use" />
            </span>
            <Link
              href={`/wallet/${coin_id}`}
              className="btn font-white md-btn bg-green-jungle pull-right"
            >
              <i className="fa fa-plus-square" />
              Nạp thêm {coin_id.toUpperCase()}
            </Link>
          </div>
        </div>
        <div className="panel-body">
          <div>
            <div className="tab-content">
              <div className="tab-pane fade active in" id="sendTo">
                <form onSubmit={handleSubmit(this.onSubmit)}>
                  <div className="clearfix" />
                  <div className="row">
                    <div className="col-md-12">
                      <Field
                        name="amount_to_sell"
                        type="text"
                        options={{
                          numeral: true,
                          numeralThousandsGroupStyle: 'thousand',
                          numeralDecimalScale: 4,
                          numeralPositiveOnly: true,
                        }}
                        component={RenderSingleFieldWithButton}
                        id="amount_to_sell"
                        placeholder={`Số lượng`}
                        buttonText={<FormattedMessage id="app.exchange.max" />}
                        buttonToolTipText={maxSellButtonTitleMessage}
                        lastButtonText={coin_code ? coin_code.toUpperCase() : 'COIN'}
                        validate={[isRequired]}
                        icon="fa-book"
                        handleClick={this.handleMaxAmountButtonClick}
                        onChange={this.handleAmountChange.bind(this)}
                        props={{ min: 0 }}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <Field
                        name="current_sell_price"
                        type="text"
                        options={{
                          numeral: true,
                          numeralThousandsGroupStyle: 'thousand',
                          numeralDecimalScale: 4,
                          numeralPositiveOnly: true,
                        }}
                        component={RenderSingleFieldWithButton}
                        id="current_sell_price"
                        placeholder="Giá"
                        validate={[isRequired]}
                        icon="fa-balance-scale"
                        buttonText={
                          <FormattedMessage id="app.exchange.price.sell" />
                        }
                        buttonToolTipText={lastSellButtonTitleMessage}
                        lastButtonText="VND"
                        handleClick={this.handlePriceButtonClick}
                        onChange={this.handlePriceChange.bind(this)}
                        props={{ min: 0 }}
                      />
                    </div>
                  </div>
                  <div className="row mt-15">
                    <div className="col-md-12">
                      <div className="form-group form-group--set-percent">
                        <div className="text-percent">
                          <a className={highlightPercent == 25 ? 'text-yellow' : ''} href="javascript:void(0)" onClick={() => this._amountCoinToSell(25)}>25%</a>
                          <a className={highlightPercent == 50 ? 'text-yellow' : ''} href="javascript:void(0)" onClick={() => this._amountCoinToSell(50)}>50%</a>
                          <a className={highlightPercent == 75 ? 'text-yellow' : ''} href="javascript:void(0)" onClick={() => this._amountCoinToSell(75)}>75%</a>
                          <a className={highlightPercent == 100 ? 'text-yellow' : ''} href="javascript:void(0)" onClick={() => this._amountCoinToSell(100)}>100%</a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row row--total-price">
                    <div className="col-md-12">
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
                        placeholder={`Tổng tiền`}
                        labelText={<FormattedMessage id="app.order.total" />}
                        lastLabelText="VND"
                        onChange={this.handleTotalChange.bind(this)}
                        validate={[isRequired]}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="footer">
                        <label>
                          *{' '}
                          <FormattedMessage
                            id="app.exchange.feeincluded"
                            values={{
                              fee: trade_sell_fee,
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="footer">
                        {userAuthenticated ? (
                          <button
                            type="submit"
                            className="btn red md-btn uppercase"
                            disabled={submitting || pristine || isCreatingWallet}
                          >
                            <i className="fa fa-minus-square" />
                            <FormattedMessage id="app.exchange.form.sell.title" />
                            <span> {coin_id}</span>
                          </button>
                        ) : (
                            <Link
                              href={`/login`}
                              className="btn red md-btn uppercase btn--login"
                              disabled={submitting || pristine || isCreatingWallet}
                            >
                              <i className="fa fa-minus-square" />
                              <FormattedMessage id="app.exchange.form.sell.title" />
                              <span> {coin_id}</span>
                            </Link>
                          )}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <ModalDialog isOpen={isOpenConfirmDialog}>
          <div className="portlet light bordered modal-dialog-content confirm-order-dialog clearfix">
            <div className="portlet-title">
              <div className="caption">
                <span className="caption-subject font-blue bold uppercase">
                  <i className="icon-lock" />{' '}
                  <FormattedMessage id="app.exchange.pleaseconfirmbuyorder" />
                </span>
              </div>
            </div>
            <div className="portlet-body">
              <p>
                {intl.formatHTMLMessage(
                  {
                    id: 'app.exchange.confirmbuyorder.message',
                  },
                  {
                    coin_id: coin_id && coin_id.toUpperCase(),
                    price_to_buy: formatNumber(priceToSell),
                    ask_price: formatNumber(bid_price),
                  },
                )}
              </p>
              <button
                className="btn md-btn pull-right red-mint"
                onClick={this.handleCancelOrderButtonClick}
              >
                <FormattedMessage id="app.global.button.cancel" />
              </button>
              <button
                className="btn md-btn pull-right blue"
                onClick={this.handleConfirmOrderButtonClick}
              >
                <FormattedMessage id="app.global.button.confirm" />
              </button>
            </div>
          </div>
        </ModalDialog>
      </div>
    );
  }
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ wallet, exchange }) {
  const detail = (wallet && wallet.detail_for_coin) || null;
  const firstWallet =
    detail && detail.result && detail.result[0] ? detail.result[0] : null;
  const walletUptoDate = (wallet && wallet.walletUptoDate) || {};
  const walletUptoDateData =
    walletUptoDate.result && walletUptoDate.result[0]
      ? walletUptoDate.result[0]
      : {};
  const orderBookBuy = (exchange && exchange.orderBookBuy) || null;
  return {
    wallet: firstWallet,
    walletUptoDateData,
    orderBookBuy,
  };
}
// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ sellCoin }, dispatch),
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
  const priceToSell = selector(state, 'current_sell_price') || 0;
  const total = selector(state, 'total') || 0;
  return {
    amountToSell: accounting.unformat(amountToSell),
    priceToSell: accounting.unformat(priceToSell),
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
