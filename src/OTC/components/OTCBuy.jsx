import React, { Component } from 'react';
import OTCBuyForm from './OTCBuyForm';

class OTCBuy extends Component {
  render() {
    const { coinId, closeModal, minSellPrice } = this.props;
    return (
      <OTCBuyForm
        minSellPrice={minSellPrice}
        coinId={coinId}
        onSubmit={this.onSubmit}
        initialValues={null}
        form="otc-buy-form"
        formId="otc-buy-form"
        type="BUY"
        closeModal={closeModal}
      />
    );
  }
}

export default OTCBuy;
