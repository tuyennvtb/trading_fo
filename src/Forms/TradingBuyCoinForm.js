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

import { buyCoin } from '../Redux/actions/exchange';
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
  CHECK_IS_MOBILE,
} from '../Helpers/constants/system';
import { BigNumber } from 'bignumber.js';
import history from '../history';
BigNumber.config({ DECIMAL_PLACES: 5 });
class TradingBuyCoinForm extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      buyCoin: PropTypes.func.isRequired,
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
    this.state = {
      isOpenConfirmDialog: false,
      highlightPercent: 0,
      rangePercent: 5,
      filledInput: false,
      filledPrice: 0,
    };
    this.isReadyToMakeOrder = false;
    this.handleMaxAmountButtonClick = this.handleMaxAmountButtonClick.bind(
      this
    );
    this.handlePriceButtonClick = this.handlePriceButtonClick.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  async componentDidMount() {
    this.toastSuccessID = null;
    this.toastErrorID = null;
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.selectedOrderBookPrice !== this.props.selectedOrderBookPrice
    ) {
      const { amountToBuy, selectedOrderBookPrice } = this.props;
      const currentPrice = selectedOrderBookPrice;
      this.props.change('current_buy_price', currentPrice);
      this.props.change(
        'total',
        formatNumberWithoutThousandSeparator(
          this.calculateTotal(amountToBuy, currentPrice)
        )
      );
    }
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

  handleMaxAmountButtonClick() {
    let { wallet, priceToBuy, trade_buy_fee, userAuthenticated } = this.props;
    if (!userAuthenticated) {
      history.push('/login');
      return;
    }
    let maxUse = wallet.available_to_use;
    let currentPrice = this.props.ask_price;
    let maxAmount = 0;
    priceToBuy =
      isNaN(priceToBuy) || priceToBuy <= 0 ? currentPrice : priceToBuy;
    maxAmount = formatNumberWithoutThousandSeparator(
      maxUse / (1 + trade_buy_fee / 100) / priceToBuy
    );
    this.props.change('amount_to_buy', maxAmount);

    this.props.change(
      'total',
      formatNumberWithoutThousandSeparator(
        this.calculateTotal(maxAmount, priceToBuy)
      )
    );
  }

  handlePriceButtonClick() {
    let { ask_price, amountToBuy, orderBookSell } = this.props;
    let bestPrice = ask_price;
    if (
      orderBookSell &&
      orderBookSell.sellOrders &&
      orderBookSell.sellOrders.length > 0
    ) {
      const firstOrderBook = orderBookSell.sellOrders[0];
      bestPrice = firstOrderBook.Rate;
      bestPrice = parseFloat(bestPrice).toFixed(4);
    }
    amountToBuy = isNaN(amountToBuy) || amountToBuy <= 0 ? 0 : amountToBuy;
    this.props.change('current_buy_price', bestPrice);
    this.props.change(
      'total',
      formatNumberWithoutThousandSeparator(
        this.calculateTotal(amountToBuy, bestPrice)
      )
    );
    this.setState({
      filledInput: false,
    });
  }

  handleClick() {
    this.handleMaxAmountButtonClick();
  }

  calculateTotal = (amount, price) => {
    const { trade_buy_fee } = this.props;
    var total = 0;
    if (amount && price && trade_buy_fee != null) {
      total = amount * price + (trade_buy_fee / 100) * amount * price;
    }
    return total;
  };

  handleAmountChange(event) {
    let currentAmount = event.target.rawValue;
    let { priceToBuy } = this.props;
    currentAmount = isNaN(currentAmount) ? 0 : currentAmount;
    priceToBuy = isNaN(priceToBuy) ? 0 : priceToBuy;
    this.props.change(
      'total',
      formatNumberWithoutThousandSeparator(
        this.calculateTotal(currentAmount, priceToBuy)
      )
    );
  }
  handlePriceChange(event) {
    let currentPrice = event.target.rawValue;
    let { amountToBuy, setSelectedOrderBookPrice } = this.props;
    amountToBuy = isNaN(amountToBuy) ? 0 : amountToBuy;
    currentPrice = isNaN(currentPrice) ? 0 : currentPrice;
    setSelectedOrderBookPrice(currentPrice, EXCHANGE_ORDER_TYPE.SELL);
    this.props.change('total', this.calculateTotal(amountToBuy, currentPrice));
    this.setState({
      highlightPercent: 0,
      filledInput: true,
      filledPrice: currentPrice,
    });
  }
  handleTotalChange(event) {
    let currentTotal = event.target.rawValue;
    let {
      amountToBuy,
      priceToBuy,
      ask_price,
      setSelectedOrderBookPrice,
      trade_buy_fee,
    } = this.props;
    amountToBuy = isNaN(amountToBuy) || amountToBuy <= 0 ? 0 : amountToBuy;
    priceToBuy = isNaN(priceToBuy) || priceToBuy <= 0 ? 0 : priceToBuy;
    currentTotal = isNaN(currentTotal) || currentTotal <= 0 ? 0 : currentTotal;
    if (amountToBuy > 0 && priceToBuy === 0) {
      let price = currentTotal / (1 + trade_buy_fee / 100) / amountToBuy;
      this.props.change(
        'current_buy_price',
        formatNumberWithoutThousandSeparator(price)
      );
    } else if (amountToBuy === 0 && priceToBuy === 0) {
      priceToBuy = ask_price;
      this.props.change('current_buy_price', priceToBuy);
      let amount = currentTotal / (1 + trade_buy_fee / 100) / priceToBuy;
      this.props.change(
        'amount_to_buy',
        formatNumberWithoutThousandSeparator(amount)
      );
    } else {
      let amount = currentTotal / (1 + trade_buy_fee / 100) / priceToBuy;
      this.props.change(
        'amount_to_buy',
        formatNumberWithoutThousandSeparator(amount)
      );
    }
    setSelectedOrderBookPrice(priceToBuy, EXCHANGE_ORDER_TYPE.SELL);
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
    const {
      wallet,
      secondWallet,
      ask_price,
      amountToBuy,
      priceToBuy,
      actions,
      reset,
      dispatch,
      total,
      coin_id,
      intl,
    } = this.props;
    let { isReadyToMakeOrder } = this;
    let buy_minimum = new BigNumber(secondWallet.buy_minimum);
    let data = {
      coin_id: this.props.coin_id,
      amount: amountToBuy,
      price: priceToBuy,
      totalPrice: total,
    };
    const tradingSuccessMessage = intl.formatMessage(
      {
        id: 'app.exchange.form.buy.success',
      },
      {
        coin_amount: value.amount_to_buy,
        coin_unit: coin_id,
        cash_amount: value.current_buy_price,
        cash_unit: 'VND',
      }
    );

    const tradingErrorMessage = intl.formatMessage({
      id: 'app.exchange.form.purchase.error',
    });

    const tradingPurchaseErrorMessage = intl.formatMessage({
      id: 'app.exchange.form.purchase_error',
    });

    const buyLimitErrorMessage = intl.formatMessage(
      {
        id: 'app.exchange.form.buy.underlimit.error',
      },
      {
        coin_amount: formatNumber(buy_minimum),
      }
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
        this.notify(tradingPurchaseErrorMessage, 'error');
      }
      throw new SubmissionError({
        _error: tradingPurchaseErrorMessage,
      });
    }

    if (!isReadyToMakeOrder) {
      let warningThreshold =
        ask_price * (this.state.rangePercent / 100) + ask_price;
      if (priceToBuy >= warningThreshold) {
        this.setState({
          isOpenConfirmDialog: true,
        });
        return;
      }
    }

    const err = await actions.buyCoin(data);
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
      dispatch(reset('TradingBuyCoinForm'));
      this.props.change('amount_to_buy', 0);
      this.props.change('current_buy_price', 0);
    }
  }
  _onChangeVNDToCoin = (vnd) => {
    let currentTotal = vnd;
    let { priceToBuy, trade_buy_fee } = this.props;
    currentTotal = isNaN(currentTotal) || currentTotal <= 0 ? 0 : currentTotal;
    if (priceToBuy > 0) {
      let amount = currentTotal / (1 + trade_buy_fee / 100) / priceToBuy;
      this.props.change(
        'amount_to_buy',
        formatNumberWithoutThousandSeparator(amount)
      );
    }

    this.setState({
      highlightPercent: 0,
    });
  };
  _amountCoinToBuy = (percent) => {
    const { wallet } = this.props;
    if (wallet && wallet.available_to_use) {
      if (!this.state.filledInput) {
        const money = wallet.available_to_use * (percent / 100);
        this._onChangeVNDToCoin(money);
        this.handlePriceButtonClick();
        this.props.change('total', formatNumber(floorMoney(money)));
      } else {
        const currentPrice = this.state.filledPrice;
        if (currentPrice > 0) {
          const totalAmount = wallet.available_to_use / currentPrice;
          const amount = totalAmount * (percent / 100);
          this.props.change('amount_to_buy', amount);
          this.props.change(
            'total',
            formatNumber(floorMoney(amount * currentPrice))
          );
        }
      }

      this.setState({
        highlightPercent: percent,
      });
    }
  };

  render() {
    const {
      userAuthenticated,
      handleSubmit,
      wallet,
      pristine,
      coin_id,
      coin_code,
      submitting,
      isCreatingWallet,
      walletUptoDateData,
      trade_buy_fee,
      ask_price,
      priceToBuy,
      intl,
    } = this.props;
    const { isOpenConfirmDialog, highlightPercent } = this.state;
    let walletData = wallet;
    if (walletUptoDateData && walletUptoDateData.coin_id === 'VND') {
      walletData = walletUptoDateData;
    }

    var maxBuyButtonTitleMessage = intl.formatMessage(
      {
        id: 'app.exchange.max.buy.title',
      },
      {
        coin_id: coin_id,
      }
    );

    var lastBuyButtonTitleMessage = intl.formatMessage(
      {
        id: 'app.exchange.price.buy.title',
      },
      {
        coin_id: coin_id,
      }
    );

    return (
      <div className="panel panel-default panel-exchange">
        <div className="panel-heading">
          <div className="panel-title clearfix">
            <span className="caption-subject font-blue bold uppercase">
              {`${formatNumber(
                (walletData && walletData.available_to_use) || 0
              )} VND `}
              <FormattedMessage id="app.exchange.available_to_use" />
            </span>
            <Link
              href="/cash"
              className="btn font-white md-btn bg-green-jungle pull-right"
            >
              <i className="fa fa-plus-square" />
              Nạp thêm VND
            </Link>
          </div>
        </div>
        <div className="panel-body">
          <div>
            <div className="tab-content">
              <div className="tab-pane fade in active" id="sendTo">
                <form onSubmit={handleSubmit(this.onSubmit)}>
                  <div className="clearfix" />
                  <div className="row">
                    <div className="col-md-12">
                      <Field
                        name="amount_to_buy"
                        type="text"
                        options={{
                          numeral: true,
                          numeralThousandsGroupStyle: 'thousand',
                          numeralDecimalScale: 4,
                          numeralPositiveOnly: true,
                        }}
                        component={RenderSingleFieldWithButton}
                        id="amount_to_buy"
                        placeholder={`Số lượng`}
                        buttonText={<FormattedMessage id="app.exchange.max" />}
                        buttonToolTipText={maxBuyButtonTitleMessage}
                        lastButtonText={
                          coin_code ? coin_code.toUpperCase() : 'COIN'
                        }
                        onChange={this.handleAmountChange.bind(this)}
                        validate={[isRequired]}
                        icon="fa-book"
                        handleClick={this.handleClick}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <Field
                        name="current_buy_price"
                        type="text"
                        options={{
                          numeral: true,
                          numeralThousandsGroupStyle: 'thousand',
                          numeralDecimalScale: 4,
                          numeralPositiveOnly: true,
                        }}
                        component={RenderSingleFieldWithButton}
                        id="current_buy_price"
                        placeholder="Giá"
                        validate={[isRequired]}
                        icon="fa-balance-scale"
                        buttonText={
                          <FormattedMessage id="app.exchange.price.buy" />
                        }
                        buttonToolTipText={lastBuyButtonTitleMessage}
                        lastButtonText="VND"
                        handleClick={this.handlePriceButtonClick}
                        props={{ min: 0 }}
                        onChange={this.handlePriceChange.bind(this)}
                      />
                    </div>
                  </div>
                  <div className="row mt-15">
                    <div className="col-md-12">
                      <div className="form-group form-group--set-percent">
                        <div className="text-percent">
                          <a
                            className={
                              highlightPercent == 25 ? 'text-yellow' : ''
                            }
                            href="javascript:void(0)"
                            onClick={() => this._amountCoinToBuy(25)}
                          >
                            25%
                          </a>
                          <a
                            className={
                              highlightPercent == 50 ? 'text-yellow' : ''
                            }
                            href="javascript:void(0)"
                            onClick={() => this._amountCoinToBuy(50)}
                          >
                            50%
                          </a>
                          <a
                            className={
                              highlightPercent == 75 ? 'text-yellow' : ''
                            }
                            href="javascript:void(0)"
                            onClick={() => this._amountCoinToBuy(75)}
                          >
                            75%
                          </a>
                          <a
                            className={
                              highlightPercent == 100 ? 'text-yellow' : ''
                            }
                            href="javascript:void(0)"
                            onClick={() => this._amountCoinToBuy(100)}
                          >
                            100%
                          </a>
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
                        id="total"
                        icon="fa-balance-scale"
                        placeholder={`Tổng tiền`}
                        labelText={<FormattedMessage id="app.order.total" />}
                        lastLabelText="VND"
                        validate={[isRequired]}
                        onChange={this.handleTotalChange.bind(this)}
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
                              fee: trade_buy_fee,
                            }}
                          />
                        </label>
                        {userAuthenticated ? (
                          <button
                            style={{ marginTop: '10px' }}
                            type="submit"
                            className="btn blue md-btn uppercase"
                            disabled={
                              pristine || submitting || isCreatingWallet
                            }
                          >
                            <i className="fa fa-plus-square" />
                            <FormattedMessage id="app.exchange.form.buy.title" />
                            <span> {coin_id}</span>
                          </button>
                        ) : (
                          <Link
                            href={`/login`}
                            className="btn blue md-btn uppercase btn--login"
                            disabled={
                              pristine || submitting || isCreatingWallet
                            }
                          >
                            <i className="fa fa-plus-square" />
                            <FormattedMessage id="app.exchange.form.buy.title" />
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
                  <i className="fa fa-warning" />{' '}
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
                    price_to_buy: formatNumber(priceToBuy),
                    ask_price: formatNumber(ask_price),
                  }
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
  const detail = (wallet && wallet.detail) || null;
  const firstWallet =
    detail && detail.result && detail.result[0] ? detail.result[0] : {};

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
  const orderBookSell = (exchange && exchange.orderBookSell) || null;

  return {
    wallet: firstWallet,
    secondWallet: secondWallet,
    exchange: exchange,
    walletUptoDateData,
    orderBookSell,
  };
}
// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ buyCoin }, dispatch),
  };
}

const validater = (values) => {
  const errors = {};
  if (values.amount_to_buy <= 0) {
    errors.amount_to_buy = 'Amount must be greater 0';
  }
  return errors;
};

TradingBuyCoinForm = connect(
  mapStateToProps,
  mapDispatchToProps
)(
  reduxForm({
    form: 'TradingBuyCoinForm',
    validater,
    asyncBlurFields: [],
  })(TradingBuyCoinForm)
);

const selector = formValueSelector('TradingBuyCoinForm'); // <-- same as form name
TradingBuyCoinForm = connect((state) => {
  const amountToBuy = selector(state, 'amount_to_buy') || 0;
  const priceToBuy = selector(state, 'current_buy_price') || 0;
  const total = selector(state, 'total') || 0;
  return {
    amountToBuy: accounting.unformat(amountToBuy),
    priceToBuy: accounting.unformat(priceToBuy),
    total: accounting.unformat(total),
  };
})(TradingBuyCoinForm);

export default injectIntl(
  connect(
    null,
    mapDispatchToProps
  )(
    reduxForm({
      form: 'TradingBuyCoinForm',
    })(TradingBuyCoinForm)
  )
);
