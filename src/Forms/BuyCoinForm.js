/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import TradingBuyCoinForm from '../Forms/TradingBuyCoinForm';
class BuyCoinForm extends React.Component {
  render() {
    return (
      <div className="portlet-body">
        <TradingBuyCoinForm {...this.props} />
      </div>
    );
  }
}

export default BuyCoinForm;
