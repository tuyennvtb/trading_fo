import { default as fetch } from '../../Core/fetch/graph.fetch';
import { setRuntimeVariable } from './runtime';
/* eslint-disable import/prefer-default-export, new-cap */
import {
  OTC_CREATE_ORDER,
  OTC_CREATE_ORDER_SUCCESS,
  OTC_CREATE_ORDER_FAIL,
  OTC_GET_ORDER_BOOK,
  OTC_GET_ORDER_BOOK_SUCCESS,
  OTC_GET_ORDER_BOOK_FAIL,
  OTC_UPDATE_DATA_FROM_SOCKET,
  OTC_CREATE_TRANSACTION,
  OTC_CREATE_TRANSACTION_SUCCESS,
  OTC_CREATE_TRANSACTION_FAIL,
  OTC_APPROVE_TRANSACTION,
  OTC_APPROVE_TRANSACTION_SUCCESS,
  OTC_APPROVE_TRANSACTION_FAIL,
  OTC_CANCEL_TRANSACTION,
  OTC_CANCEL_TRANSACTION_SUCCESS,
  OTC_CANCEL_TRANSACTION_FAIL,
  OTC_BUYER_APPROVE_TRANSACTION,
  OTC_SELLER_APPROVE_TRANSACTION,
  OTC_CREATE_TRANSACTION_FOR_SELLER,
  OTC_SELLER_APPROVE_FOR_BUY_ORDER,
  OTC_GET_BANK_INFO,
  OTC_GET_BANK_INFO_SUCCESS,
  OTC_GET_BANK_INFO_FAIL,
} from '../constants';

export const createOrder = (
  { coinId, price, quantity, aggregateTotal, total, type },
  socket,
  callback
) => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    })
  );

  dispatch({
    type: OTC_CREATE_ORDER,
  });
  let err = '';

  const query = `
  mutation otcCreateOrder ($coinId: String!, $price: Float!, $quantity: Float!, $type: String!){
      apiCreateOrder(coinId: $coinId, price: $price, quantity: $quantity, type: $type) {
        success,
        error_code,
        data {
          aggregate_total
          total
          type
          status
          coin_id
          created_at
          updated_at
        },
      }
    }
  `;

  const variables = {
    coinId,
    price,
    quantity,
    aggregateTotal,
    total,
    type,
  };
  try {
    // call webservice
    var result = await fetch({ query, variables })
      .then((res) => {
        return res.data.apiCreateOrder;
      })
      .catch((err) => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result && result.success) {
      dispatch({
        type: OTC_CREATE_ORDER_SUCCESS,
        data: result.data,
      });
      callback && callback();
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: OTC_CREATE_ORDER_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: OTC_CREATE_ORDER_FAIL,
    });
    err = error.message;
  } finally {
    dispatch(
      setRuntimeVariable({
        name: 'loading',
        value: false,
      })
    );
  }
  return err;
};

export const getOTCOrderBook = (socket) => async (dispatch, getState) => {
  dispatch({
    type: OTC_GET_ORDER_BOOK,
  });
  let err = '';

  const query = `
  query getOrderBookList {
    apiGetOrderBookList {
        success,
        error_code,
        data {
          price
          quantity
          aggregate_quantity
          type
          status
          total
          coin_id
          created_at
          updated_at
          username
          order_id
          userId
        },
      }
    }
  `;

  try {
    // call webservice
    var result = await fetch({ query })
      .then((res) => {
        if (socket) {
          socket.on('otc-usdt', async (data) => {
            console.log('otc-usdt', data);
            const currentData = {
              ...data,
              total: data.price * data.quantity,
            };

            dispatch({
              type: OTC_UPDATE_DATA_FROM_SOCKET,
              data: currentData,
            });
          });

          socket.on('otc-transaction-notification', async (data) => {
            console.log('otc-transaction-notification', data);
            const ownState = getState();
            const { type, receiver, orderType } = data;
            const currentUserId = ownState.user.profile.id;
            if (type === 'BUYER_APPROVE' && receiver == currentUserId) {
              dispatch({
                type: OTC_BUYER_APPROVE_TRANSACTION,
                data: data,
              });
            } else if (type === 'SELLER_APPROVE' && receiver == currentUserId) {
              dispatch({
                type: OTC_SELLER_APPROVE_TRANSACTION,
                data: data,
              });
            } else if (type === 'BUYER' && receiver == currentUserId) {
              dispatch({
                type: OTC_CREATE_TRANSACTION_FOR_SELLER,
                data: data,
              });
            } else if (
              type === 'SELLER_APPROVE' &&
              orderType === 'BUY' &&
              receiver == currentUserId
            ) {
              dispatch({
                type: OTC_SELLER_APPROVE_FOR_BUY_ORDER,
                data: data,
              });
            }
          });
        }
        return res.data.apiGetOrderBookList;
      })
      .catch((err) => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result && result.success) {
      dispatch({
        type: OTC_GET_ORDER_BOOK_SUCCESS,
        data: result.data,
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: OTC_GET_ORDER_BOOK_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: OTC_GET_ORDER_BOOK_FAIL,
    });
    err = error.message;
  }
  return err;
};

export const createTransaction = (
  { amount, orderId },
  socket,
  callback
) => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    })
  );

  dispatch({
    type: OTC_CREATE_TRANSACTION,
  });
  let err = '';

  const query = `
  mutation otcCreateTransaction ($orderId: Int!, $amount: Float!){
    apiCreateTransaction(orderId: $orderId, amount: $amount) {
        success,
        error_code,
        data {
          id
          site_user_id
          transaction_id
          order_id
          amount
          buyer_status
          seller_status
          status
          updated_at
          seller_banks_info {
            account
            bank_code
            bank_account_name
          }
        }
      }
    }
  `;

  const variables = {
    amount,
    orderId,
  };
  try {
    // call webservice
    var result = await fetch({ query, variables })
      .then((res) => {
        return res.data.apiCreateTransaction;
      })
      .catch((err) => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result && result.success) {
      dispatch({
        type: OTC_CREATE_TRANSACTION_SUCCESS,
        data: result.data,
      });
      callback && callback(result.data);
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: OTC_CREATE_TRANSACTION_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: OTC_CREATE_TRANSACTION_FAIL,
    });
    err = error.message;
  } finally {
    dispatch(
      setRuntimeVariable({
        name: 'loading',
        value: false,
      })
    );
  }
  return err;
};

export const approveTransaction = (
  { transactionId, userRole, approveStatus },
  socket,
  callback
) => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    })
  );

  dispatch({
    type: OTC_APPROVE_TRANSACTION,
  });
  let err = '';

  const query = `
  mutation otcApproveTransaction ($transactionId: String!, $userRole: String!, $approveStatus:  String!){
    approveTransaction(transactionId: $transactionId, userRole: $userRole, approveStatus: $approveStatus) {
        success,
        error_code,
      }
    }
  `;

  const variables = {
    transactionId,
    userRole,
    approveStatus,
  };
  try {
    // call webservice
    var result = await fetch({ query, variables })
      .then((res) => {
        return res.data.approveTransaction;
      })
      .catch((err) => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result && result.success) {
      dispatch({
        type: OTC_APPROVE_TRANSACTION_SUCCESS,
        data: result.data,
      });
      callback && callback(result.data);
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: OTC_APPROVE_TRANSACTION_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: OTC_APPROVE_TRANSACTION_FAIL,
    });
    err = error.message;
  } finally {
    dispatch(
      setRuntimeVariable({
        name: 'loading',
        value: false,
      })
    );
  }
  return err;
};

export const cancelTransaction = ({ transactionId }, callback) => async (
  dispatch,
  getState
) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    })
  );

  dispatch({
    type: OTC_CANCEL_TRANSACTION,
  });
  let err = '';

  const query = `
  mutation otcCancelTransaction ($transactionId: String!){
    cancelTransaction(transactionId: $transactionId) {
        success,
        error_code,
      }
    }
  `;

  const variables = {
    transactionId,
  };
  try {
    // call webservice
    var result = await fetch({ query, variables })
      .then((res) => {
        return res.data.cancelTransaction;
      })
      .catch((err) => {
        throw new Error(err.message);
      });
    console.log('cancel transaction');
    // dispatch result
    if (result && result.success) {
      dispatch({
        type: OTC_CANCEL_TRANSACTION_SUCCESS,
        data: result.data,
      });
      callback && callback();
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: OTC_CANCEL_TRANSACTION_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: OTC_CANCEL_TRANSACTION_FAIL,
    });
    err = error.message;
  } finally {
    dispatch(
      setRuntimeVariable({
        name: 'loading',
        value: false,
      })
    );
  }
  return err;
};

export const getBankInfoList = () => async (dispatch, getState) => {
  dispatch({
    type: OTC_GET_BANK_INFO,
  });
  let err = '';

  const query = `
  query getBankInfo {
    apiGetBankInfo {
        success,
        error_code,
        data {
          account
          bank_code
          bank_account_name
        },
      }
    }
  `;

  try {
    // call webservice
    var result = await fetch({ query })
      .then((res) => {
        return res.data.apiGetBankInfo;
      })
      .catch((err) => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result && result.success) {
      dispatch({
        type: OTC_GET_BANK_INFO_SUCCESS,
        data: result.data,
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: OTC_GET_BANK_INFO_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: OTC_GET_BANK_INFO_FAIL,
    });
    err = error.message;
  }
  return err;
};
