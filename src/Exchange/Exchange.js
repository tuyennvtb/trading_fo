/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';
import { Loader } from 'react-loaders';
import 'loaders.css/loaders.min.css';
import BuyCoinForm from '../Forms/BuyCoinForm';
import SellCoinForm from '../Forms/SellCoinForm';
import OrderHistoryForm from '../Forms/OrderHistoryForm';
import OrderOpenForm from '../Forms/OrderOpenForm';
import { toast } from 'react-toastify';
import store from '../store';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Link from '../Link';
import {
  RESET_ORDER_BOOK_BUY,
  RESET_ORDER_BOOK_SELL,
  RESET_PRICE_DETAIL,
} from '../Redux/constants';
import { setRuntimeVariable } from '../Redux/actions/runtime';
import { getCoinPriceDetail, getCoinsInfoById, unsubscribeCoin } from '../Redux/actions/coin';
import { getUserPromotionInfo } from '../Redux/actions/promotion';
import openSocket from 'socket.io-client';
import { SocketIOHost } from '../Core/config';
import {
  ERRORS,
  GLOBAL_VARIABLES,
  EXCHANGE_ORDER_TYPE,
  TOAST_TYPE,
} from '../Helpers/constants/system';
import { createWallet, getWalletDetail } from '../Redux/actions/wallet';
import HighlightablePrice from '../Processing/HighlightablePrice.js';
import ToastNotification from '../Processing/ToastNotification.js';
import { formatNumber } from '../Helpers/utils';
import accounting from 'accounting';
import ReactBootstrapTable from '../ReactBootstrapTable/ReactBootstrapTable';
import CoinInfoMiniTable from '../CoinsInfo/CoinInfoMini';
import history from '../history';
import { redirect } from '../Core/config';
import NotLoggedInForm from '../Forms/NotLoggedInForm';
import { CHECK_IS_MOBILE } from '../Helpers/constants/system';
import '../assets/css/pages/exchange.css';
import TradingView from './TradingView';

class Exchange extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isCreatingWallet: false,
      selectedBuyOrderBookPrice: '',
      selectedSellOrderBookPrice: '',
      selectedChartTickInterval: {
        label: '30 phút',
        value: 'thirtyMin',
        intervalTime: 1800000,
      },
      isBlockingChartUI: true,
      tabActived: 'trade'
    };
    this.socket = openSocket(SocketIOHost);
  }
  static propTypes = {
    actions: PropTypes.shape({
      getCoinPriceDetail: PropTypes.func.isRequired,
      getCoinsInfoById: PropTypes.func.isRequired,
    }).isRequired,
  };

  createUserWallet = () => {
    const { actions, coin_id, user } = this.props;
    if (user) {
      this.toastCreateWalletID = null;
      const toastOptions = {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        position: 'top-center',
        className: 'toast-notify-custom',
      };
      this.toastCreateWalletID = toast.info(
        <FormattedMessage id="cash.deposit.createwallet.start" />,
        toastOptions,
      );
      this.setState({
        isCreatingWallet: true,
      });

      actions.createWallet(GLOBAL_VARIABLES.BASE_CURRENCY);
      actions.createWallet(coin_id);
      let myHandler = setInterval(async () => {
        const err1 = await actions.getWalletDetail(
          GLOBAL_VARIABLES.BASE_CURRENCY,
          false,
          'BUY',
        );
        const err2 = await actions.getWalletDetail(coin_id, false, 'SELL');
        if (!err1 && !err2) {
          clearInterval(myHandler);
          toast.update(this.toastCreateWalletID, {
            render: <FormattedMessage id="cash.deposit.createwallet.success" />,
            type: toast.TYPE.SUCCESS,
            autoClose: 3000,
            closeButton: null, // The closeButton defined on ToastContainer will be used
          });
          this.setState({
            isCreatingWallet: false,
          });
        }
      }, 3000);
    }
  };

  updateChartRequestIntervalTime = async () => {
    clearInterval(this.getCoinPriceDetailInterval);
    this.getCoinPriceDetailInterval = setInterval(async () => {
      const { coinInfoById, actions } = this.props;
      if (coinInfoById) {
        await actions.getCoinPriceDetail(
          coinInfoById.coin,
          this.state.selectedChartTickInterval.value,
          coinInfoById.is_direct,
          coinInfoById.broker_code,
        );
      }
    }, this.state.selectedChartTickInterval.intervalTime);
  };

  setupPage = async () => {
    const { actions, coin_id, userAuthenticated } = this.props;
    await actions.getCoinsInfoById(this.socket, coin_id, true);
    if (userAuthenticated) {
      const err1 = await actions.getWalletDetail(
        GLOBAL_VARIABLES.BASE_CURRENCY,
        false,
        'BUY',
        this.socket,
      );
      const err2 = await actions.getWalletDetail(
        coin_id,
        false,
        'SELL',
        this.socket,
      );
      if (err1 === ERRORS.NO_WALLET || err2 === ERRORS.NO_WALLET) {
        this.createUserWallet();
      }
    }
    this.setState({ isBlockingChartUI: false });
    this.getCoinPriceDetailInterval = setInterval(async () => {
      const { coinInfoById } = this.props;
      if (coinInfoById) {
        await actions.getCoinPriceDetail(
          coinInfoById.coin,
          this.state.selectedChartTickInterval.value,
          coinInfoById.is_direct,
          coinInfoById.broker_code,
        );
      }
    }, this.state.selectedChartTickInterval.intervalTime);

    window.scrollTo(0, 0);
  };

  resetPage = async () => {
    this.socket.close();
    this.socket = openSocket(SocketIOHost);
    this.setState({
      isCreatingWallet: false,
      selectedBuyOrderBookPrice: '',
      selectedSellOrderBookPrice: '',
    });
    store.dispatch({
      type: RESET_ORDER_BOOK_BUY,
    });
    store.dispatch({
      type: RESET_ORDER_BOOK_SELL,
    });
    store.dispatch({
      type: RESET_PRICE_DETAIL,
    });
    toast.dismiss(this.toastCreateWalletID);
    clearInterval(this.getCoinPriceDetailInterval);
    window.scrollTo(0, 0);
  };

  async componentDidMount() {
    await this.setupPage();
    const { coinInfoById, coin_id, actions } = this.props;
    actions.getUserPromotionInfo();
    if (coinInfoById) {
      let currentCoinInfo = coinInfoById;
      if (!!currentCoinInfo.fast && !!!currentCoinInfo.normal) {
        history.push(`${redirect.simple_exchange}/${coin_id}`);
      } else if (!!!currentCoinInfo.fast && !!!currentCoinInfo.normal) {
        history.push(redirect.exchange);
      }
    } else {
      history.push(redirect.exchange);
    }
  }

  async componentDidUpdate(prevProps) {
    const { coin_id } = this.props;

    if (prevProps.coin_id !== coin_id) {
      this.resetPage();
      this.setupPage();
    }
  }

  async componentWillUnmount() {
    this.resetPage();
    const { actions, coin_id } = this.props;
    await actions.unsubscribeCoin(this.socket, coin_id);
  }

  formatPriceChange(priceChange) {
    if (priceChange < 0) {
      return (
        <span className="font-red">
          <i className="fa fa-arrow-down" /> {formatNumber(priceChange)}
        </span>
      );
    } else {
      return (
        <span className="font-green-jungle">
          <i className="fa fa-arrow-up" /> {formatNumber(priceChange)}
        </span>
      );
    }
  }

  renderPriceTable = data => {
    let myTable = null;
    if (data) {
      myTable = (
        <div className="row coin-info-list">
          <div className="col-md-3">
            <h3 className="text-coin-title uppercase">
              <img
                alt="..."
                className="lazy"
                src={`/assets/global/img/coin-logo/${data.coin_id}.png`}
              />
              <span>
                {data.coin_id} ({data.coin})
              </span>
            </h3>
          </div>
          <div className="col-md-9 clearfix info-chart">
            <div className="col-md-3 col-sm-3 col-xs-12">
              <span className="label label-success label-change24h">
                {' '}
                % (24h):{' '}
              </span>
              <h3 className="text-info">
                {this.formatPriceChange(data.percent_change_24h)}
              </h3>
            </div>
            <div className="col-md-3 col-sm-3 col-xs-12">
              <span className="label label-info label-bid-price">
                {' '}
                <FormattedMessage id="app.exchange.bid_price" />:{' '}
              </span>
              <h3 className="text-info">
                <HighlightablePrice
                  price={formatNumber(data.bid_price_vnd)}
                  unitLabel={'VND'}
                />
              </h3>
            </div>
            <div className="col-md-3 col-sm-3 col-xs-12">
              <span className="label label-danger label-ask-price">
                {' '}
                <FormattedMessage id="app.exchange.ask_price" />:{' '}
              </span>
              <h3 className="text-info">
                <HighlightablePrice
                  price={formatNumber(data.ask_price_vnd)}
                  unitLabel={'VND'}
                />
              </h3>
            </div>
            <div className="col-md-3 col-sm-3 col-xs-12">
              <span className="label label-warning label-volume">
                {' '}
                <FormattedMessage id="app.exchange.volume" />:{' '}
              </span>
              <h3 className="text-info">{formatNumber(data.volume_usd_24h)}</h3>
            </div>
          </div>
        </div>
      );
    }
    return myTable;
  };

  formatOrderBookPrice(orders, userId) {
    if (Array.isArray(orders)) {
      return orders.map(order => {
        const totalPrice = order.Quantity * order.Rate;
        let isUserOrderBook = false;
        if (order.user_id === userId) {
          isUserOrderBook = true;
        }
        return {
          Quantity: formatNumber(order.Quantity),
          Rate: formatNumber(order.Rate),
          Total: formatNumber(totalPrice),
          UserID: order.users_id,
          isUserOrderBook: isUserOrderBook,
        };
      });
    }
  }

  setSelectedOrderBookPrice = (priceText, type) => {
    priceText = accounting.unformat(priceText);
    const roundedPrice = accounting.toFixed(priceText, 0);
    this.setState({ selectedBuyOrderBookPrice: priceText });
    this.setState({ selectedSellOrderBookPrice: priceText });
  };

  renderTradingSection() {
    const {
      orderBookBuy,
      orderBookSell,
      user,
      coin_id,
      userAuthenticated,
    } = this.props;
    const userId = user && user.id;

    var buyOrderTableProps = {
      className: 'buy-order-book-table -striped -highlight',
      data: [],
      columns: [],
      showPageJump: false,
      defaultPageSize: 10,
      pageSizeOptions: [10, 25, 30, 50],
      defaultSorted: [
        {
          id: "Rate",
          desc: true
        }
      ],
      noDataText: (
        <div>
          <span>
            <FormattedMessage id="app.orderbook.loadingorders" />{' '}
          </span>
          <i className="fa fa-spinner fa-spin" />
        </div>
      ),
      previousText: <i className="fa fa-chevron-left" />,
      nextText: <i className="fa fa-chevron-right" />,
      loadingText: 'Loading...',
      pageText: <FormattedMessage id="app.global.page" />,
      ofText: '/',
      rowsText: '',
      getTrProps: (state, rowInfo, column) => {
        if (rowInfo) {
          return {
            style: {
              backgroundColor: rowInfo.row._original.isUserOrderBook
                ? '#dcfbdc'
                : 'white',
            },
          };
        } else {
          return {
            style: {
              background: 'white',
            },
          };
        }
      },
    };

    if (CHECK_IS_MOBILE()) {
      buyOrderTableProps.defaultPageSize = 5;
      buyOrderTableProps.pageSizeOptions = [];
    }

    var sellOrderTableProps = {
      className: 'sell-order-book-table -striped -highlight',
      data: [],
      columns: [],
      defaultSorted: [
        {
          id: "Rate",
          desc: false
        }
      ],
      showPageJump: false,
      defaultPageSize: 10,
      pageSizeOptions: [10, 25, 30, 50],
      noDataText: (
        <div>
          <span>
            <FormattedMessage id="app.orderbook.loadingorders" />{' '}
          </span>
          <i className="fa fa-spinner fa-spin" />
        </div>
      ),
      previousText: <i className="fa fa-chevron-left" />,
      nextText: <i className="fa fa-chevron-right" />,
      loadingText: 'Loading...',
      pageText: <FormattedMessage id="app.global.page" />,
      ofText: '/',
      rowsText: '',
      getTrProps: (state, rowInfo, column) => {
        if (rowInfo) {
          return {
            style: {
              backgroundColor: rowInfo.row._original.isUserOrderBook
                ? '#dcfbdc'
                : 'white',
            },
          };
        } else {
          return {
            style: {
              background: 'white',
            },
          };
        }
      },
    };

    if (CHECK_IS_MOBILE()) {
      sellOrderTableProps.defaultPageSize = 5;
      sellOrderTableProps.pageSizeOptions = [];
    }

    if (orderBookBuy && orderBookSell) {
      var buyOrders = this.formatOrderBookPrice(orderBookBuy.buyOrders, userId);
      var sellOrders = this.formatOrderBookPrice(
        orderBookSell.sellOrders,
        userId,
      );
      
      var totalVndAmount = buyOrders.reduce((acc, val) => {
        return acc + accounting.unformat(val.Total);
      }, 0);
      var totalCoinQuantity = sellOrders.reduce((acc, val) => {
        return acc + accounting.unformat(val.Quantity);
      }, 0);
      const buyColumnRate = {
        Header: () => (
          <span>
            <FormattedMessage id="app.exchange.bid_price" />{' '}
            <i className="fa fa-sort" />
          </span>
        ),
        sortMethod: (a, b) => {
          var numberA = Number(a ? accounting.unformat(a) : 0, 10);
          var numberB = Number(b ? accounting.unformat(b) : 0, 10);
          return numberA - numberB;
        },
        accessor: 'Rate',
        minWidth: 70,
        headerClassName: 'rate-col-header',
        className: 'rate-col',
        Cell: props => (
          <a
            onClick={event =>
              this.setSelectedOrderBookPrice(
                props.value,
                EXCHANGE_ORDER_TYPE.BUY,
              )}
          >
            <HighlightablePrice isBlinkOnly={true} price={props.value} />
          </a>
        ),
      };
      const columnQuantity = {
        Header: () => (
          <span>
            <FormattedMessage id="app.order.quantity" />{' '}
            <i className="fa fa-sort" />
          </span>
        ),
        sortMethod: (a, b) => {
          var numberA = Number(a ? accounting.unformat(a) : 0, 10);
          var numberB = Number(b ? accounting.unformat(b) : 0, 10);
          return numberA - numberB;
        },
        accessor: 'Quantity',
        minWidth: 70,
        Cell: props => (
          <HighlightablePrice isBlinkOnly={true} price={props.value} />
        ),
      };
      const columnTotal = {
        Header: () => (
          <span>
            <FormattedMessage id="app.order.total" />{' '}
            <i className="fa fa-sort" />
          </span>
        ),
        sortMethod: (a, b) => {
          var numberA = Number(a ? accounting.unformat(a) : 0, 10);
          var numberB = Number(b ? accounting.unformat(b) : 0, 10);
          return numberA - numberB;
        },
        accessor: 'Total',
        minWidth: 70,
        Cell: props => (
          <HighlightablePrice isBlinkOnly={true} price={props.value} />
        ),
      };
      let buyOrderColumns = [columnTotal, columnQuantity, buyColumnRate];
      if (CHECK_IS_MOBILE()) {
        buyOrderColumns = [buyColumnRate, columnQuantity];
      }

      const sellColumnRate = {
        Header: () => (
          <span>
            <FormattedMessage id="app.exchange.ask_price" />{' '}
            <i className="fa fa-sort" />
          </span>
        ),
        sortMethod: (a, b) => {
          var numberA = Number(a ? accounting.unformat(a) : 0, 10);
          var numberB = Number(b ? accounting.unformat(b) : 0, 10);
          return numberA - numberB;
        },
        accessor: 'Rate',
        minWidth: 70,
        headerClassName: 'rate-col-header',
        className: 'rate-col',
        Cell: props => (
          <a
            onClick={event =>
              this.setSelectedOrderBookPrice(
                props.value,
                EXCHANGE_ORDER_TYPE.SELL,
              )}
          >
            <HighlightablePrice isBlinkOnly={true} price={props.value} />
          </a>
        ),
      };

      let sellOrderColumns = [sellColumnRate, columnQuantity, columnTotal];
      if (CHECK_IS_MOBILE()) {
        sellOrderColumns = [sellColumnRate, columnQuantity];
      }

      buyOrderTableProps.data = buyOrders;
      buyOrderTableProps.columns = buyOrderColumns;
      sellOrderTableProps.data = sellOrders;
      sellOrderTableProps.columns = sellOrderColumns;
    }
    const orderBookColClass = userAuthenticated ? 'col-md-4' : 'col-md-6';

    return (
      <div className="row--content-sell-buy clearfix">
        {CHECK_IS_MOBILE() && (
          <div className="row row--content-sell-buy__column">
            <div className={`col-md-4 col-xs-12 form-sell-buy-auth`}>

              {userAuthenticated && CHECK_IS_MOBILE() && (
                <div className="alert alert-warning text-center uppercase hidden-lg hidden-md">
                  <FormattedMessage
                    id="app.exchange.linktosimpletrademobile"
                    values={{
                      link: (
                        <Link
                          href={`/mua-ban-nhanh/${coin_id}`}
                          className="coin-type"
                        >
                          đây
                        </Link>
                      ),
                    }}
                  />
                </div>
              )}
              {this.renderTradingForms()}
            </div>
          </div>
        )}
        <div className="row row--content-sell-buy__column">
          <div
            className={`${orderBookColClass} col-xs-12 order-book-container buy-orders`}
          >
            <div className="panel panel-default panel-exchange">
              <div className="panel-heading">
                <div className="panel-title clearfix">
                  <span className="caption-subject font-blue bold uppercase pull-left">
                    <i className="icon-layers font-blue" />{' '}
                    <FormattedMessage id="app.orderbook.buylist" />
                  </span>
                  <div
                    className={`orderbook-quantity pull-right ${totalVndAmount
                      ? ''
                      : 'hidden'}`}
                  >
                    <span>{formatNumber(totalVndAmount)} VNĐ</span>
                  </div>
                </div>
              </div>

              <div className="panel-body">
                <ReactBootstrapTable {...buyOrderTableProps} />
              </div>
            </div>
          </div>
          {!CHECK_IS_MOBILE() && (<div className={`col-md-4 col-xs-12 ${!userAuthenticated && 'hidden'}`}>
            {this.renderTradingForms()}
          </div>)}
          <div
            className={`${orderBookColClass} col-xs-12 order-book-container sell-orders`}
          >
            <div className="panel panel-default panel-exchange">
              <div className="panel-heading">
                <div className="panel-title clearfix">
                  <span className="caption-subject font-red bold uppercase pull-left">
                    <i className="icon-layers font-red" />{' '}
                    <FormattedMessage id="app.orderbook.selllist" />
                  </span>
                  <div
                    className={`orderbook-quantity pull-right ${totalCoinQuantity
                      ? ''
                      : 'hidden'}`}
                  >
                    <span>
                      {formatNumber(totalCoinQuantity)}{' '}
                      <span className="uppercase">{coin_id}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="panel-body">
                <ReactBootstrapTable {...sellOrderTableProps} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderTradingForms() {
    const { coin_id, isCreatingWallet, coinInfoById, userAuthenticated } = this.props;
    let currentCoinInfor = {};
    let coinCode = '';
    if (coinInfoById) {
      currentCoinInfor = coinInfoById;
      coinCode = currentCoinInfor.coin;
    }
    return (
      <div
        id="exchange-form-section"
        className="tabbable-custom exchange-form-section"
      >
        <ul className="nav nav-tabs">
          <li className="tab-buy active">
            <a
              href="#tab_buy"
              className="btn bg-blue font-white"
              data-toggle="tab"
            >
              {' '}
              MUA {coinCode}
            </a>
          </li>
          <li className="tab-sell">
            <a
              href="#tab_sell"
              className="btn bg-red font-white"
              data-toggle="tab"
            >
              {' '}
              BÁN {coinCode}
            </a>
          </li>
        </ul>
        <div className="tab-content">
          <div className="tab-pane active" id="tab_buy">
            <div>
              <div className="row">
                <div className="col-md-12">
                  <BuyCoinForm
                    coin_id={coin_id}
                    coin_code={coinCode}
                    userAuthenticated={userAuthenticated}
                    ask_price={currentCoinInfor['ask_price_vnd']}
                    trade_buy_fee={currentCoinInfor['trade_buy_fee']}
                    selectedOrderBookPrice={
                      this.state.selectedSellOrderBookPrice
                    }
                    setSelectedOrderBookPrice={this.setSelectedOrderBookPrice}
                    isCreatingWallet={isCreatingWallet}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="tab-pane" id="tab_sell">
            <div>
              <div className="row">
                <div className="col-md-12">
                  <SellCoinForm
                    coin_id={coin_id}
                    coin_code={coinCode}
                    userAuthenticated={userAuthenticated}
                    bid_price={currentCoinInfor['bid_price_vnd']}
                    trade_sell_fee={currentCoinInfor['trade_sell_fee']}
                    selectedOrderBookPrice={
                      this.state.selectedBuyOrderBookPrice
                    }
                    setSelectedOrderBookPrice={this.setSelectedOrderBookPrice}
                    isCreatingWallet={isCreatingWallet}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  formatPriceWithVndRate(price, vndRate, fee) {
    return price * vndRate + price * vndRate * fee / 100;
  }

  renderChart = () => {
    
    const { coinInfoById } = this.props;
    const coin_code = coinInfoById ? coinInfoById.coin : '';
    const broker_code = coinInfoById ? coinInfoById.broker_code : '';
    const is_direct = coinInfoById ? coinInfoById.is_direct : 0;
    if (coin_code && coin_code != 'USDT' && broker_code != 'BITMOON') {
      return (
        <div className="row chart-container">
          <div className="col-md-12">
            <TradingView coin_code={coin_code} broker_code={broker_code} usdt={is_direct} />
          </div>
        </div>
      );
    }

    return null;

  }

  renderPromotionInfo = promotionList => {
    if (!promotionList) return null;
    promotionList = promotionList.sort((a, b) => {
      const firstAmount = a.from_amount;
      const secondAmount = b.from_amount;
      if (firstAmount < secondAmount) return -1;
      if (firstAmount > secondAmount) return 1;
      return 0;
    });
    return (
      <div className="promotion row">
        {promotionList.map(item => {
          if (item.from_amount && item.value) {
            return (
              <div className="col-md-12 col-md-push-4 promotion-item">
                <FormattedHTMLMessage
                  id="app.exchange.promotion.message"
                  values={{
                    amount: formatNumber(item.from_amount),
                    value: item.value,
                  }}
                />
              </div>
            );
          } else {
            return null;
          }
        })}
      </div>
    );
  };

  onClickTab(event, target) {
    event.preventDefault();
    this.setState(({
      tabActived: target
    }));
  }
  render() {
    const {
      userAuthenticated,
      coin_id,
      coinInfoById,
      secondWallet,
      coinInfoByIdUpToDate
    } = this.props;
    let currentCoinInfor = coinInfoById;
    if (coinInfoByIdUpToDate) {
      currentCoinInfor = coinInfoByIdUpToDate;
    }

    return (
      <div className="container-fuild exchange">
        {secondWallet &&
          !!secondWallet.is_allow_simple_trade && (
            <div className="row">
              <div className="col-md-12">
                {!CHECK_IS_MOBILE() && (
                  <div className="alert alert-warning text-center uppercase hidden-lg hidden-md">
                    <FormattedMessage
                      id="app.exchange.linktosimpletrademobile"
                      values={{
                        link: (
                          <Link
                            href={`/mua-ban-nhanh/${coin_id}`}
                            className="coin-type"
                          >
                            đây
                        </Link>
                        ),
                      }}
                    />
                  </div>
                )}
                <div className="alert alert-warning text-center uppercase hidden-xs hidden-sm">
                  <FormattedMessage
                    id="app.exchange.linktosimpletrade"
                    values={{
                      link: (
                        <Link
                          href={`/mua-ban-nhanh/${coin_id}`}
                          className="coin-type"
                        >
                          đây
                      </Link>
                      ),
                    }}
                  />
                </div>
              </div>
            </div>
          )}

        {CHECK_IS_MOBILE() && (
          <div className="row hidden-md hidden-lg">
            <div className="col-sm-12">
              <ul className="nav nav-tabs nav-tabs--exchange nav-justified">
                <li role="presentation" className={this.state.tabActived === 'chart' && 'active'}><a href="#chart" onClick={(e) => this.onClickTab(e, "chart")} aria-controls="chart" role="tab" data-toggle="tab"><FormattedMessage id="app.exchange.chart.chart" /></a></li>
                <li role="presentation" className={this.state.tabActived === 'trade' && 'active'}><a href="#trade" onClick={(e) => this.onClickTab(e, "trade")} aria-controls="trade" role="tab" data-toggle="tab"><FormattedMessage id="app.exchange.chart.trade" /></a></li>
                <li role="presentation"><a href="#openOrder" onClick={(e) => this.onClickTab(e, "openOrder")} aria-controls="openOrder" role="tab" data-toggle="tab"><FormattedMessage id="app.exchange.chart.openOrder" /></a></li>
              </ul>
            </div>
            <nav className={`sticky-button-buy-sell ${this.state.tabActived === 'trade' && 'hidden'}`}>
              <a className="btn blue sm-btn uppercase" href="#trade" onClick={(e) => this.onClickTab(e, "trade")} aria-controls="trade" role="tab" data-toggle="tab">
                <FormattedMessage id="app.exchange.chart.buysell" />
              </a>
            </nav>
          </div>
        )}
        <BlockUi
          tag="div"
          blocking={this.state.isBlockingChartUI}
          className="blocking-overlay"
          loader={
            <Loader active type="line-scale-pulse-out-rapid" color="#02a17c" />
          }
        >
          <div role="tabpanel" className={`row tab-pane chart-section row--chart-section ${this.state.tabActived === 'chart' && ' is-active'}`} id="chart">
            <div className="col-md-12">
              <div className="portlet light portlet-fit paper-3">
                <div className="portlet-body">
                  {this.renderChart()}
                  <div className="row">
                    <div className="col-md-12">
                      {this.renderPriceTable(currentCoinInfor)}
                    </div>
                  </div>
                  <div className="clearfix" />
                </div>
              </div>
            </div>

            <div className="clearfix" />
          </div>
        </BlockUi>


        <div role="tabpanel" className={`row tab-pane row--list-buy-sell ${this.state.tabActived === 'trade' && ' is-active'}`}>
          <div className="col-md-12">
            {this.renderTradingSection()}
          </div>
        </div>
        <div role="tabpanel" className={`row tab-pane row--list-open-order ${this.state.tabActived === 'openOrder' && ' is-active'}`}>
          {userAuthenticated ? (
            <div className="row order-section exchange trade-history">
              <div className="col-md-9">
                <div className="row">
                  <div className="col-md-12">
                    <OrderOpenForm coin_id={coin_id} />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                    <OrderHistoryForm coin_id={coin_id} />
                  </div>
                </div>
              </div>
              {!CHECK_IS_MOBILE() && (<div className="col-md-3 exchange-sidebar">
                <div className="portlet mt-element-ribbon light portlet-fit bordered paper-3">
                  <div className="portlet-body">
                    <CoinInfoMiniTable socket={this.socket} />
                  </div>
                </div>
              </div>)}
            </div>
          ) : (
              <NotLoggedInForm />
            )}
        </div>
        <ToastNotification />
      </div>
    );
  }
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ coinsInfo, wallet, user, exchange, promotion }) {
  const userAuthenticated = (user && user.authenticated) || null;
  const userData = (user && user.profile) || null;
  const priceList = (coinsInfo && coinsInfo.priceList) || null;
  const coinsList = (coinsInfo && coinsInfo.coinsList) || null;
  const coinInfoById = (coinsInfo && coinsInfo.coinInfoById) || null;
  const promotionList = (promotion && promotion.promotionList) || null;
  const coinInfoByIdUpToDate =
    (coinsInfo && coinsInfo.coinInfoByIdUpToDate) || null;
  const orderBookBuy = (exchange && exchange.orderBookBuy) || null;
  const orderBookSell = (exchange && exchange.orderBookSell) || null;
  const detailForCoin = (wallet && wallet.detail_for_coin) || null;
  const secondWallet =
    detailForCoin && detailForCoin.result && detailForCoin.result[0]
      ? detailForCoin.result[0]
      : null;
  return {
    userAuthenticated,
    user: userData,
    priceList,
    coinsList: coinsList,
    coinInfoById,
    coinInfoByIdUpToDate,
    orderBookBuy,
    orderBookSell,
    secondWallet,
    promotionList,
  };
}

// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        getCoinPriceDetail,
        getCoinsInfoById,
        createWallet,
        getWalletDetail,
        setRuntimeVariable,
        getUserPromotionInfo,
        unsubscribeCoin
      },
      dispatch,
    ),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Exchange);
