/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import TradingSellCoinForm from '../Forms/TradingSellCoinForm';
class SellCoinForm extends React.Component {
  render() {
    return (
      <div className="portlet-body">
        <TradingSellCoinForm {...this.props} />
      </div>
    );
  }
}

export default SellCoinForm;
