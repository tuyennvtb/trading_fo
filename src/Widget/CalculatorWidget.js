/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */
import _ from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import openSocket from 'socket.io-client';
import { bindActionCreators } from 'redux';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import accounting from 'accounting';
import { FormattedMessage, injectIntl } from 'react-intl';
import { openNewWindow, formatPureNumber } from '../Helpers/utils';
import { getCoinsInfo } from '../Redux/actions/coin';
import { SocketIOHost } from '../Core/config';
import { formatNumberWithoutThousandSeparator } from '../Helpers/utils';

const COIN_TO_VND = 'COIN_TO_VND';
const VND_TO_COIN = 'VND_TO_COIN';
class CalculatorWidget extends React.Component {
  constructor(props) {
    super(props);
    this.socket = openSocket(SocketIOHost);
  }
  state = {
    coin_id: '',
    mode: COIN_TO_VND,
    optionCoins: [],
    selectedCoin: {},
    inputNumber: 1,
    redirectedUrl: '',
    inputCoin: 0,
    inputMoney: 0
  }

  componentDidMount() {
    this.init();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.coinsInfo) {
      if (!this.state.optionCoins.length) {
        const { coin_id } = this.props;
        const optionCoins = [];
        let selectedCoin = {};
        let priceCoin = 0;
        nextProps.coinsInfo.forEach(coin => {
          const option = {
            value: coin.coin_id,
            label: `${coin.coin_name} (${coin.coin})`
          };
          optionCoins.push(option);
          if (coin_id == coin.coin_id) {
            selectedCoin = option;
            priceCoin = coin.ask_price_vnd;
          }
        });
        this.setState({
          optionCoins,
          selectedCoin,
          inputCoin: 1,
          inputMoney: this.formatPrice(priceCoin)
        })
      }
    }
  }

  init = async () => {
    const { coin_id, actions } = this.props;
    actions.getCoinsInfo(this.socket);
    const { user_id } = this.props;
    let redirectedUrl = '';
    if (user_id) {
      const domain = `${window.location.protocol}//${window.location.host}`;
      redirectedUrl = `${domain}/register/referer/${user_id}`;
    }
    this.setState({
      coin_id,
      redirectedUrl
    });
  }

  _onChangeListCoin = (option) => {
    if (!_.isEmpty(option)) {
      const { coinsInfo } = this.props;
      let priceCoin = 0;
      for (let i = 0; i < coinsInfo.length; i++) {
        const coin = coinsInfo[i];
        if (option.value == coin.coin_id) {
          priceCoin = coin.ask_price_vnd;
          break;
        }
      }
      this.setState({
        coin_id: option.value,
        selectedCoin: option,
        inputCoin: 1,
        inputMoney: this.formatPrice(priceCoin)
      })
    }
  }

  _onClickExchange = () => {
    const oldMode = this.state.mode;
    this.setState({
      mode: oldMode == COIN_TO_VND ? VND_TO_COIN : COIN_TO_VND
    })
  }

  _onChangeInputCoin = (e) => {
    const { coinsInfo } = this.props;
    const { coin_id } = this.state;
    const value = e.target.value;
    let priceCoin = 0;
    for (let i = 0; i < coinsInfo.length; i++) {
      const coin = coinsInfo[i];
      if (coin_id == coin.coin_id) {
        priceCoin = coin.ask_price_vnd;
        break;
      }
    }

    this.setState({
      inputCoin: value,
      inputMoney: this.calculatorCoinToVND(value, priceCoin)
    })
  }

  _onChangeInputMoney = (e) => {
    const { coinsInfo } = this.props;
    const { coin_id } = this.state;
    let priceCoin = 0;
    for (let i = 0; i < coinsInfo.length; i++) {
      const coin = coinsInfo[i];
      if (coin_id == coin.coin_id) {
        priceCoin = coin.ask_price_vnd;
        break;
      }
    }
    let value = formatPureNumber(e.target.value);
    value = formatNumberWithoutThousandSeparator(value);
    const inputCoin = this.calculatorVNDToCoin(value, priceCoin);
    this.setState({
      inputMoney: this.formatPrice(value),
      inputCoin
    })
  }

  _onClickRefresh = () => {
    const { coin_id, coinsInfo } = this.props;
    const { optionCoins } = this.state;
    let selectedCoin = {};
    for (let i = 0; i < optionCoins.length; i++) {
      const coin = optionCoins[i];
      if (coin_id == coin.value) {
        selectedCoin = coin;
        break;
      }
    }

    let priceCoin = 0;
    for (let i = 0; i < coinsInfo.length; i++) {
      const coin = coinsInfo[i];
      if (coin_id == coin.coin_id) {
        priceCoin = coin.ask_price_vnd;
        break;
      }
    }

    this.setState({
      coin_id: coin_id,
      selectedCoin,
      inputCoin: 1,
      inputMoney: this.formatPrice(priceCoin)
    });
  }

  _onClickBuySell = () => {
    const { redirectedUrl, coin_id } = this.state;
    if (redirectedUrl) {
      openNewWindow(redirectedUrl);
    } else {
      const domain = `${window.location.protocol}//${window.location.host}`;
      const url = `${domain}/mua-ban/${coin_id}`;
      openNewWindow(url);
    }
  }

  renderListCoin = () => {
    return (
      <div>
        <div className="col-xs-6 p-0">
          <input className="form-control input-left" onChange={this._onChangeInputCoin} type="text" value={this.state.inputCoin} />
        </div>
        <div className="col-xs-6 p-0">
          <Select
            className="react-select"
            name="DropdownCoin"
            options={this.state.optionCoins}
            onChange={this._onChangeListCoin}
            value={this.state.selectedCoin}
            isClearable={false}
          />
        </div>
      </div>
    );
  }

  renderListPrice = () => {
    return (
      <div>
        <div className="col-xs-6 p-0">
          <input className="form-control input-left"
            onChange={this._onChangeInputMoney}
            type="text" value={this.state.inputMoney} />
        </div>
        <div className="col-xs-6 p-0">
          <input className="form-control" type="text" readOnly value="VND" />
        </div>
      </div>
    );
  }

  getLeftPart = () => {
    if (this.state.mode == COIN_TO_VND) {
      return this.renderListCoin();
    } else {
      return this.renderListPrice();
    }
  }

  getRightPart = () => {
    if (this.state.mode == COIN_TO_VND) {
      return this.renderListPrice();
    } else {
      return this.renderListCoin();
    }
  }

  formatPrice = (price) => {
    let p = Number(price);
    let fixedNumber = p - Math.floor(price) > 0 ? 4 : 0;
    return accounting.formatMoney(p, '', fixedNumber, ',', '.');
  }

  calculatorCoinToVND = (coin, price) => {
    const total = coin * price;
    return this.formatPrice(total);
  }

  calculatorVNDToCoin = (vnd, price) => {
    return vnd / price;
  }

  render() {

    return (
      <div className="widget bg-white">
        <div className="col-xs-12">
          <div className="text-center">
            <h4>
              <FormattedMessage id="widget.calculator.title" />
            </h4>
          </div>
          <div className="col-xs-12 mt-30 calculator-widget">

            <div className="row mt-10">
              <div className="col-xs-12 col-md-5 mt-10">
                {this.getLeftPart()}
              </div>
              <div className="hidden-xs hidden-sm col-md-2 center mt-10">
                <button onClick={this._onClickExchange} className="btn" type="button">
                  <i className="fa fa-exchange" aria-hidden="true"></i>
                </button>
              </div>
              <div className="col-xs-12 col-md-5 mt-10">
                {this.getRightPart()}
              </div>
            </div>

            <div className="row mt-30">
              <div className="col-xs-6">
                <div className="right">
                  <button className="btn bg-blue font-white btn-block" onClick={this._onClickRefresh} type="button">
                    <FormattedMessage id="widget.calculator.btn.refresh" />
                  </button>
                </div>
              </div>
              <div className="col-xs-6">
                <div className="left">
                  <button onClick={this._onClickBuySell} className="btn bg-primary" type="button">
                    <FormattedMessage id="widget.calculator.btn.buysell" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps({ coinsInfo }) {
  const coins = (coinsInfo && coinsInfo.coinsList) || null;
  return {
    coinsInfo: coins
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        getCoinsInfo
      },
      dispatch
    ),
  };
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(CalculatorWidget));
