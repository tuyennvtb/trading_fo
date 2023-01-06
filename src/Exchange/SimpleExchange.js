import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import openSocket from 'socket.io-client';
import PropTypes from 'prop-types';
import { SocketIOHost } from '../Core/config';
import { toast } from 'react-toastify';
import { FormattedMessage } from 'react-intl';
import ToastNotification from '../Processing/ToastNotification.js';
import { getCoinsInfoById, unsubscribeCoin } from '../Redux/actions/coin';
import { createWallet, getWalletDetail } from '../Redux/actions/wallet';
import { ERRORS, GLOBAL_VARIABLES } from '../Helpers/constants/system';
import history from '../history';
import { redirect } from '../Core/config';
import { getJsonFromUrl } from '../Helpers/utils';
import Buy from './tab/Buy';
import Sell from './tab/Sell';
import '../assets/css/pages/exchange.css';

class SimpleExchange extends React.Component {
  static propTypes = {
    coin_id: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      isCreatingWallet: false,
      tab: 'buy'
    };
    this.socket = openSocket(SocketIOHost);
  }

  async componentDidMount() {
    await this.setupPage();
    this._setTab();

    const { coinInfoById, coin_id } = this.props;
    if (coinInfoById) {
      let currentCoinInfo = coinInfoById;
      if (!!currentCoinInfo.normal && !!!currentCoinInfo.fast) {
        history.push(`${redirect.exchange}/${coin_id}`);
      } else if (!!!currentCoinInfo.normal && !!!currentCoinInfo.fast) {
        history.push(redirect.exchange);
      }
    } else {
      history.push(redirect.exchange);
    }
  }

  async componentDidUpdate(prevProps) {
    const { actions, coin_id } = this.props;
    if (prevProps.coin_id !== coin_id) {
      await actions.unsubscribeCoin(this.socket, prevProps.coin_id);
      this.resetPage();
      this.setupPage();
    }
  }

  async componentWillUnmount() {
    const { actions, coin_id } = this.props;
    await actions.unsubscribeCoin(this.socket, coin_id);
    this.socket.close();
  }

  _setTab = () => {
    const query = getJsonFromUrl();
    if (query.tab) {
      this.setState({
        tab: query.tab === 'sell' ? 'sell' : 'buy'
      });
    }
  }

  _onChangeTab = (tab) => {
    if (this.state.tab != tab) {
      this.setState({
        tab
      });
      const { coin_id } = this.props;
      history.push(`${redirect.simple_exchange}/${coin_id}?tab=${tab}`);
      this.resetPage();
      this.setupPage();
    }
  }

  setupPage = async () => {
    const { actions, userAuthenticated, coin_id } = this.props;
    await actions.getCoinsInfoById(this.socket, coin_id, true);
    if (userAuthenticated) {
      const err1 = await actions.getWalletDetail(
        GLOBAL_VARIABLES.BASE_CURRENCY,
        true,
        'BUY',
        this.socket,
      );
      const err2 = await actions.getWalletDetail(
        coin_id,
        true,
        'SELL',
        this.socket,
      );
      if (err1 === ERRORS.NO_WALLET || err2 === ERRORS.NO_WALLET) {
        this.createUserWallet();
      }
    }
  };

  resetPage = async () => {
    this.socket.close();
    this.socket = openSocket(SocketIOHost);
    this.setState({
      isCreatingWallet: false,
    });
    toast.dismiss(this.toastCreateWalletID);
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

  render() {
    const { coin_id, coinInfoById, coinInfoByIdUpToDate } = this.props;
    var currentCoinInfo = {};
    if (coinInfoById) {
      currentCoinInfo = coinInfoById;
    }

    if (coinInfoByIdUpToDate) {
      currentCoinInfo = coinInfoByIdUpToDate;
    }
    const tabActive = this.state.tab;
    return (
      <React.Fragment>
        <div id="order-trade">
          {currentCoinInfo &&
            !!currentCoinInfo.normal && (
              <p className="alert alert-warning text-center uppercase">
                <FormattedMessage
                  id="app.exchange.linktonormaltrade"
                  values={{
                    link: (
                      <a
                        href={`/mua-ban/${coin_id}`}
                        className="coin-type"
                        target="_blank">
                        <FormattedMessage id="app.exchange.simple.here" />
                      </a>
                    ),
                  }}
                />
              </p>
            )}
          <div className="order-nav">
            <a className={tabActive === 'buy' ? 'item active item-buy' : 'item item-buy'} onClick={() => this._onChangeTab('buy')}>
              <FormattedMessage id="app.exchange.simple.buy" />
            </a>
            <a className={tabActive === 'sell' ? 'item text-red active item-sell' : 'item text-red item-sell'} onClick={() => this._onChangeTab('sell')}>
              <FormattedMessage id="app.exchange.simple.sell" />
            </a>
          </div>

          {tabActive === 'buy' &&
            <Buy
              coin_id={coin_id}
              currentCoinInfo={currentCoinInfo}
              setupPage={this.setupPage}
            />
          }

          {tabActive === 'sell' &&
            <Sell
              coin_id={coin_id}
              currentCoinInfo={currentCoinInfo}
              setupPage={this.setupPage}
            />
          }
        </div>
        <ToastNotification />
      </React.Fragment>
    );
  }
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ coinsInfo, wallet, user, exchange, promotion }) {
  const userAuthenticated = (user && user.authenticated) || null;
  const userData = (user && user.profile) || null;
  const coinInfoById = (coinsInfo && coinsInfo.coinInfoById) || null;
  const coinInfoByIdUpToDate =
    (coinsInfo && coinsInfo.coinInfoByIdUpToDate) || null;
  return {
    userAuthenticated,
    user: userData,
    coinInfoById,
    coinInfoByIdUpToDate,
  };
}

// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        getCoinsInfoById,
        createWallet,
        getWalletDetail,
        unsubscribeCoin
      },
      dispatch,
    ),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SimpleExchange);
