/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import CoinsInfo from '../CoinsInfo';
class CoinPriceTableWidget extends React.Component {
  renderPriceTable() {
    const domain = `${window.location.protocol}//${window.location.host}`;
    const { user_id } = this.props;
    const redirectedUrl = `${domain}/register/referer/${user_id}`;
    const priceTable = (
      <CoinsInfo
        detectArea="home"
        isWidget="true"
        redirectedUrl={redirectedUrl}
      />
    );
    return priceTable;
  }
  render() {
    return (
      <div className="price-table widget bg-white">
        <div>
          <img
            src="/assets/global/img/bitmoon/logo.png"
            alt="logo"
            className="img-responsive lazy"
          />
        </div>
        {this.renderPriceTable()}
      </div>
    );
  }
}

export default CoinPriceTableWidget;
