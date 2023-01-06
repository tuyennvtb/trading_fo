import { Cookies } from 'react-cookie';
import { setRuntimeVariable } from './runtime';
import { default as fetch } from '../../Core/fetch/graph.fetch';
import { getOrderBook } from './exchange';

/* eslint-disable import/prefer-default-export, new-cap */
import {
  GET_COINSINFO_START,
  GET_COINSINFO_SUCCESS,
  GET_COINSINFO_FAIL,
  GET_COINSINFO_BY_ID_START,
  GET_COINSINFO_BY_ID_SUCCESS,
  GET_COINSINFO_BY_ID_FAIL,
  GET_PRICE_DETAIL_START,
  GET_PRICE_DETAIL_SUCCESS,
  GET_PRICE_DETAIL_FAIL,
  UPDATE_START,
  UPDATE_SUCCESS,
  UPDATE_FAIL,
  COIN_DETAIL_UPDATE_START,
  COIN_DETAIL_UPDATE_SUCCESS,
  COIN_DETAIL_UPDATE_FAIL,
} from '../constants';

const cookies = new Cookies();

fetch.use(({ request, options }, next) => {
  if (!options.headers) {
    options.headers = {}; // Create the headers object if needed.
  }
  options.headers['Authorization'] = `Bearer ${cookies.get('uid_btm_token')}`;

  next();
});
export const getCoinsInfo = socket => async (dispatch, getState) => {
  dispatch({
    type: GET_COINSINFO_START,
  });
  let err = '';
  const query = `
    query getPriceBook {
      apiPricebook {
        coin_id,
        coin_name,
        fast_bid_price,
        bid_price_vnd,
        ask_price_vnd,
        fast_ask_price,
        fast,
        normal,
        change_24h,
        volume,
        coin
      }
    }
  `;
  try {
    // call webservice
    var result = await fetch({ query })
      .then(data => {
        return data.data.apiPricebook;
      })
      .catch(err => {
        throw new Error(err.message);
      });
    if (result && result.length > 0) {
      dispatch({
        type: GET_COINSINFO_SUCCESS,
        data: result,
      });
      if (socket) {
        dispatch({
          type: UPDATE_START,
        });

        socket.on('message', data => {
          if (data.area === 'coin_price' && data.type === 'list_coin') {
            dispatch({
              type: GET_COINSINFO_SUCCESS,
              data: data.data
            });
          }
        });

        socket.on('connect_error', error => {
          socket.close();
          dispatch({
            type: UPDATE_FAIL,
          });
          console.log(`Error connect is close. Error ${error}`);
        });
      }
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: GET_COINSINFO_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_COINSINFO_FAIL,
    });
    err = error.message;
  }
  return err;
};

export const updateCoinInfoData = () => dispatch => {
  dispatch({
    type: UPDATE_START,
  });
  var coinInfoData = JSON.parse(localStorage.getItem('coinInfoData'));
  if (coinInfoData) {
    dispatch({
      type: UPDATE_SUCCESS,
      data: coinInfoData,
    });
  } else {
    dispatch({
      type: UPDATE_FAIL,
    });
  }
};

export const getCoinsInfoById = (
  socket,
  coin_id,
  isCombinedWithOrderBook = false,
) => async (dispatch, getState) => {
  dispatch({
    type: GET_COINSINFO_BY_ID_START,
  });
  let err = '';
  const query = `
    query getPriceBook ($coin_id: String) {
      apiPricebook (coin_id: $coin_id){
        coin_id,
        bid_price_vnd,
        fast_bid_price,
        fast_ask_price,
        ask_price_vnd,
        fast,
        normal,
        is_direct,
        broker_code,
        change_24h,
        volume,
        coin,
        trade_buy_fee,
        trade_sell_fee
      }
    }
  `;

  let variables = { coin_id };
  try {
    // call webservice
    const result = await fetch({ query, variables })
      .then(data => {
        return data.data.apiPricebook;
      })
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result && result.length) {
      let currentCoin = result[0];
      dispatch({
        type: GET_COINSINFO_BY_ID_SUCCESS,
        data: currentCoin,
      });
      const coinCode = currentCoin.coin;

      dispatch(
        getCoinPriceDetail(
          coinCode,
          'thirtyMin',
          currentCoin.is_direct,
          currentCoin.broker_code,
        ),
      );

      if (isCombinedWithOrderBook) {
        dispatch(getOrderBook(coin_id, socket));
      }

      dispatch({
        type: COIN_DETAIL_UPDATE_START,
      });

      socket.emit('subscribe', `coin_price_${coin_id}`);
      socket.on('message', data => {
        if (
          data.area === 'coin_price' &&
          data.type === 'single_coin'
        ) {
          let dataToUpdate = data.data;
          let coin_id = dataToUpdate && dataToUpdate.coin_id.toString();
          if (coin_id &&
            currentCoin.coin_id === coin_id) {
            dataToUpdate.trade_buy_fee = currentCoin.trade_buy_fee;
            dataToUpdate.trade_sell_fee = currentCoin.trade_sell_fee;
            currentCoin = dataToUpdate;
            dispatch({
              type: COIN_DETAIL_UPDATE_SUCCESS,
              data: currentCoin
            });
          }
        }
      });

      socket.on('connect_error', error => {
        socket.close();
        dispatch({
          type: COIN_DETAIL_UPDATE_FAIL,
        });
        console.log(`Error connect is close. Error ${error}`);
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: GET_COINSINFO_BY_ID_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_COINSINFO_BY_ID_FAIL,
    });
    err = error.message;
  }
  return err;
};

export const getCoinPriceDetail = (
  coin_code,
  interval,
  is_direct,
  broker_code,
) => async dispatch => {
  dispatch({
    type: GET_PRICE_DETAIL_START,
  });
  let err = '';
  const query = `
    query getChartFromBittrex ($coin_code: String!, $interval: String!, $baseCurrency: String!, $broker_code: String!){
      apiChartFromBittrex(coin_code: $coin_code, interval: $interval, baseCurrency: $baseCurrency, broker_code: $broker_code) {
        success,
        message,
        result {
          O,
          H,
          L,
          C,
          V,
          T
        },
        btcVndPrice
      }
    }
  `;
  const variables = {
    coin_code: coin_code,
    interval: interval || 'thirtyMin',
    baseCurrency: !!is_direct ? 'usdt' : 'btc',
    broker_code: broker_code,
  };
  try {
    const res = await fetch({ query, variables })
      .then(data => {
        return data.data.apiChartFromBittrex;
      })
      .catch(err => {
        throw new Error(err.message);
      });
    if (res && res.success) {
      dispatch({
        type: GET_PRICE_DETAIL_SUCCESS,
        data: {
          chartData: res.result,
          btcVndPrice: res.btcVndPrice,
        },
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: GET_PRICE_DETAIL_FAIL,
      });
    }
  } catch (error) {
    console.log(error);
    dispatch({
      type: GET_PRICE_DETAIL_FAIL,
    });
    err = error.message;
  } finally {
    dispatch(
      setRuntimeVariable({
        name: 'loading',
        value: false,
      }),
    );
  }
  return err;
};

export const unsubscribeCoin = (socket, coin_id) => async dispatch => {
  await socket.emit('unsubscribe', `coin_price_${coin_id}`);
};
