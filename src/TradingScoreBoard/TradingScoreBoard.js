/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ScroreBoardTable from '../Forms/ScroreBoardTable';
import { getAllTradingInfo } from '../Redux/actions/exchange';
import { getSettingsByItem } from '../Redux/actions/settings';
import ToastNotification from '../Processing/ToastNotification.js';
import { formatDate } from '../Helpers/utils';
// import '../assets/css/pages/trade_history.css';

class TradingScoreBoard extends React.Component {
  state = {
    isFetched: false,
    start: '',
    end: ''
  }

  componentDidMount() {
    this.loadDB();
    this.props.actions.getSettingsByItem('system_top_volume');
  }

  componentWillReceiveProps() {
    const { settings } = this.props;
    if (!this.state.isFetched
      && settings
      && settings.item === 'system_top_volume'
    ) {
      const start = settings.value.start;
      const end = settings.value.end;
      this.setState({
        start,
        end,
        isFetched: true
      })
    }
  }

  loadDB() {
    const { actions, coin_id } = this.props;
    actions.getAllTradingInfo(coin_id);
  }

  render() {
    const { allTradingInfo, coin_id } = this.props;
    const { start, end } = this.state;
    return (
      <div className="container-fuild exchange trade-history">
        <div className="row">
          <div className="col-md-12">
            <div className="portlet mt-element-ribbon light portlet-fit bordered paper-3">
              <div className="portlet-title">
                <div className="caption">
                  <span className="bold uppercase">
                    Bảng xếp hạng giao dịch {coin_id.toUpperCase()} từ {formatDate(start, 'DD/MM/YYYY')} đến {formatDate(end, 'DD/MM/YYYY')}
                  </span>
                </div>
              </div>
              <div className="portlet-body">
                {allTradingInfo !== null ? (
                  <ScroreBoardTable
                    data={allTradingInfo}
                    type="confirmed"
                    isForAllCoins={true}
                  />
                ) : (
                    <p className="spin-loading">Loading...</p>
                  )}
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
  const allTradingInfo = (exchange && exchange.allTradingInfo) || null;

  return {
    allTradingInfo,
    settings,
  };
}

// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        getAllTradingInfo,
        getSettingsByItem
      },
      dispatch,
    ),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(TradingScoreBoard);
