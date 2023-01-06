import React, { Component } from 'react';
import {
  Field,
  reduxForm,
  SubmissionError,
  formValueSelector,
} from 'redux-form';
import Link from '../../Link';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  RenderSingleFieldWithButton,
  RenderSingleFieldWithLabel,
} from '../../Forms/Renders';
import { createOrder } from '../../Redux/actions/otc';
import { isRequired } from '../../Forms/Validation';
import {
  formatNumber,
  formatNumberWithoutThousandSeparator,
  floorMoney,
  formatPureNumber,
} from '../../Helpers/utils';

import accounting from 'accounting';
class OTCBuyForm extends Component {
  state = {
    highlightPercent: 0,
  };

  handlePriceChange = (event) => {
    let currentPrice = event.target.rawValue;
    let { amountToBuy } = this.props;
    amountToBuy = isNaN(amountToBuy) ? 0 : amountToBuy;
    currentPrice = isNaN(currentPrice) ? 0 : currentPrice;
    this.props.change('total', this.calculateTotal(amountToBuy, currentPrice));
    this.setState({
      highlightPercent: 0,
      filledInput: true,
      filledPrice: currentPrice,
    });
  };

  calculateTotal = (amount, price) => {
    const { trade_buy_fee = 0 } = this.props;
    var total = 0;
    if (amount && price && trade_buy_fee != null) {
      total = amount * price + (trade_buy_fee / 100) * amount * price;
    }
    return total;
  };

  handleAmountChange = (event) => {
    let currentAmount = event.target.rawValue;
    let { priceToBuy = 0 } = this.props;
    currentAmount = isNaN(currentAmount) ? 0 : currentAmount;
    priceToBuy = isNaN(priceToBuy) ? 0 : priceToBuy;
    this.props.change(
      'total',
      formatNumberWithoutThousandSeparator(
        this.calculateTotal(currentAmount, priceToBuy)
      )
    );
  };

  handleClick = () => {};

  handleTotalChange = (event) => {
    const { amountToBuy, priceToBuy } = this.props;
    const currentTotal = event.target.rawValue;
    const amount = isNaN(amountToBuy) || amountToBuy <= 0 ? 0 : amountToBuy;
    const price = isNaN(priceToBuy) || priceToBuy <= 0 ? 0 : priceToBuy;
    if (price) {
      const _amount = currentTotal / price;
      this.props.change(
        'quantity',
        formatNumberWithoutThousandSeparator(_amount)
      );
    } else if (amount) {
      const _price = currentTotal / amount;
      this.props.change('price', formatNumberWithoutThousandSeparator(_price));
    }
  };

  handlePriceButtonClick = () => {
    const { minSellPrice, amountToBuy } = this.props;
    const amount = isNaN(amountToBuy) || amountToBuy <= 0 ? 0 : amountToBuy;
    const total = amount * minSellPrice;
    this.props.change(
      'price',
      formatNumberWithoutThousandSeparator(minSellPrice)
    );
    this.props.change('total', formatNumberWithoutThousandSeparator(total));
  };

  _onChangeVNDToCoin = (vnd) => {
    let currentTotal = vnd;
    let { minSellPrice = 23000, trade_buy_fee = 1 } = this.props;
    currentTotal = isNaN(currentTotal) || currentTotal <= 0 ? 0 : currentTotal;
    if (minSellPrice > 0) {
      let amount = (currentTotal / minSellPrice) * trade_buy_fee;
      this.props.change(
        'quantity',
        formatNumberWithoutThousandSeparator(amount)
      );
    }

    this.setState({
      highlightPercent: 0,
    });
  };

  _amountCoinToBuy = (percent) => {
    const { MAX_LIMIT_TO_BUY = 100000000, minSellPrice = 23000 } = this.props;
    const total = (MAX_LIMIT_TO_BUY * percent) / 100;
    this.props.change('total', formatNumber(floorMoney(total)));
    this.props.change('price', formatNumber(floorMoney(minSellPrice)));
    this._onChangeVNDToCoin(total);

    this.setState({
      highlightPercent: percent,
    });
  };

  renderCloseButton(customStyle) {
    const { closeModal } = this.props;
    return (
      <button
        type="button"
        className={customStyle ? customStyle : 'btn md-btn pull-right red'}
        onClick={closeModal}
      >
        <FormattedMessage id="app.global.button.close" />
      </button>
    );
  }

  onSubmit = (value) => {
    const { actions, coinId, socket, minSellPrice, closeModal } = this.props;
    const price = accounting.unformat(value.price);
    if (minSellPrice <= price) {
      throw new SubmissionError({
        _error: 'Đã có người đặt bán với giá này, có thể mua ngay',
      });
    }
    const createdData = {
      coinId: coinId,
      quantity: accounting.unformat(value.quantity),
      price,
      type: 'BUY',
      aggregateTotal: 0,
      total: accounting.unformat(value.total),
    };
    actions.createOrder(createdData, socket, closeModal);
  };

  render() {
    const { coinId, handleSubmit, type, error } = this.props;
    console.log('handleSubmit', handleSubmit);
    const { highlightPercent } = this.state;
    return (
      <div className="panel-exchange">
        <div className="panel-body ">
          <div>
            <div className="tab-content">
              <div className="tab-pane fade in active" id="sendTo">
                {error && (
                  <div
                    className="alert alert-danger"
                    style={{ marginTop: '25px', marginBottom: '0px' }}
                  >
                    <strong>
                      <FormattedMessage id="app.global.button.warning" />
                    </strong>{' '}
                    {error}.
                  </div>
                )}
                <form onSubmit={handleSubmit(this.onSubmit)}>
                  <div className="clearfix" />
                  <div className="row">
                    <div className="col-md-12">
                      <Field
                        name="price"
                        type="text"
                        options={{
                          numeral: true,
                          numeralThousandsGroupStyle: 'thousand',
                          numeralDecimalScale: 4,
                          numeralPositiveOnly: true,
                        }}
                        component={RenderSingleFieldWithButton}
                        id="price"
                        placeholder="Giá"
                        validate={[isRequired]}
                        icon="fa-balance-scale"
                        buttonText={
                          <FormattedMessage id="app.exchange.price.buy" />
                        }
                        buttonToolTipText={'Bấm để lấy giá USDT mới nhất'}
                        lastButtonText="VND"
                        handleClick={this.handlePriceButtonClick}
                        props={{ min: 0 }}
                        onChange={this.handlePriceChange}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-12">
                      <Field
                        name="quantity"
                        type="text"
                        options={{
                          numeral: true,
                          numeralThousandsGroupStyle: 'thousand',
                          numeralDecimalScale: 4,
                          numeralPositiveOnly: true,
                        }}
                        component={RenderSingleFieldWithButton}
                        id="quantity"
                        placeholder={`Số lượng`}
                        buttonText={<FormattedMessage id="app.exchange.max" />}
                        buttonToolTipText={'Bấm để đặt mua tối đa USDT'}
                        lastButtonText={coinId}
                        onChange={this.handleAmountChange}
                        validate={[isRequired]}
                        icon="fa-book"
                        handleClick={this.handleClick}
                      />
                    </div>
                  </div>
                  {/* <div className="">Bạn đang có xxx USDT</div> */}
                  <div className="row mt-15">
                    <div className="col-md-12">
                      <div className="form-group form-group--set-percent">
                        <div className="text-percent">
                          <a
                            className={
                              highlightPercent === 25 ? 'text-yellow' : ''
                            }
                            href="javascript:void(0)"
                            onClick={() => this._amountCoinToBuy(25)}
                          >
                            25%
                          </a>
                          <a
                            className={
                              highlightPercent === 50 ? 'text-yellow' : ''
                            }
                            href="javascript:void(0)"
                            onClick={() => this._amountCoinToBuy(50)}
                          >
                            50%
                          </a>
                          <a
                            className={
                              highlightPercent === 75 ? 'text-yellow' : ''
                            }
                            href="javascript:void(0)"
                            onClick={() => this._amountCoinToBuy(75)}
                          >
                            75%
                          </a>
                          <a
                            className={
                              highlightPercent === 100 ? 'text-yellow' : ''
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
                        onChange={this.handleTotalChange}
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
                              fee: 0,
                            }}
                          />
                        </label>
                        {type === 'BUY' ? (
                          <button
                            style={{ marginTop: '10px' }}
                            type="submit"
                            className="btn bg-green-jungle md-btn uppercase"
                          >
                            <i className="fa fa-plus-square" />
                            Đặt mua
                            <span> {coinId}</span>
                          </button>
                        ) : (
                          <button
                            style={{ marginTop: '10px' }}
                            type="submit"
                            className="btn red md-btn uppercase"
                          >
                            <i className="fa fa-plus-square" />
                            Đặt bán
                            <span> {coinId}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {this.renderCloseButton(
                    'btn md-btn pull-right red btn-close--popup'
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// export default injectIntl(reduxForm({})(OTCBuyForm));
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ createOrder }, dispatch),
  };
}
const selector = formValueSelector('otc-buy-form'); // <-- same as form name
OTCBuyForm = connect((state) => {
  const amountToBuy = selector(state, 'quantity') || 0;
  const priceToBuy = selector(state, 'price') || 0;
  const total = selector(state, 'total') || 0;
  return {
    amountToBuy: accounting.unformat(amountToBuy),
    priceToBuy: accounting.unformat(priceToBuy),
    total: accounting.unformat(total),
  };
})(OTCBuyForm);

export default injectIntl(
  connect(null, mapDispatchToProps)(reduxForm({})(OTCBuyForm))
);
