/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import SendHistoryForm from '../Forms/SendHistoryForm';
import DepositHistoryForm from '../Forms/DepositHistoryForm';
import DepositRequestHistoryForm from '../Forms/DepositRequestHistoryForm';
import { FormattedMessage } from 'react-intl';

class Transactions extends React.Component {
  state = {
    tabActived: 'tab1'
  }

  render() {
    return (
      <div className="row">
        <div className="row visible-xs visible-sm mt-30 mb-20">
          <div className="col-md-12">
            <div className="row">
              <div className="col-sm-12">
                <ul className="nav nav-tabs nav-justified nav-mobile">
                  <li className={this.state.tabActived === 'tab1' && 'active'}>
                    <a onClick={() => this.setState({ tabActived: 'tab1' })}>
                      <FormattedMessage id="app.history.deposit.tab.request" />
                    </a>
                  </li>
                  <li className={this.state.tabActived === 'tab2' && 'active'}>
                    <a onClick={() => this.setState({ tabActived: 'tab2' })}>
                      <FormattedMessage id="app.history.deposit.tab.deposit" />
                    </a>
                  </li>
                  <li className={this.state.tabActived === 'tab3' && 'active'}>
                    <a onClick={() => this.setState({ tabActived: 'tab3' })}>
                      <FormattedMessage id="app.history.deposit.tab.withdraw" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className={this.state.tabActived === 'tab1' ? 'hidden-xs hidden-sm show' : 'hidden-xs hidden-sm'}>
          <div className="row">
            <div className="col-md-12">
              <DepositRequestHistoryForm />
            </div>
          </div>
        </div>

        <div className={this.state.tabActived === 'tab2' ? 'hidden-xs hidden-sm show' : 'hidden-xs hidden-sm'}>
          <div className="row">
            <div className="col-md-12">
              <DepositHistoryForm />
            </div>
          </div>
        </div>

        <div className={this.state.tabActived === 'tab3' ? 'hidden-xs hidden-sm show' : 'hidden-xs hidden-sm'}>
          <div className="row">
            <div className="col-md-12">
              <SendHistoryForm />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Transactions;
