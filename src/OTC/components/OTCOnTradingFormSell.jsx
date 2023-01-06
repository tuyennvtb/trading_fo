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

import { isRequired } from '../../Forms/Validation';
import {
  formatNumber,
  formatNumberWithoutThousandSeparator,
  floorMoney,
  formatPureNumber,
} from '../../Helpers/utils';
import accounting from 'accounting';
class OTCOnTradingFormSell extends Component {
  state = {
    highlightPercent: 0,
  };
  handleClick = () => {
    const { secondWallet, orderPrice } = this.props;
    const currentBalance = (secondWallet && secondWallet.current_balance) || 0;
    const currentTotal = currentBalance * orderPrice;
    this.props.change(
      'amount',
      formatNumberWithoutThousandSeparator(currentBalance)
    );
    this.props.change(
      'total',
      formatNumberWithoutThousandSeparator(currentTotal)
    );
  };

  handlePriceButtonClick = () => {};

  _onChangeVNDToCoin = (vnd) => {
    let currentTotal = vnd;
    let { orderPrice, trade_buy_fee = 1 } = this.props;
    currentTotal = isNaN(currentTotal) || currentTotal <= 0 ? 0 : currentTotal;
    if (orderPrice > 0) {
      let amount = (currentTotal / orderPrice) * trade_buy_fee;
      this.props.change('amount', formatNumberWithoutThousandSeparator(amount));
    }
  };

  handleTotalChange = (event) => {
    let { orderPrice } = this.props;
    let currentTotal = event.target.rawValue;
    currentTotal = parseFloat(currentTotal);

    currentTotal = isNaN(currentTotal) || currentTotal <= 0 ? 0 : currentTotal;

    const finalAmount = currentTotal / orderPrice;
    this.props.change(
      'amount',
      formatNumberWithoutThousandSeparator(finalAmount)
    );
  };

  handleAmountChange = (event) => {
    let { orderPrice } = this.props;
    let currentAmount = event.target.rawValue;
    currentAmount = parseFloat(currentAmount);
    currentAmount = isNaN(currentAmount) ? 0 : currentAmount;
    orderPrice = isNaN(orderPrice) ? 0 : orderPrice;
    const finalTotal = orderPrice * currentAmount;
    this.props.change(
      'total',
      formatNumberWithoutThousandSeparator(finalTotal)
    );
  };

  _amountCoinToBuy = (percent) => {
    const { orderAmount, orderPrice } = this.props;
    const money = orderAmount * orderPrice * (percent / 100);
    this.props.change('total', formatNumber(floorMoney(money)));
    this._onChangeVNDToCoin(money);
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

  render() {
    const {
      coinId,
      handleSubmit,
      onSubmit,
      username,
      orderPrice,
      orderAmount,
    } = this.props;
    const { highlightPercent } = this.state;
    return (
      <div className="panel-exchange">
        <div className="panel-body ">
          <div>
            <div className="tab-content">
              <div className="alert alert-secondary text-center" role="alert">
                <b> {username} </b> mua <b> {formatNumber(orderAmount)} </b>
                {coinId} giá{' '}
                <b style={{ color: 'red' }}>{formatNumber(orderPrice)}</b> VND
              </div>
              <div className="tab-pane fade in active" id="sendTo">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="clearfix" />

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
                  <div className="row">
                    <div className="col-md-12">
                      <Field
                        name="amount"
                        type="text"
                        options={{
                          numeral: true,
                          numeralThousandsGroupStyle: 'thousand',
                          numeralDecimalScale: 4,
                          numeralPositiveOnly: true,
                        }}
                        component={RenderSingleFieldWithButton}
                        id="amount"
                        placeholder={`Số lượng`}
                        buttonText={'Số lượng'}
                        buttonToolTipText={'Bấm để đặt mua tối đa USDT'}
                        lastButtonText={coinId}
                        validate={[isRequired]}
                        icon="fa-book"
                        handleClick={this.handleClick}
                        onChange={this.handleAmountChange}
                      />
                    </div>
                  </div>
                  {/* <div className="">Bạn đang có xxx USDT</div> */}
                  <div className="row">
                    <div className="col-md-12">
                      <div className="footer">
                        <button
                          style={{ marginTop: '10px' }}
                          type="submit"
                          className="btn red md-btn uppercase"
                        >
                          <i className="fa fa-plus-square" />
                          Bán ngay
                          <span> {coinId}</span>
                        </button>
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
    actions: bindActionCreators({}, dispatch),
  };
}

const selector = formValueSelector('otc-on-sell-form'); // <-- same as form name
OTCOnTradingFormSell = connect((state) => {
  const amountToBuy = selector(state, 'amount') || 0;
  const total = selector(state, 'total') || 0;
  return {
    amountToBuy: accounting.unformat(amountToBuy),
    total: accounting.unformat(total),
  };
})(OTCOnTradingFormSell);

export default injectIntl(
  connect(null, mapDispatchToProps)(reduxForm({})(OTCOnTradingFormSell))
);
