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
class OTCOnTradingForm extends Component {
  handleClick = () => {};

  handlePriceButtonClick = () => {};

  _onChangeVNDToCoin = (vnd) => {
    let currentTotal = vnd;
    let { priceToBuy, trade_buy_fee } = this.props;
    currentTotal = isNaN(currentTotal) || currentTotal <= 0 ? 0 : currentTotal;
    if (priceToBuy > 0) {
      let amount = currentTotal / (1 + trade_buy_fee / 100) / priceToBuy;
      this.props.change(
        'quantity',
        formatNumberWithoutThousandSeparator(amount)
      );
    }
  };

  _amountCoinToBuy = (percent) => {
    const { wallet } = this.props;
    const money = 11 * (percent / 100);
    this.props.change('total', formatNumber(floorMoney(money)));
    this._onChangeVNDToCoin(money);
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
    return (
      <div className="panel-exchange">
        <div className="panel-body ">
          <div>
            <div className="tab-content">
              <div className="alert alert-secondary text-center" role="alert">
                <b> {username} </b> bán <b> {formatNumber(orderAmount)} </b>
                {coinId} giá{' '}
                <b style={{ color: 'red' }}>{formatNumber(orderPrice)}</b> VND
              </div>
              <div className="tab-pane fade in active" id="sendTo">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="clearfix" />
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
                          className="btn bg-green-jungle md-btn uppercase"
                        >
                          <i className="fa fa-plus-square" />
                          Mua ngay
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

const selector = formValueSelector('otc-on-buy-form'); // <-- same as form name
OTCOnTradingForm = connect((state) => {
  const amountToBuy = selector(state, 'amount') || 0;
  return {
    amountToBuy: accounting.unformat(amountToBuy),
  };
})(OTCOnTradingForm);

export default injectIntl(
  connect(null, mapDispatchToProps)(reduxForm({})(OTCOnTradingForm))
);
