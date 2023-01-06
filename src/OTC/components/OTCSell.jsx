import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createOrder } from '../../Redux/actions/otc';
import OTCSellForm from './OTCSellForm';

class OTCBuy extends Component {
  render() {
    const {
      coinId,
      closeModal,
      maxBuyPrice,
      bankInfo,
      secondWallet,
    } = this.props;
    return (
      <OTCSellForm
        maxBuyPrice={maxBuyPrice}
        coinId={coinId}
        onSubmit={this.onSubmit}
        initialValues={null}
        form="otc-sell-form"
        type="SELL"
        closeModal={closeModal}
        bankInfo={bankInfo}
        secondWallet={secondWallet}
      />
    );
  }
}

export default OTCBuy;
