/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getCoinPriceDetail, getCoinsInfoById } from '../Redux/actions/coin';
import openSocket from 'socket.io-client';
import { SocketIOHost } from '../Core/config';
import { FormattedMessage } from 'react-intl';
import Chart from '../Chart';
import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';
import { Loader } from 'react-loaders';
import 'loaders.css/loaders.min.css';
import moment from 'moment';

class FullPageChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedChartTickInterval: {
        label: '30 phút',
        value: 'thirtyMin',
        intervalTime: 1800000,
      },
      isBlockingChartUI: true,
    };
    this.socket = openSocket(SocketIOHost);
  }

  async componentDidMount() {
    await this.setupPage();
  }

  updateChartRequestIntervalTime = async () => {
    clearInterval(this.getCoinPriceDetailInterval);
    this.getCoinPriceDetailInterval = setInterval(async () => {
      const { coinInfoById, actions } = this.props;
      if (coinInfoById) {
        await actions.getCoinPriceDetail(
          coinInfoById[0].coin,
          this.state.selectedChartTickInterval.value,
          coinInfoById[0].is_direct,
          coinInfoById[0].broker_code,
        );
      }
    }, this.state.selectedChartTickInterval.intervalTime);
  };

  setupPage = async () => {
    const { actions, coin_id } = this.props;
    await actions.getCoinsInfoById(this.socket, coin_id, true);
    this.setState({ isBlockingChartUI: false });
    this.getCoinPriceDetailInterval = setInterval(async () => {
      const { coinInfoById } = this.props;
      if (coinInfoById) {
        await actions.getCoinPriceDetail(
          coinInfoById[0].coin,
          this.state.selectedChartTickInterval.value,
          coinInfoById[0].is_direct,
          coinInfoById[0].broker_code,
        );
      }
    }, this.state.selectedChartTickInterval.intervalTime);

    window.scrollTo(0, 0);
  };

  handleChartTickIntervalMenuClicked = async interval => {
    const { actions, coinInfoById } = this.props;
    if (coinInfoById) {
      this.setState({ isBlockingChartUI: true });
      await actions.getCoinPriceDetail(
        coinInfoById[0].coin,
        interval,
        coinInfoById[0].is_direct,
        coinInfoById[0].broker_code,
      );
      let currentLabel = this.state.selectedChartTickInterval.label;
      let currentIntervalTime = this.state.selectedChartTickInterval
        .intervalTime;
      switch (interval) {
        case 'day':
          currentLabel = '1 ngày';
          currentIntervalTime = 86400000;
          break;
        case 'hour':
          currentLabel = '1 giờ';
          currentIntervalTime = 3600000;
          break;
        case 'oneMin':
          currentLabel = '1 phút';
          currentIntervalTime = 60000;
          break;
        case 'fiveMin':
          currentLabel = '5 phút';
          currentIntervalTime = 300000;
          break;
        case 'thirtyMin':
          currentLabel = '30 phút';
          currentIntervalTime = 1800000;
          break;
        default:
          break;
      }
      this.setState({
        selectedChartTickInterval: {
          value: interval,
          label: currentLabel,
          intervalTime: currentIntervalTime,
        },
      });
      this.setState({ isBlockingChartUI: false });
      this.updateChartRequestIntervalTime();
    }
  };

  renderChartTickIntervalDropdownMenu() {
    const { selectedChartTickInterval } = this.state;
    return [
      <button
        className="btn green-jungle btn-outline btn-circle active"
        data-toggle="dropdown"
        data-hover="dropdown"
        data-close-others="true"
        aria-expanded="false"
        key="tick-interval-button"
      >
        <i className="icon-clock" /> {selectedChartTickInterval.label}
        <i className="fa fa-angle-down" />
      </button>,
      <ul className="dropdown-menu pull-right" key="tick-interval-dropdown">
        <li>
          <a onClick={() => this.handleChartTickIntervalMenuClicked('day')}>
            {' '}
            1 ngày
          </a>
        </li>
        <li>
          <a onClick={() => this.handleChartTickIntervalMenuClicked('hour')}>
            {' '}
            1 giờ
          </a>
        </li>
        <li className="divider"> </li>
        <li>
          <a onClick={() => this.handleChartTickIntervalMenuClicked('oneMin')}>
            {' '}
            1 phút
          </a>
        </li>
        <li>
          <a onClick={() => this.handleChartTickIntervalMenuClicked('fiveMin')}>
            {' '}
            5 phút
          </a>
        </li>
        <li>
          <a
            onClick={() => this.handleChartTickIntervalMenuClicked('thirtyMin')}
          >
            {' '}
            30 phút
          </a>
        </li>
      </ul>,
    ];
  }

  formatPriceWithVndRate(price, vndRate, fee) {
    //return price * vndRate + price * vndRate * fee / 100;
    return price;
  }

  renderChart = () => {
    const { priceList, coinInfoById } = this.props;

    let chartData = null;
    if (
      coinInfoById &&
      priceList &&
      priceList.chartData &&
      priceList.chartData.length > 0
    ) {
      chartData = priceList.chartData.map(item => {
        return {
          open: item.O,
          high: item.H,
          low: item.L,
          close: item.C,
          volume: item.V,
          date: moment(item.T, 'YYYY-MM-DD HH:mm:ss').toDate(),
        };
      });
    }

    return (
      <div id="chart-area" className="row chart-container">
        <div className="col-md-12">
          {chartData && <Chart data={chartData} />}
        </div>
      </div>
    );
  };

  render() {
    const { coinInfoById, coin_id } = this.props;
    const coin = coinInfoById ? coinInfoById[0] : {};
    return (
      <div>
        {coin_id !== 'tether' && coin.broker_code != 'bitmoon' && coin.normal !== 0 ? (
          <div className="full-page-chart container-fluid">
            <BlockUi
              tag="div"
              blocking={this.state.isBlockingChartUI}
              className="blocking-overlay"
              loader={
                <Loader
                  active
                  type="line-scale-pulse-out-rapid"
                  color="#02a17c"
                />
              }
            >
              <div className="row chart-section">
                <div className="col-md-12">
                  <div className="portlet light portlet-fit bordered paper-3">
                    <div className="portlet-title">
                      <div className="caption ">
                        <span className="caption-subject yellow bold uppercase">
                          <i className="fa fa-bar-chart" />{' '}
                          <FormattedMessage id="app.exchange.chart" />{' '}
                          {this.props.coin_id}
                        </span>
                      </div>
                      <div className="actions">
                        <div className="btn-group">
                          {this.renderChartTickIntervalDropdownMenu()}
                        </div>
                      </div>
                    </div>
                    <div className="portlet-body">
                      {this.renderChart()}
                      <div className="clearfix" />
                    </div>
                  </div>
                </div>

                <div className="clearfix" />
              </div>
            </BlockUi>
          </div>
        ) : (
          <p className="text-center">
            <span className="uppercase bold">
              <FormattedMessage id="app.exchange.chart.nodata" /> {coin_id}
            </span>
          </p>
        )}
      </div>
    );
  }
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ coinsInfo }) {
  const priceList = (coinsInfo && coinsInfo.priceList) || null;
  const coinInfoById = (coinsInfo && coinsInfo.coinInfoById) || null;
  return {
    priceList,
    coinInfoById,
  };
}

// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        getCoinPriceDetail,
        getCoinsInfoById,
      },
      dispatch,
    ),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FullPageChart);
