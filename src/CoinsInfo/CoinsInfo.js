/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { getCoinsInfo } from '../Redux/actions/coin';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import accounting from 'accounting';
import { openNewWindow } from '../Helpers/utils';
import { connect } from 'react-redux';
import Link from '../Link';
import HighlightablePrice from '../Processing/HighlightablePrice.js';
import { FormattedMessage, injectIntl } from 'react-intl';
import openSocket from 'socket.io-client';
import { SocketIOHost } from '../Core/config';
import { GLOBAL_VARIABLES, CHECK_IS_MOBILE } from '../Helpers/constants/system';
import history from '../history';
import ExchangeOptionDialog from '../Exchange/ExchangeOptionDialog';

class CoinsInfo extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      getCoinsInfo: PropTypes.func.isRequired,
    }).isRequired,
    detectArea: PropTypes.string.isRequired,
  };

  static defaultProps = {
    detectArea: 'exchange',
  };

  constructor(props) {
    super(props);
    this.state = {
      coinInfoUpdate: [],
      isShowExchangeOptions: false,
      selectedCoinId: '',
      countPerPage: 10,
      totalCoint: 0,
      loaded: false
    };
    this.priceFormatter = this.priceFormatter.bind(this);
    this.coinFormatter = this.coinFormatter.bind(this);
    this.rateFormatter = this.rateFormatter.bind(this);
    this.linkFormatter = this.linkFormatter.bind(this);
    this.simpleTradingLinkFormatter = this.simpleTradingLinkFormatter.bind(
      this,
    );
    this.handleClickLoadMore = this.handleClickLoadMore.bind(this);
    this.socket = openSocket(SocketIOHost);
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.getCoinsInfo(this.socket);
    this.scrollListener = window.addEventListener("scroll", e => {
      (CHECK_IS_MOBILE() && this.props.coinsInfo != null) && this.handleScroll(e);
    });
  }

  componentWillUnmount() {
    this.socket.close();
    if (window.removeEventListener) {
      window.removeEventListener("scroll", this.scrollListener);
    } else if (window.detachEvent) {
      window.detachEvent("scroll", this.scrollListener);
    }
  }

  onCompletion = () => {
    this.setState({
      isShowExchangeOptions: false,
    });
    history.push(`/mua-ban/${this.state.selectedCoinId}`);
  };

  handleExchangeButtonPressed = (row, isWidget, redirectedUrl) => {
    if (isWidget) {
      if (redirectedUrl) {
        openNewWindow(redirectedUrl);
      }
    } else {
      if (!!row.fast && !!row.normal) {
        this.setState({
          isShowExchangeOptions: true,
          selectedCoinId: row.coin_id,
        });
      } else if (!!row.fast) {
        history.push(`/mua-ban-nhanh/${row.coin_id}`);
      } else {
        history.push(`/mua-ban/${row.coin_id}`);
      }
    }
  };

  closeExchangeOptionDialog = isShow => {
    this.setState({
      isShowExchangeOptions: isShow,
    });
  };

  coinFormatter(cell, row) {
    const { isWidget, redirectedUrl } = this.props;
    return (
      <button
        className="btn bg-primary label"
        onClick={() =>
          this.handleExchangeButtonPressed(row, isWidget, redirectedUrl)}
      >
        <span className="coin-svg">
          <i className={`cf cf-${row.coin.toLowerCase()}`}></i>
        </span>
        <span className="coin-name">{`${row.coin_name} - `}</span>
        <span className="coin-code">{`${row.coin}`}</span>
      </button>
    );
  }

  linkFormatter(cell, row) {
    const { isWidget, redirectedUrl } = this.props;
    return (
      <button
        onClick={() =>
          this.handleExchangeButtonPressed(row, isWidget, redirectedUrl)}
        className="btn btn-outline btn-circle yellow"
      >
        <i className="fa fa-exchange" />{' '}
        <FormattedMessage id="app.home.coinsinfo.exchange.title" />
      </button>
    );
  }

  simpleTradingLinkFormatter(cell, row) {
    let link = null;
    if (!!row.fast) {
      link = (
        <Link
          href={`/mua-ban-nhanh/${row.coin_id}`}
          className="btn btn-outline btn-circle red wallet-button"
        >
          <i className="fa fa-exchange" />{' '}
          <FormattedMessage id="app.coin.wallet.simpleexchange.name" />
        </Link>
      );
    }
    return link;
  }

  rateFormatter(cell, row) {
    return (
      <span
        className={`label exchange-type ${cell < 0
          ? 'label-danger'
          : 'label-success'}`}
      >
        {cell < 0 ? (
          <span>
            <i className="fa fa-arrow-down" /> {cell}
          </span>
        ) : (
            <span>
              <i className="fa fa-arrow-up" /> {cell}
            </span>
          )}
      </span>
    );
  }

  priceFormatter(cell, row) {
    let p = Number(cell);
    let fixedNumber = p - Math.floor(cell) > 0 ? 4 : 0;
    return accounting.formatMoney(p, '', fixedNumber, ',', '.');
  }

  percentFormatter(cell, row) {
    return `${cell}%`;
  }

  highlightablePrice = (cell, row) => {
    cell = this.priceFormatter(cell);
    return <HighlightablePrice price={cell} />;
  };

  handleScroll = () => {
    var lastRow = document.querySelector("div.react-bs-container-body tbody tr:last-child");
    var buttonLoadMore = document.querySelector("#button-loadmore");
    if (lastRow && buttonLoadMore) {
      var lastRowOffset = lastRow.offsetTop + lastRow.clientHeight;
      var pageOffset = window.pageYOffset + window.innerHeight;
      if (pageOffset > lastRowOffset) {
        buttonLoadMore.click();
      }
    }
  };

  handleClickLoadMore(changeSizePerPage) {
    var featurePerPage = this.state.countPerPage;
    this.setState((state, props) => ({
      countPerPage: props.coinsInfo.length <= featurePerPage ? props.coinsInfo.length : (state.countPerPage + 50),
      loaded: props.coinsInfo.length <= featurePerPage ? true : false
    }));
    changeSizePerPage(this.state.countPerPage);
  }

  renderPaginationPanel = props => {
    return (
      <div className='content-button-loadmore'>
        {
          <button
            key={0}
            id="button-loadmore"
            type='button'
            className={`load-wrapp ${this.state.loaded && 'hidden'}`}
            onClick={() => this.handleClickLoadMore(props.changeSizePerPage)}
          >
            <div className="spinner-loadmore">
              <div className="bubble-1"></div>
              <div className="bubble-2"></div>
              <div className="bubble-3"></div>
            </div>
          </button>
        }
      </div>
    );
  }

  render() {
    const {
      coinsInfo,
      detectArea,
      intl,
      sizePerPage,
    } = this.props;
    let options = {
      clearSearch: true,
      searchPosition: 'right',
      hideSizePerPage: true,
      sortName: "volume_usd_24h",
      sortOrder: "desc",
      sizePerPage: sizePerPage || 10
    };

    var optionMobile = {
      sizePerPage: this.state.countPerPage,
      paginationPanel: this.renderPaginationPanel
    };

    if (CHECK_IS_MOBILE()) {
      options = { ...options, ...optionMobile }
    }

    var coinInfoTableData = coinsInfo;
    return (
      <div
        className={
          detectArea && detectArea !== 'home' ? (
            `cointainer price-table ${detectArea}`
          ) : (
              `cointainer ${detectArea}`
            )
        }
      >
        <div className="row">
          {detectArea &&
            detectArea !== 'home' &&
            detectArea !== 'feature-coins' ? (
              <div className="portlet mt-element-ribbon light portlet-fit paper-3">
                <div className="ribbon ribbon-left ribbon-vertical-left ribbon-shadow ribbon-border-dash-vert ribbon-color-primary uppercase">
                  <div className="ribbon-sub ribbon-bookmark" />
                  <i className="icon-support" />
                </div>
                <div className="portlet-title">
                  <div className="caption">
                    <span
                      className="caption-subject bold uppercase"
                      style={{ color: '#c27d0e', paddingLeft: '10px' }}
                    >
                      <FormattedMessage id="app.exchange.title" />
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              ''
            )}
        </div>
        <BootstrapTable
          data={coinInfoTableData}
          hover
          condensed
          bordered={false}
          multiColumnSort={3}
          options={options}
          pagination
          search
          searchPlaceholder={intl.formatHTMLMessage({
            id: 'app.global.searchcoinstotrade',
          })}
          headerStyle={{ textAlign: 'center' }}
        >
          <TableHeaderColumn
            dataFormat={this.coinFormatter}
            dataField="coin_name"
            dataAlign="center"
            dataSort
            className="coin-name-col-header"
            columnClassName="coin-name-col"
          >
            <FormattedMessage id="app.home.coinsinfo.table.coin.title" />
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="coin"
            hidden
            dataAlign="center"
            dataSort
          >
            <FormattedMessage id="app.home.coinsinfo.table.coin.title" />
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="bid_price_vnd"
            dataFormat={this.highlightablePrice}
            dataSort
            dataAlign="center"
            className="bid-price-col-header"
            columnClassName="bid-price-col"
          >
            <FormattedMessage id="app.exchange.bid_price" />
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="ask_price_vnd"
            dataAlign="center"
            dataFormat={this.highlightablePrice}
            dataSort
            className="ask-price-col-header"
            columnClassName="ask-price-col"
          >
            <FormattedMessage id="app.exchange.ask_price" />
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="volume_usd_24h"
            dataFormat={this.priceFormatter}
            dataAlign="center"
            dataSort
            hidden
            columnClassName="volume-col"
            className="volume-col-header"
          >
            <FormattedMessage id="app.home.coinsinfo.table.availablesupply.title" />
          </TableHeaderColumn>
          <TableHeaderColumn
            dataField="percent_change_24h"
            dataFormat={this.rateFormatter}
            dataAlign="center"
            dataSort
            hidden
            columnClassName="change24-col"
            className="change24-col-header"
          >
            % (24h)
          </TableHeaderColumn>
          <TableHeaderColumn
            isKey
            dataField="coin_id"
            dataFormat={this.linkFormatter}
            dataAlign="right"
            hidden
            columnClassName="action-button-col"
            className="action-button-col-header"
          />
        </BootstrapTable>
        <ExchangeOptionDialog
          isShowExchangeOptions={this.state.isShowExchangeOptions}
          selectedCoinId={this.state.selectedCoinId}
          closeExchangeOptionDialog={this.closeExchangeOptionDialog}
          onCompletion={this.onCompletion}
        />
      </div>
    );
  }
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ coinsInfo }) {
  const coins = (coinsInfo && coinsInfo.coinsList) || null;
  return {
    coinsInfo: coins
  };
}

// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ getCoinsInfo }, dispatch),
  };
}
export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(CoinsInfo),
);
