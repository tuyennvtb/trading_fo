/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import OrderTable from '../Forms/OrderTable';
import { FormattedMessage } from 'react-intl';
import openSocket from 'socket.io-client';
import { SocketIOHost } from '../Core/config';
import {
  getOpenOrderForAllCoins,
  getOrderHistoryForAllCoins,
} from '../Redux/actions/exchange';
import { getSettingsByItem } from '../Redux/actions/settings';
import ToastNotification from '../Processing/ToastNotification.js';
// import '../assets/css/pages/trade_history.css';

class TradeHistory extends React.Component {
  constructor(props) {
    super(props);

    this.socket = openSocket(SocketIOHost);
  }

  state = {
    sharing: {
      enable: false,
      start: ''
    },
    isFetched: false,
    tabActived: 'tab1'
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.getOpenOrderForAllCoins(this.socket);
    actions.getOrderHistoryForAllCoins(this.socket);
    actions.getSettingsByItem('fb_setting');
  }

  _reloadHistory = () => {
    const { actions } = this.props;
    actions.getOrderHistoryForAllCoins(this.socket);
  }

  componentWillReceiveProps() {
    const { settings } = this.props;
    if (!this.state.isFetched
      && settings
      && settings.item === 'fb_setting'
    ) {
      if (settings.value.sharing_transaction) {
        const sharingSetting = settings.value.sharing_transaction;
        this.setState({
          sharing: sharingSetting,
          isFetched: true
        })
      }
    }
  }

  componentWillUnmount() {
    this.socket.close();
  }

  render() {
    const { orderOpeningForAllCoins, orderConfirmedForAllCoins } = this.props;
    return (
      <div className="container-fuild exchange trade-history">
        <div className="row visible-xs visible-sm mt-30 mb-20">
          <div className="col-md-12">
            <div className="row">
              <div className="col-sm-12">
                <ul className="nav nav-tabs nav-justified nav-mobile">
                  <li className={this.state.tabActived === 'tab1' && 'active'}>
                    <a onClick={() => this.setState({ tabActived: 'tab1' })}>
                      <FormattedMessage id="app.order.processing" />
                    </a>
                  </li>
                  <li className={this.state.tabActived === 'tab2' && 'active'}>
                    <a onClick={() => this.setState({ tabActived: 'tab2' })}>
                      <FormattedMessage id="app.order.done" />
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
              <div className="portlet mt-element-ribbon light portlet-fit bordered paper-3">
                <div className="portlet-title">
                  <div className="caption">
                    <span className="bold uppercase">
                      <FormattedMessage id="app.order.allopening" />
                    </span>
                  </div>
                </div>
                <div className="portlet-body">
                  {orderOpeningForAllCoins !== null ? (
                    <OrderTable
                      data={orderOpeningForAllCoins}
                      type="open"
                      isForAllCoins={true}
                    />
                  ) : (
                      <p className="spin-loading">Loading...</p>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={this.state.tabActived === 'tab2' ? 'hidden-xs hidden-sm show' : 'hidden-xs hidden-sm'}>
          <div className="row">
            <div className="col-md-12">
              <div className="portlet mt-element-ribbon light portlet-fit bordered paper-3">
                <div className="portlet-title">
                  <div className="caption">
                    <span className="bold uppercase">
                      <FormattedMessage id="app.order.allconfirmed" />
                    </span>
                  </div>
                </div>
                <div className="portlet-body">
                  {orderConfirmedForAllCoins !== null ? (
                    <OrderTable
                      data={orderConfirmedForAllCoins}
                      type="confirmed"
                      isForAllCoins={true}
                      sharing={this.state.sharing}
                      reloadHistory={this._reloadHistory}
                    />
                  ) : (
                      <p className="spin-loading">Loading...</p>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <ToastNotification />
      </div>
    );
  }
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ exchange, settings }) {
  const orderOpeningForAllCoins =
    (exchange && exchange.orderOpeningForAllCoins) || null;
  const orderConfirmedForAllCoins =
    (exchange && exchange.orderConfirmedForAllCoins) || null;
  return {
    orderOpeningForAllCoins,
    orderConfirmedForAllCoins,
    settings
  };
}

// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        getOpenOrderForAllCoins,
        getOrderHistoryForAllCoins,
        getSettingsByItem
      },
      dispatch,
    ),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TradeHistory);
