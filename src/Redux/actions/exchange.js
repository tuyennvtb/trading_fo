import React from 'react';
import { FormattedMessage } from 'react-intl';
import { ERRORS } from '../../Helpers/constants/system';
import { setRuntimeVariable } from './runtime';
import { Cookies } from 'react-cookie';
import { default as fetch } from '../../Core/fetch/graph.fetch';
import moment from 'moment';
import {
  EXCHANGE_ORDER_STATUS,
  EXCHANGE_ORDER_TYPE,
  TOAST_TYPE,
} from '../../Helpers/constants/system';
/* eslint-disable import/prefer-default-export, new-cap */
import {
  BUY_START,
  BUY_SUCCESS,
  BUY_FAIL,
  SELL_START,
  SELL_SUCCESS,
  SELL_FAIL,
  CANCEL_START,
  CANCEL_SUCCESS,
  CANCEL_FAIL,
  GET_ORDER_HISTORY_START,
  GET_ORDER_HISTORY_FAIL,
  GET_ORDER_HISTORY_SUCCESS,
  GET_ORDER_HISTORY_FOR_ALL_COINS_START,
  GET_ORDER_HISTORY_FOR_ALL_COINS_FAIL,
  GET_ORDER_HISTORY_FOR_ALL_COINS_SUCCESS,
  GET_ORDER_OPENING_START,
  GET_ORDER_OPENING_SUCCESS,
  GET_ORDER_OPENING_FAIL,
  GET_ORDER_OPENING_FOR_ALL_COINS_START,
  GET_ORDER_OPENING_FOR_ALL_COINS_SUCCESS,
  GET_ORDER_OPENING_FOR_ALL_COINS_FAIL,
  GET_ORDER_BOOK_BUY_START,
  GET_ORDER_BOOK_BUY_SUCCESS,
  GET_ORDER_BOOK_BUY_FAIL,
  GET_ORDER_BOOK_SELL_START,
  GET_ORDER_BOOK_SELL_SUCCESS,
  GET_ORDER_BOOK_SELL_FAIL,
  SIMPLE_BUY_COIN_START,
  SIMPLE_BUY_COIN_SUCCESS,
  SIMPLE_BUY_COIN_FAIL,
  SIMPLE_SELL_COIN_START,
  SIMPLE_SELL_COIN_SUCCESS,
  SIMPLE_SELL_COIN_FAIL,
  GET_ALL_TRADING_INFO_START,
  GET_ALL_TRADING_INFO_SUCCESS,
  GET_ALL_TRADING_INFO_ERROR,
  FB_SHARING_TRANSACTION,
  FB_SHARING_TRANSACTION_SUCCESS,
  FB_SHARING_TRANSACTION_FAIL,
} from '../constants';

const cookies = new Cookies();

fetch.use(({ request, options }, next) => {
  if (!options.headers) {
    options.headers = {}; // Create the headers object if needed.
  }
  options.headers['Authorization'] = `Bearer ${cookies.get('uid_btm_token')}`;

  next();
});

export const buyCoin = data => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: BUY_START,
  });
  let err = '';
  try {
    const query = `query buyCoin ($action: String!, $coin_id: String!, $amount: Float, $base_currency: String!, $price: Float!, $totalPrice: Float){
      apiCreateExchange (action: $action, coin_id: $coin_id, amount: $amount, base_currency: $base_currency, price: $price, totalPrice: $totalPrice) {
        success,
        data {
        	transaction_id
        },
        request_id,
        error_code,
        description
	  }
	}`;

    const variables = {
      action: 'BUY',
      coin_id: data.coin_id,
      amount: data.amount,
      base_currency: 'VND',
      price: data.price,
      totalPrice: data.totalPrice || 0,
    };

    let result = await fetch({
      query,
      variables,
    })
      .then(res => {
        return res;
      })
      .catch(err => {
        throw new Error(err.message);
      });
    // dispatch result
    if (result && result.error && !result.error.status) {
      switch (result.error.reason) {
        case ERRORS.USER_BLOCKED:
          err = <FormattedMessage id="error.account.user-block" />;
          break;
        case ERRORS.WRONG_GOOGLE_AUTH:
          err = <FormattedMessage id="error.account.wrong_gg2fa_code" />;
          break;
        default:
          err = result.error.reason;
      }
    } else if (result && result.errors && result.errors.length) {
      const error = result.errors[0];
      const msg = JSON.parse(error.message);
      switch (msg.name) {
        case 'TimeoutError':
          err = <FormattedMessage id="error.exchange.fail_order" />;
          break;
        default:
          break;
      }
    } else {
      result = result && result.data ? result.data : result;
      if (
        result &&
        result.apiCreateExchange &&
        result.apiCreateExchange.success
      ) {
        dispatch({
          type: BUY_SUCCESS,
          data: result.apiCreateExchange,
        });
      } else {
        dispatch({
          type: BUY_FAIL,
        });
        err = `Description: ${result.apiCreateExchange.description}`;
      }
    }
  } catch (error) {
    dispatch({
      type: BUY_FAIL,
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

export const sellCoin = data => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: SELL_START,
  });
  let err = '';
  try {
    const query = `query sellCoin ($action: String!, $coin_id: String!, $amount: Float, $base_currency: String!, $price: Float!, $totalPrice: Float){
      apiCreateExchange (action: $action, coin_id: $coin_id, amount: $amount, base_currency: $base_currency, price: $price, totalPrice: $totalPrice) {
        success,
        data {
        	transaction_id
        },
        request_id,
        error_code,
        description
	  }
	}`;

    const variables = {
      action: 'SELL',
      coin_id: data.coin_id,
      amount: data.amount,
      base_currency: 'VND',
      price: data.price,
      totalPrice: data.totalPrice || 0,
    };

    let result = await fetch({
      query,
      variables,
    })
      .then(res => {
        return res;
      })
      .catch(err => {
        throw new Error(err.message);
      });
    // dispatch result
    if (result && result.error && !result.error.status) {
      switch (result.error.reason) {
        case ERRORS.USER_BLOCKED:
          err = <FormattedMessage id="error.account.user-block" />;
          break;
        case ERRORS.WRONG_GOOGLE_AUTH:
          err = <FormattedMessage id="error.account.wrong_gg2fa_code" />;
          break;
        default:
          err = result.error.reason;
      }
    } else if (result && result.errors && result.errors.length) {
      const error = result.errors[0];
      const msg = JSON.parse(error.message);
      switch (msg.name) {
        case 'TimeoutError':
          err = <FormattedMessage id="error.exchange.fail_order" />;
          break;
        default:
          break;
      }
    } else {
      result = result && result.data ? result.data : result;
      if (
        result &&
        result.apiCreateExchange &&
        result.apiCreateExchange.success
      ) {
        dispatch({
          type: SELL_SUCCESS,
          data: result.apiCreateExchange,
        });
      } else {
        dispatch({
          type: SELL_FAIL,
        });
        err = `Description: ${result.apiCreateExchange.description}`;
      }
    }
  } catch (error) {
    dispatch({
      type: SELL_FAIL,
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

export const getOrderHistory = (coin_id, socket) => async (
  dispatch,
  getState,
) => {
  dispatch({
    type: GET_ORDER_HISTORY_START,
  });
  let err = '';
  const query = `
    query getOrdersHistory($coin_id: String!) {
      apiOrdersHistory(coin_id: $coin_id) {
        data {
          id
          unique_id
          coin_id
          created_at
          type
          price
          quantity
          estimate_total_vnd,
          actual_price
          actual_filled
          actual_total_amount
          status
          trade_vnd_price
          trade_fee_percent
          trade_fee_reserved
          trade_fee_final
          total_reserved_amount
          cost_amount_after_fee
        }
      }
    }
  `;
  const variables = {
    coin_id: coin_id || '',
  };
  try {
    // call webservice
    const result = await fetch({ query, variables })
      .then(res => res.data)
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result && result.apiOrdersHistory && result.apiOrdersHistory.data) {
      dispatch({
        type: GET_ORDER_HISTORY_SUCCESS,
        data: result.apiOrdersHistory.data,
      });

      let room = `transaction_${coin_id}`;
      var tradeBuyRoom = `tradebuy_${coin_id}`;
      var tradeSellRoom = `tradesell_${coin_id}`;
      socket.emit('subscribe', room);
      socket.emit('subscribe', tradeBuyRoom);
      socket.emit('subscribe', tradeSellRoom);

      var currentOrderConfirmed = [...getState().exchange.orderConfirmed];
      currentOrderConfirmed = currentOrderConfirmed
        ? currentOrderConfirmed
        : [];

      socket.on('message', async data => {
        if (
          data.area === 'transaction' ||
          data.area === 'tradebuy' ||
          data.area === 'tradesell'
        ) {
          let notifiedOrder = data.data;
          const user = getState().user;
          if (
            user &&
            user.profile &&
            parseInt(user.profile.id, 10) === notifiedOrder.user_id
          ) {
            let matchOrderIndex = currentOrderConfirmed.findIndex(
              order => order.unique_id === notifiedOrder.unique_id,
            );
            let dataAdd = {};
            if (
              (notifiedOrder && notifiedOrder.status === 'CANCELED') ||
              notifiedOrder.status === 'CLOSED'
            ) {
              dataAdd.created_at = moment(notifiedOrder.created_at).format(
                'YYYY-MM-DD HH:mm:ss',
              );
              dataAdd.id = notifiedOrder.id;
              dataAdd.type = notifiedOrder.action;
              dataAdd.price = notifiedOrder.price;
              dataAdd.quantity = notifiedOrder.quantity || notifiedOrder.amount;
              dataAdd.estimate_total_vnd =
                notifiedOrder.estimate_total_vnd ||
                notifiedOrder.estimate_vnd_amount;
              dataAdd.actual_filled =
                notifiedOrder.actual_filled || notifiedOrder.amount_filled;
              dataAdd.actual_total_amount =
                notifiedOrder.actual_total_amount || notifiedOrder.cost_amount;
              dataAdd.status = notifiedOrder.status;
              dataAdd.unique_id = notifiedOrder.unique_id;
              dataAdd.trade_vnd_price = notifiedOrder.trade_vnd_price;
              dataAdd.trade_fee_percent = notifiedOrder.trade_fee_percent;
              dataAdd.trade_fee_reserved = notifiedOrder.trade_fee_reserved;
              dataAdd.trade_fee_final = notifiedOrder.trade_fee_final;
              dataAdd.total_reserved_amount =
                notifiedOrder.total_reserved_amount;
              dataAdd.cost_amount_after_fee =
                notifiedOrder.cost_amount_after_fee;
              dataAdd.actual_price = notifiedOrder.actual_price;
              dataAdd.coin_id = notifiedOrder.coin_id;
              if (data.area === 'tradebuy') {
                dataAdd.type = EXCHANGE_ORDER_TYPE.BUY;
              } else if (data.area === 'tradesell') {
                dataAdd.type = EXCHANGE_ORDER_TYPE.SELL;
              }
            }
            if (dataAdd && dataAdd.status) {
              if (matchOrderIndex !== -1) {
                currentOrderConfirmed[matchOrderIndex] = dataAdd;
              } else {
                currentOrderConfirmed.unshift(dataAdd);
              }
            }
            setTimeout(() => {
              dispatch({
                type: GET_ORDER_HISTORY_SUCCESS,
                data: currentOrderConfirmed,
              });
            }, 0);
            const result = await fetch({ query, variables })
              .then(res => res.data)
              .catch(err => {
                throw new Error(err.message);
              });

            // dispatch result
            if (
              result &&
              result.apiOrdersHistory &&
              result.apiOrdersHistory.data
            ) {
              dispatch({
                type: GET_ORDER_HISTORY_SUCCESS,
                data: result.apiOrdersHistory.data,
              });
            }
          }
        }
      });

      socket.on('connect_error', error => {
        socket.emit('unsubscribe', room);
        socket.close();
        dispatch({
          type: GET_ORDER_HISTORY_FAIL,
        });
        console.log(`Error connect is close. Error ${error}`);
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: GET_ORDER_HISTORY_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_ORDER_HISTORY_FAIL,
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

export const getOrderHistoryForAllCoins = socket => async (
  dispatch,
  getState,
) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: GET_ORDER_HISTORY_FOR_ALL_COINS_START,
  });
  let err = '';
  const query = `
    query getOrdersHistory($coin_id: String!) {
      apiOrdersHistory(coin_id: $coin_id) {
        data {
          id
          unique_id
          coin_id
          created_at
          updated_at
          type
          price
          quantity
          estimate_total_vnd
          actual_filled
          actual_total_amount
          status
          trade_vnd_price
          trade_fee_percent
          trade_fee_reserved
          trade_fee_final
          total_reserved_amount
          cost_amount_after_fee
          is_shared
        }
      }
    }
  `;
  const variables = {
    coin_id: '',
  };
  try {
    // call webservice
    const result = await fetch({ query, variables })
      .then(res => res.data)
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result && result.apiOrdersHistory && result.apiOrdersHistory.data) {
      dispatch({
        type: GET_ORDER_HISTORY_FOR_ALL_COINS_SUCCESS,
        data: result.apiOrdersHistory.data,
      });
      var currentOrderConfirmed = [
        ...getState().exchange.orderConfirmedForAllCoins,
      ];
      currentOrderConfirmed = currentOrderConfirmed
        ? currentOrderConfirmed
        : [];

      currentOrderConfirmed.forEach((value, key) => {
        socket.emit('subscribe', `transaction_${value.coin_id}`);
        socket.emit('subscribe', `tradebuy_${value.coin_id}`);
        socket.emit('subscribe', `tradesell_${value.coin_id}`);
      });

      socket.on('message', data => {
        if (
          data.area === 'transaction' ||
          data.area === 'tradebuy' ||
          data.area === 'tradesell'
        ) {
          dispatch({
            type: GET_ORDER_HISTORY_FOR_ALL_COINS_START,
          });
          let notifiedOrder = data.data;
          const user = getState().user;
          if (
            user &&
            user.profile &&
            parseInt(user.profile.id, 10) === notifiedOrder.user_id
          ) {
            let matchOrderIndex = currentOrderConfirmed.findIndex(
              order => order.unique_id === notifiedOrder.unique_id,
            );
            let dataAdd = {};
            if (
              (notifiedOrder && notifiedOrder.status === 'CANCELED') ||
              notifiedOrder.status === 'CLOSED'
            ) {
              dataAdd.created_at = moment(notifiedOrder.created_at).format(
                'YYYY-MM-DD HH:mm:ss',
              );
              dataAdd.coin_id = notifiedOrder.coin_id;
              dataAdd.id = notifiedOrder.id;
              dataAdd.type = notifiedOrder.action;
              dataAdd.price = notifiedOrder.price;
              dataAdd.quantity = notifiedOrder.quantity || notifiedOrder.amount;
              dataAdd.estimate_total_vnd =
                notifiedOrder.estimate_total_vnd ||
                notifiedOrder.estimate_vnd_amount;
              dataAdd.actual_filled =
                notifiedOrder.actual_filled || notifiedOrder.amount_filled;
              dataAdd.actual_total_amount =
                notifiedOrder.actual_total_amount || notifiedOrder.cost_amount;
              dataAdd.status = notifiedOrder.status;
              dataAdd.unique_id = notifiedOrder.unique_id;
              dataAdd.trade_vnd_price = notifiedOrder.trade_vnd_price;
              dataAdd.trade_fee_percent = notifiedOrder.trade_fee_percent;
              dataAdd.trade_fee_reserved = notifiedOrder.trade_fee_reserved;
              dataAdd.trade_fee_final = notifiedOrder.trade_fee_final;
              dataAdd.total_reserved_amount =
                notifiedOrder.total_reserved_amount;
              dataAdd.cost_amount_after_fee =
                notifiedOrder.cost_amount_after_fee;
              dataAdd.actual_price = notifiedOrder.actual_price;

              if (data.area === 'tradebuy') {
                dataAdd.type = EXCHANGE_ORDER_TYPE.BUY;
              } else if (data.area === 'tradesell') {
                dataAdd.type = EXCHANGE_ORDER_TYPE.SELL;
              }
            }

            if (dataAdd && dataAdd.status) {
              if (matchOrderIndex !== -1) {
                currentOrderConfirmed[matchOrderIndex] = dataAdd;
              } else {
                currentOrderConfirmed.unshift(dataAdd);
              }
            }
            setTimeout(() => {
              dispatch({
                type: GET_ORDER_HISTORY_FOR_ALL_COINS_SUCCESS,
                data: currentOrderConfirmed,
              });
            }, 0);
          }
        }
      });

      socket.on('connect_error', error => {
        socket.close();
        dispatch({
          type: GET_ORDER_HISTORY_FOR_ALL_COINS_FAIL,
        });
        console.log(`Error connect is close. Error ${error}`);
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: GET_ORDER_HISTORY_FOR_ALL_COINS_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_ORDER_HISTORY_FOR_ALL_COINS_FAIL,
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

export const fbSharingTransaction = (transaction_id) => async (dispatch) => {
  let err = '';
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );

  dispatch({
    type: FB_SHARING_TRANSACTION
  });

  const query = `
    mutation addFBSharedTransaction($transaction_id: String!) {
      apiAddFBSharedTransaction(transaction_id: $transaction_id) {
        status,
        reason
      }
    }
  `;

  const variables = {
    transaction_id: transaction_id
  };

  try {
    // call webservice
    const result = await fetch({ query, variables })
      .then(res => res.data)
      .catch(err => {
        throw new Error(err.message);
      });
    // dispatch result
    if (
      result &&
      result.apiFBSharedTransaction &&
      result.apiFBSharedTransaction.status
    ) {
      dispatch({
        type: FB_SHARING_TRANSACTION_SUCCESS,
        data: result.status,
      });
    }

  } catch (error) {
    dispatch({
      type: FB_SHARING_TRANSACTION_FAIL
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

function notifyCompletedOrder(dispatch, order) {
  const { status, type, quantity, coin_id, actual_filled } = order;
  const buyOrderCompletedMessage = {
    id: 'app.exchange.form.ordernotification.buy.completed',
    value: {
      coin_amount: quantity,
      coin_unit: coin_id,
    },
  };
  const buyOrderPartialMessage = {
    id: 'app.exchange.form.ordernotification.buy.partial',
    value: {
      coin_amount: actual_filled,
      coin_unit: coin_id,
    },
  };
  const buyOrderCanceledMessage = {
    id: 'app.exchange.form.ordernotification.buy.canceled',
    value: {
      coin_amount: quantity,
      coin_unit: coin_id,
    },
  };
  const sellOrderCompletedMessage = {
    id: 'app.exchange.form.ordernotification.sell.completed',
    value: {
      coin_amount: quantity,
      coin_unit: coin_id,
    },
  };
  const sellOrderPartialMessage = {
    id: 'app.exchange.form.ordernotification.sell.partial',
    value: {
      coin_amount: actual_filled,
      coin_unit: coin_id,
    },
  };
  const sellOrderCanceledMessage = {
    id: 'app.exchange.form.ordernotification.sell.canceled',
    value: {
      coin_amount: quantity,
      coin_unit: coin_id,
    },
  };

  var toastMessage = null;
  var toastType = '';

  switch (status) {
    case EXCHANGE_ORDER_STATUS.CLOSED:
      toastType = TOAST_TYPE.SUCCESS;
      if (type === EXCHANGE_ORDER_TYPE.BUY) {
        if (actual_filled === 0) {
          toastMessage = buyOrderCanceledMessage;
          toastType = TOAST_TYPE.ERROR;
        } else {
          toastMessage = buyOrderCompletedMessage;
        }
      } else if (type === EXCHANGE_ORDER_TYPE.SELL) {
        if (actual_filled === 0) {
          toastMessage = sellOrderCanceledMessage;
          toastType = TOAST_TYPE.ERROR;
        } else {
          toastMessage = sellOrderCompletedMessage;
        }
      }
      break;
    case EXCHANGE_ORDER_STATUS.CANCELED:
      if (type === EXCHANGE_ORDER_TYPE.BUY) {
        toastMessage = buyOrderCanceledMessage;
      } else if (type === EXCHANGE_ORDER_TYPE.SELL) {
        toastMessage = sellOrderCanceledMessage;
      }
      toastType = TOAST_TYPE.ERROR;
      break;
    case EXCHANGE_ORDER_STATUS.PARTIAL:
      if (type === EXCHANGE_ORDER_TYPE.BUY) {
        toastMessage = buyOrderPartialMessage;
      } else if (type === EXCHANGE_ORDER_TYPE.SELL) {
        toastMessage = sellOrderPartialMessage;
      }
      toastType = TOAST_TYPE.WARNING;
      break;
    default:
      break;
  }

  dispatch(
    setRuntimeVariable({
      name: 'toast',
      value: {
        toastNotified: true,
        message: toastMessage,
        type: toastType,
      },
    }),
  );
}

var handleNotifiedOrder = (
  currentOrders,
  notifiedOrder,
  dispatch,
  isGetOpenOrderForAllCoins,
) => {
  let matchOrderIndex = currentOrders.findIndex(
    order => order.id === notifiedOrder.id,
  );
  if (matchOrderIndex !== -1) {
    currentOrders[matchOrderIndex] = notifiedOrder;
    if (
      notifiedOrder.status === EXCHANGE_ORDER_STATUS.CLOSED ||
      notifiedOrder.status === EXCHANGE_ORDER_STATUS.CANCELED ||
      notifiedOrder.status === EXCHANGE_ORDER_STATUS.PARTIAL
    ) {
      if (notifiedOrder.status === EXCHANGE_ORDER_STATUS.PARTIAL) {
        notifyCompletedOrder(dispatch, notifiedOrder);
      } else {
        var localNotifiedOrders = JSON.parse(
          localStorage.getItem('notifiedOrders'),
        );
        if (localNotifiedOrders && localNotifiedOrders.length > 0) {
          const result = localNotifiedOrders.filter(
            id => id === notifiedOrder.unique_id,
          ).length;
          if (result < 2) {
            notifyCompletedOrder(dispatch, notifiedOrder);
          }
        }
      }
    }
  } else {
    currentOrders.unshift(notifiedOrder);
  }
  currentOrders = currentOrders.filter(function (order) {
    return (
      order.status !== EXCHANGE_ORDER_STATUS.CLOSED &&
      order.status !== EXCHANGE_ORDER_STATUS.CANCELED
    );
  });
  if (isGetOpenOrderForAllCoins) {
    setTimeout(() => {
      dispatch({
        type: GET_ORDER_OPENING_FOR_ALL_COINS_SUCCESS,
        data: currentOrders,
      });
    }, 0);
  } else {
    setTimeout(() => {
      dispatch({
        type: GET_ORDER_OPENING_SUCCESS,
        data: currentOrders,
      });
    }, 0);
  }
};

export const getOpenOrder = (coin_id, socket) => async (dispatch, getState) => {
  let err = '';
  const query = `
    query getOpenOrders ($coin_id: String!){
      apiOpenOrders(coin_id: $coin_id) {
        data {
          id
          unique_id
          coin_id
          created_at
          updated_at
          type
          price
          quantity
          estimate_total_vnd
          actual_filled
          actual_total_amount
          status
          unique_id
          trade_vnd_price
          trade_fee_percent
          trade_fee_reserved
          trade_fee_final
          total_reserved_amount
          cost_amount_after_fee
        }
      }
    }
  `;
  const variables = {
    coin_id: coin_id,
  };

  dispatch({
    type: GET_ORDER_OPENING_START,
  });

  try {
    // call webservice
    const result = await fetch({ query, variables })
      .then(res => res.data)
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result && result.apiOpenOrders && result.apiOpenOrders.data) {
      dispatch({
        type: GET_ORDER_OPENING_SUCCESS,
        data: result.apiOpenOrders.data,
      });
      var room = `transaction_${coin_id}`;
      var tradeBuyRoom = `tradebuy_${coin_id}`;
      var tradeSellRoom = `tradesell_${coin_id}`;
      socket.emit('subscribe', room);
      socket.emit('subscribe', tradeBuyRoom);
      socket.emit('subscribe', tradeSellRoom);
      var openOrders = [...getState().exchange.orderOpening];

      openOrders = openOrders ? openOrders : [];

      socket.on('message', notifiedOrder => {
        if (
          notifiedOrder.area === 'transaction' ||
          notifiedOrder.area === 'tradebuy' ||
          notifiedOrder.area === 'tradesell'
        ) {
          const user = getState().user;
          if (
            user &&
            user.profile &&
            parseInt(user.profile.id, 10) === notifiedOrder.data.user_id
          ) {
            dispatch({
              type: GET_ORDER_OPENING_START,
            });

            // Need to re-format openOrders array again because data format from socket is different from current state
            let formattedOrder = {};
            formattedOrder.created_at = moment(
              notifiedOrder.data.created_at,
            ).format('YYYY-MM-DD HH:mm:ss');

            formattedOrder.id = notifiedOrder.data.id;
            formattedOrder.coin_id = notifiedOrder.data.coin_id;
            formattedOrder.type = notifiedOrder.data.action;
            formattedOrder.price = notifiedOrder.data.price;
            formattedOrder.quantity = notifiedOrder.data.amount;
            formattedOrder.estimate_total_vnd =
              notifiedOrder.data.estimate_vnd_amount;
            formattedOrder.actual_filled = notifiedOrder.data.amount_filled;
            formattedOrder.actual_total_amount = notifiedOrder.data.cost_amount;
            formattedOrder.status = notifiedOrder.data.status;
            formattedOrder.unique_id = notifiedOrder.data.unique_id;
            formattedOrder.trade_vnd_price = notifiedOrder.data.trade_vnd_price;
            formattedOrder.trade_fee_percent =
              notifiedOrder.data.trade_fee_percent;
            formattedOrder.trade_fee_reserved =
              notifiedOrder.data.trade_fee_reserved;
            formattedOrder.trade_fee_final = notifiedOrder.data.trade_fee_final;
            formattedOrder.total_reserved_amount =
              notifiedOrder.data.total_reserved_amount;
            formattedOrder.cost_amount_after_fee =
              notifiedOrder.data.cost_amount_after_fee;

            if (notifiedOrder.area === 'tradebuy') {
              formattedOrder.type = EXCHANGE_ORDER_TYPE.BUY;
            } else if (notifiedOrder.area === 'tradesell') {
              formattedOrder.type = EXCHANGE_ORDER_TYPE.SELL;
            }

            if (
              formattedOrder.status === EXCHANGE_ORDER_STATUS.CLOSED ||
              formattedOrder.status === EXCHANGE_ORDER_STATUS.CANCELED
            ) {
              var localNotifiedOrders = JSON.parse(
                localStorage.getItem('notifiedOrders'),
              );
              if (!localNotifiedOrders) {
                localNotifiedOrders = [];
              }
              localNotifiedOrders.push(formattedOrder.unique_id);
              localStorage.setItem(
                'notifiedOrders',
                JSON.stringify(localNotifiedOrders),
              );
            }

            // Handle order processing flow for trade only

            if (
              formattedOrder.status !== EXCHANGE_ORDER_STATUS.CLOSED &&
              formattedOrder.status !== EXCHANGE_ORDER_STATUS.CANCELED &&
              (notifiedOrder.area === 'tradebuy' ||
                notifiedOrder.area === 'tradesell')
            ) {
              const currentTimeStamp = new Date().getTime();
              let timeLockUntil =
                notifiedOrder.data.autotrade_locked_until ||
                notifiedOrder.data.locked_until;
              let lockUntil = timeLockUntil ? timeLockUntil + 90 : null;
              if (lockUntil) {
                const lockUntilInMilliSecs = lockUntil * 1000;
                if (lockUntilInMilliSecs > currentTimeStamp) {
                  formattedOrder.status = EXCHANGE_ORDER_STATUS.PROCESSING;
                  const timeout = new Date(lockUntilInMilliSecs) - new Date();
                  setTimeout(function () {
                    formattedOrder.status = notifiedOrder.data.status;
                    handleNotifiedOrder(
                      openOrders,
                      formattedOrder,
                      dispatch,
                      null,
                      false,
                    );
                  }, timeout);
                }
              }
            }

            handleNotifiedOrder(
              openOrders,
              formattedOrder,
              dispatch,
              null,
              false,
            );
          }
        }
      });

      socket.on('connect_error', error => {
        socket.close();
        dispatch({
          type: GET_ORDER_OPENING_FAIL,
        });

        console.log(`Error connect is close. Error ${error}`);
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: GET_ORDER_OPENING_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_ORDER_OPENING_FAIL,
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

export const getOpenOrderForAllCoins = socket => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );

  let err = '';
  const query = `
    query getOpenOrders ($coin_id: String!){
      apiOpenOrders(coin_id: $coin_id) {
        data {
          id
          unique_id
          coin_id
          created_at
          updated_at
          type
          price
          quantity
          estimate_total_vnd
          actual_filled
          actual_total_amount
          status
          unique_id
          trade_vnd_price
          trade_fee_percent
          trade_fee_reserved
          trade_fee_final
          total_reserved_amount
          cost_amount_after_fee
        }
      }
    }
  `;
  const variables = {
    coin_id: '',
  };

  dispatch({
    type: GET_ORDER_OPENING_FOR_ALL_COINS_START,
  });

  try {
    // call webservice
    const result = await fetch({ query, variables })
      .then(res => res.data)
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result && result.apiOpenOrders && result.apiOpenOrders.data) {
      dispatch({
        type: GET_ORDER_OPENING_FOR_ALL_COINS_SUCCESS,
        data: result.apiOpenOrders.data,
      });

      var openOrdersForAllCoins = [];
      if (getState().exchange.orderOpeningForAllCoins) {
        openOrdersForAllCoins = [
          ...getState().exchange.orderOpeningForAllCoins,
        ];
        if (openOrdersForAllCoins) {
          openOrdersForAllCoins.forEach((value, key) => {
            socket.emit('subscribe', `transaction_${value.coin_id}`);
            socket.emit('subscribe', `tradebuy_${value.coin_id}`);
            socket.emit('subscribe', `tradesell_${value.coin_id}`);
          });
        }
      }

      socket.on('message', notifiedOrder => {
        if (
          notifiedOrder.area === 'transaction' ||
          notifiedOrder.area === 'tradebuy' ||
          notifiedOrder.area === 'tradesell'
        ) {
          const user = getState().user;
          if (
            user &&
            user.profile &&
            parseInt(user.profile.id, 10) === notifiedOrder.data.user_id
          ) {
            dispatch({
              type: GET_ORDER_OPENING_FOR_ALL_COINS_START,
            });
            // Need to re-format openOrders array again because data format from socket is different from current state
            let formattedOrder = {};
            // formattedOrder.created_at = moment(
            //   notifiedOrder.data.created_at,
            // ).format('DD-MM-YYYY HH:mm:ss');

            formattedOrder.created_at = moment(
              notifiedOrder.data.created_at,
            ).format('DD-MM-YYYY HH:mm:ss');
            formattedOrder.id = notifiedOrder.data.id;
            formattedOrder.coin_id = notifiedOrder.data.coin_id;
            formattedOrder.type = notifiedOrder.data.action;
            formattedOrder.price = notifiedOrder.data.price;
            formattedOrder.quantity = notifiedOrder.data.amount;
            formattedOrder.estimate_total_vnd =
              notifiedOrder.data.estimate_vnd_amount;
            formattedOrder.actual_filled = notifiedOrder.data.amount_filled;
            formattedOrder.actual_total_amount = notifiedOrder.data.cost_amount;
            formattedOrder.status = notifiedOrder.data.status;
            formattedOrder.unique_id = notifiedOrder.data.unique_id;
            formattedOrder.actual_total_amount = notifiedOrder.data.cost_amount;
            formattedOrder.status = notifiedOrder.data.status;
            formattedOrder.unique_id = notifiedOrder.data.unique_id;
            formattedOrder.trade_vnd_price = notifiedOrder.data.trade_vnd_price;
            formattedOrder.trade_fee_percent =
              notifiedOrder.data.trade_fee_percent;
            formattedOrder.trade_fee_reserved =
              notifiedOrder.data.trade_fee_reserved;
            formattedOrder.trade_fee_final = notifiedOrder.data.trade_fee_final;
            formattedOrder.total_reserved_amount =
              notifiedOrder.data.total_reserved_amount;
            formattedOrder.cost_amount_after_fee =
              notifiedOrder.data.cost_amount_after_fee;
            if (notifiedOrder.area === 'tradebuy') {
              formattedOrder.type = EXCHANGE_ORDER_TYPE.BUY;
            } else if (notifiedOrder.area === 'tradesell') {
              formattedOrder.type = EXCHANGE_ORDER_TYPE.SELL;
            }
            if (openOrdersForAllCoins) {
              handleNotifiedOrder(
                openOrdersForAllCoins,
                formattedOrder,
                dispatch,
                true,
              );
            }
          }
        }
      });

      socket.on('connect_error', error => {
        socket.close();
        dispatch({
          type: GET_ORDER_OPENING_FOR_ALL_COINS_FAIL,
        });

        console.log(`Error connect is close. Error ${error}`);
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: GET_ORDER_OPENING_FOR_ALL_COINS_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_ORDER_OPENING_FOR_ALL_COINS_FAIL,
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

export const getOrderBook = (coin_id, socket) => async (dispatch, getState) => {
  dispatch({
    type: GET_ORDER_BOOK_BUY_START,
  });
  dispatch({
    type: GET_ORDER_BOOK_SELL_START,
  });
  let err = '';
  try {
    const query = `
    query apiOrderBookFromRedis ($coin_id: String!){
      apiOrderBookFromRedis(coin_id: $coin_id) {
        success,
        message,
        data {
          broker,
          Buys {
            users_id,
            Quantity,
            Rate
          },
          Sells {
            users_id,
            Quantity,
            Rate
          }
        }
      }
    }
  `;
    const variables = {
      coin_id: coin_id,
    };
    const result = await fetch({ query, variables }).catch(err => {
      throw new Error(err.message);
    });
    if (result && result.data && result.data.apiOrderBookFromRedis) {
      const orderBookResult = result.data.apiOrderBookFromRedis;
      if (orderBookResult.success && orderBookResult.data) {
        dispatch({
          type: GET_ORDER_BOOK_BUY_SUCCESS,
          data: {
            buyOrders: orderBookResult.data.Buys,
          },
        });
        dispatch({
          type: GET_ORDER_BOOK_SELL_SUCCESS,
          data: {
            sellOrders: orderBookResult.data.Sells,
          },
        });
      }
    }
    if (socket) {
      let room_orderbook = `orderbook_${coin_id}`;
      socket.emit('subscribe', room_orderbook);
      socket.on('orderbook_message', transfer => {
        if (transfer.area === 'orderbook') {
          const orderBookData = transfer.data;
          if (orderBookData && orderBookData.Buys) {
            dispatch({
              type: GET_ORDER_BOOK_BUY_SUCCESS,
              data: {
                buyOrders: orderBookData.Buys,
              },
            });
          }
          if (orderBookData && orderBookData.Sells) {
            dispatch({
              type: GET_ORDER_BOOK_SELL_SUCCESS,
              data: {
                sellOrders: orderBookData.Sells,
              },
            });
          }
        }
      });
    } else {
      dispatch({
        type: GET_ORDER_BOOK_BUY_FAIL,
      });
      dispatch({
        type: GET_ORDER_BOOK_SELL_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_ORDER_BOOK_BUY_FAIL,
    });
    dispatch({
      type: GET_ORDER_BOOK_SELL_FAIL,
    });
    err = error.message;
  }
  return err;
};

export const callApiCancelOrder = transaction_id => async (
  dispatch,
  getState,
) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: CANCEL_START,
  });
  let err = '';
  const query = `
    query apiCancelExchange ($transaction_id: String!){
      apiCancelExchange(transaction_id: $transaction_id) {
        success,
        error_code,
        data {
          transaction_id,
          changed_currencies
        },
        description
      }
    }
  `;
  const variables = {
    transaction_id: transaction_id,
  };
  try {
    // call webservice
    const result = await fetch({ query, variables })
      .then(res => res.data)
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (
      result &&
      result.apiCancelExchange &&
      result.apiCancelExchange.success
    ) {
      dispatch({
        type: CANCEL_SUCCESS,
        data: {
          result: result.apiCancelExchange,
          id: transaction_id,
        },
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: CANCEL_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: CANCEL_FAIL,
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

export const simpleSellCoin = data => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: SIMPLE_SELL_COIN_START,
  });
  let err = '';
  try {
    const query = `query simpleSellCoin ($action: String!, $coin_id: String!, $amount: Float, $base_currency: String!, $price: Float!, $totalPrice: Float, $bank_code: String, $user_bank_account: String, $user_account_name: String, $transaction_id: String, $google_auth_code: String){
      apiCreateSimpleExchange (action: $action, coin_id: $coin_id, amount: $amount, base_currency: $base_currency, price: $price, totalPrice: $totalPrice, bank_code: $bank_code, user_bank_account: $user_bank_account, user_account_name: $user_account_name, transaction_id: $transaction_id, google_auth_code: $google_auth_code) {
        success,
        data {
          transaction_id
          amount
          base_currency
          coin
          cost_amount
          price
          valid_until
          max_amount
        },
        request_id,
        error_code,
        description
	  }
	}`;

    const variables = {
      action: 'SELL',
      coin_id: data.coin_id,
      amount: data.amount,
      base_currency: 'VND',
      price: data.price,
      bank_code: data.bank_code,
      transaction_id: data.transaction_id || '',
      user_bank_account: data.user_bank_account || '',
      user_account_name: data.user_account_name || '',
      google_auth_code: data.google_auth_code,
      totalPrice: data.totalPrice,
    };

    let result = await fetch({
      query,
      variables,
    })
      .then(res => {
        return res;
      })
      .catch(err => {
        throw new Error(err.message);
      });
    // dispatch result
    if (result && result.error && !result.error.status) {
      switch (result.error.reason) {
        case ERRORS.USER_BLOCKED:
          err = <FormattedMessage id="error.account.user-block" />;
          break;
        case ERRORS.WRONG_GOOGLE_AUTH:
          err = <FormattedMessage id="error.account.wrong_gg2fa_code" />;
          break;
        default:
          err = result.error.reason;
      }
    } else {
      result = result && result.data ? result.data : result;
      if (
        result &&
        result.apiCreateSimpleExchange &&
        result.apiCreateSimpleExchange.success
      ) {
        dispatch({
          type: SIMPLE_SELL_COIN_SUCCESS,
          data: result.apiCreateSimpleExchange,
        });
      } else if (
        result &&
        result.apiCreateSimpleExchange &&
        !result.apiCreateSimpleExchange.success
      ) {
        switch (result.apiCreateSimpleExchange.error_code) {
          case ERRORS.SIMPLE_EXCHANGE.MAX_AMOUNT_REACHED:
            err = {
              error_code: ERRORS.SIMPLE_EXCHANGE.MAX_AMOUNT_REACHED,
              max_amount: result.apiCreateSimpleExchange.data.max_amount,
            };
            break;
          default:
            err = result.apiCreateSimpleExchange.error_code;
        }
        dispatch({
          type: SIMPLE_SELL_COIN_FAIL,
        });
      } else {
        dispatch({
          type: SIMPLE_SELL_COIN_FAIL,
        });
        err = `Description: ${result.apiCreateSimpleExchange.description}`;
      }
    }
  } catch (error) {
    dispatch({
      type: SIMPLE_SELL_COIN_FAIL,
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

export const simpleBuyCoin = data => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: SIMPLE_BUY_COIN_START,
  });
  let err = '';
  try {
    const query = `query simpleBuyCoin ($action: String!, $coin_id: String!, $amount: Float, $base_currency: String!, $price: Float!, $totalPrice: Float, $wallet_address: String, $tag: String, $transaction_id: String, $from_coin_address: String, $google_auth_code: String){
      apiCreateSimpleExchange (action: $action, coin_id: $coin_id, amount: $amount, base_currency: $base_currency, price: $price, totalPrice: $totalPrice, wallet_address: $wallet_address, tag: $tag, transaction_id: $transaction_id, from_coin_address: $from_coin_address, google_auth_code: $google_auth_code) {
        success,
        data {
          transaction_id
          amount
          base_currency
          coin
          cost_amount
          price
          valid_until
          max_amount
        },
        request_id,
        error_code,
        description
	  }
	}`;

    const variables = {
      action: 'BUY',
      coin_id: data.coin_id,
      amount: data.amount,
      totalPrice: data.totalPrice,
      base_currency: 'VND',
      price: data.price,
      wallet_address: data.wallet_address || '',
      tag: data.tag || '',
      transaction_id: data.transaction_id || '',
      from_coin_address: data.from_coin_address || '',
      google_auth_code: data.google_auth_code,
    };

    let result = await fetch({
      query,
      variables,
    })
      .then(res => {
        return res;
      })
      .catch(err => {
        throw new Error(err.message);
      });
    // dispatch result
    if (result && result.error && !result.error.status) {
      switch (result.error.reason) {
        case ERRORS.USER_BLOCKED:
          err = <FormattedMessage id="error.account.user-block" />;
          break;
        case ERRORS.WRONG_GOOGLE_AUTH:
          err = <FormattedMessage id="error.account.wrong_gg2fa_code" />;
          break;
        default:
          err = result.error.reason;
      }
    } else {
      result = result && result.data ? result.data : result;
      if (
        result &&
        result.apiCreateSimpleExchange &&
        result.apiCreateSimpleExchange.success
      ) {
        dispatch({
          type: SIMPLE_BUY_COIN_SUCCESS,
          data: result.apiCreateSimpleExchange,
        });
      } else if (
        result &&
        result.apiCreateSimpleExchange &&
        !result.apiCreateSimpleExchange.success
      ) {
        switch (result.apiCreateSimpleExchange.error_code) {
          case ERRORS.SIMPLE_EXCHANGE.MAX_AMOUNT_REACHED:
            err = {
              error_code: ERRORS.SIMPLE_EXCHANGE.MAX_AMOUNT_REACHED,
              max_amount: result.apiCreateSimpleExchange.data.max_amount,
            };
            break;
          default:
            err = result.apiCreateSimpleExchange.error_code;
        }
        dispatch({
          type: SIMPLE_BUY_COIN_FAIL,
        });
      } else {
        dispatch({
          type: SIMPLE_BUY_COIN_FAIL,
        });
        err = `Description: ${result.apiCreateSimpleExchange.description}`;
      }
    }
  } catch (error) {
    dispatch({
      type: SIMPLE_BUY_COIN_FAIL,
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

export const getAllTradingInfo = coin_id => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: GET_ALL_TRADING_INFO_START,
  });
  let err = '';
  const query = `
    query getAllTradingOrders ($coin_id: String!){
      apiGetAllTrading(coin_id: $coin_id) {
        success,
        data {
          user_id
          username
          name
          total_amount
          total_quantity
          rank
        }
      }
    }
  `;
  const variables = {
    coin_id: coin_id,
  };
  try {
    // call webservice
    const result = await fetch({ query, variables })
      .then(res => res.data)
      .catch(err => {
        throw new Error(err.message);
      });
    console.log('result', result);
    // dispatch result
    if (result && result.apiGetAllTrading && result.apiGetAllTrading.success) {
      dispatch({
        type: GET_ALL_TRADING_INFO_SUCCESS,
        data: result.apiGetAllTrading.data,
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: GET_ALL_TRADING_INFO_ERROR,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_ALL_TRADING_INFO_ERROR,
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