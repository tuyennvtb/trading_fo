import { Cookies } from 'react-cookie';
import { setRuntimeVariable } from './runtime';
//import fetch from '../../Core/fetch';
import { default as fetch } from '../../Core/fetch/graph.fetch';
import { formatNumber } from '../../Helpers/utils';
import {
  ERRORS,
  USER_DEPOSIT_REQUEST_STATUS,
} from '../../Helpers/constants/system';
import React from 'react';
import { FormattedMessage } from 'react-intl';
/* eslint-disable import/prefer-default-export, new-cap */
import {
  GET_WALLETS_START,
  GET_WALLETS_SUCCESS,
  GET_WALLETS_FAIL,
  GET_WALLET_START,
  GET_WALLET_SUCCESS,
  GET_WALLET_FAIL,
  CREATE_WALLET_START,
  CREATE_WALLET_SUCCESS,
  CREATE_WALLET_FAIL,
  SEND_BALANCE_START,
  SEND_BALANCE_SUCCESS,
  SEND_BALANCE_FAIL,
  GET_TRANSACTIONS_FAIL,
  GET_TRANSACTIONS_START,
  GET_TRANSACTIONS_SUCCESS,
  GET_DEPOSITS_FAIL,
  GET_DEPOSITS_START,
  GET_DEPOSITS_SUCCESS,
  GET_WALLET_SUCCESS_FOR_COIN,
  WALLET_UPDATE_START,
  WALLET_UPDATE_SUCCESS,
  WALLET_UPDATE_FAIL,
  USER_DEPOSIT_REQUEST_START,
  USER_DEPOSIT_REQUEST_SUCCESS,
  USER_DEPOSIT_REQUEST_FAIL,
  UPDATE_DEPOSIT_REQUEST_SUCCESS,
  UPDATE_DEPOSIT_REQUEST_FAIL,
  GET_DEPOSIT_REQUEST_HISTORY_START,
  GET_DEPOSIT_REQUEST_HISTORY_SUCCESS,
  GET_DEPOSIT_REQUEST_HISTORY_FAIL,
  REQUEST_WITHDRAW_ACTION_START,
  REQUEST_WITHDRAW_ACTION_SUCCESS,
  REQUEST_WITHDRAW_ACTION_FAIL,
  GET_LIST_COIN_START,
  GET_LIST_COIN_SUCCESS,
  GET_LIST_COIN_FAIL,
  GET_LIST_WALLET_START,
  GET_LIST_WALLET_FAIL,
  GET_LIST_WALLET_SUCCESS,
  CLEAR_WALLET_DETAIL
} from '../constants';

const cookies = new Cookies();

fetch.use(({ request, options }, next) => {
  if (!options.headers) {
    options.headers = {}; // Create the headers object if needed.
  }
  options.headers['Authorization'] = `Bearer ${cookies.get('uid_btm_token')}`;

  next();
});

export const clearWalletDetail = () => (dispatch) => {
  dispatch({
    type: CLEAR_WALLET_DETAIL
  })
}

export const getActiveWallets = () => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: GET_WALLETS_START,
  });
  let err = '';
  const query = `{
    apiWalletList {
      id
      coin_code
      coin_id
      coin_name
      sort_no
      status
      created_at
      updated_at
      is_active
      allow_3rd_column
      additional_column_name
      active_fee
      transfer_fee
      is_wallet_active
      current_balance
      available_to_use
      send_holding_balance
      receive_holding_balance
      allow_deposit
      allow_withdraw
      withdraw_description
      deposit_description
      is_fake_wallet
      is_allow_simple_trade
      group {
        walletCode
        walletName
      }
    }
  }  
  `;
  try {
    // call webservice
    const result = await fetch({ query })
      .then(res => res.data)
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result && result.apiWalletList && result.apiWalletList.length > 0) {
      dispatch({
        type: GET_WALLETS_SUCCESS,
        data: result.apiWalletList,
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: GET_WALLETS_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_WALLETS_FAIL,
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

export const getWalletList = () => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );

  dispatch({
    type: GET_LIST_WALLET_START,
  });
 
  let err = '';
  const query = `{
    apiActiveWallet {
      id
      coin_code
      coin_id
      coin_name
      status
      is_active
      transfer_fee
    }
  }  
  `;
  try {
    // call webservice
    const result = await fetch({ query })
      .then(res => res.data)
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result && result.apiActiveWallet && result.apiActiveWallet.length > 0) {
      dispatch({
        type: GET_LIST_WALLET_SUCCESS,
        data: result.apiActiveWallet,
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: GET_LIST_WALLET_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_LIST_WALLET_FAIL,
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

export const getWalletDetail = (
  coin_id,
  loaded,
  action = 'BUY',
  socket,
  coin_code = '',
) => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: loaded ? true : false,
    }),
  );
  dispatch({
    type: GET_WALLET_START,
  });
  let err = '';
  const query = `query GetWalletDetail($coin_id: String!, $coin_code: String) {
    apiWalletDetail(coin_id: $coin_id, coin_code: $coin_code) {
      status
      result {
        site_code
        site_user_id
        coin_code
        coin_id
        coin_address
        coin_tag
        status
        active_fee
        fee
        available_to_use
        send_holding_balance
        receive_holding_balance
        current_balance
        withdraw_minimum
        deposit_minimum
        deposit_description
        withdraw_description
        allow_3rd_column
        additional_column_name
        buy_minimum
        sell_minimum
        is_fake_wallet
        is_allow_simple_trade
      }
      request_id
    }
  }`;
  const variables = {
    coin_id: coin_id,
    coin_code: coin_code,
  };
  try {
    // call webservice
    let result = await fetch({ query, variables })
      .then(res => res)
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result && result.error && !result.error.status) {
      err = result.error.reason;
    } else {
      result = result && result.data ? result.data : result;
      if (result && result.apiWalletDetail && result.apiWalletDetail.status) {
        if (action === 'BUY') {
          dispatch({
            type: GET_WALLET_SUCCESS,
            data: result.apiWalletDetail,
          });
        } else {
          dispatch({
            type: GET_WALLET_SUCCESS_FOR_COIN,
            data: result.apiWalletDetail,
          });
        }

        dispatch({
          type: WALLET_UPDATE_START,
        });
        if (result.apiWalletDetail.result.length > 0) {
          dispatch({
            type: WALLET_UPDATE_SUCCESS,
            data: result.apiWalletDetail,
          });

          let room = `wallet_${coin_id.toUpperCase()}`;
          if (socket) {
            socket.emit('subscribe', room);
            socket.on('message', data => {
              if (data.area === 'wallet') {
                const user = getState().user;
                let dataToUpdate = data.data;
                if (
                  user &&
                  user.profile &&
                  parseInt(user.profile.id, 10) === dataToUpdate.site_user_id
                ) {
                  if (
                    dataToUpdate.coin_id.toLowerCase() === coin_id.toLowerCase()
                  ) {
                    let afterBalance = Number(dataToUpdate.balance);
                    result.apiWalletDetail.result[0].available_to_use = afterBalance;
                    setTimeout(() => {
                      dispatch({
                        type: WALLET_UPDATE_SUCCESS,
                        data: result.apiWalletDetail,
                      });
                    }, 0);
                  }
                }
              }
            });
            socket.on('connect_error', error => {
              socket.emit('unsubscribe', room);
              socket.close();
              dispatch({
                type: WALLET_UPDATE_FAIL,
              });
              console.log(`Error connect is close. Error ${error}`);
            });
          }
        }
      } else {
        err = 'The internet connection is down, please try later.';
        dispatch({
          type: GET_WALLET_FAIL,
        });
      }
    }
  } catch (error) {
    dispatch({
      type: GET_WALLET_FAIL,
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

export const createWallet = (coin, coin_code = '') => async (
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
    type: CREATE_WALLET_START,
  });
  let err = '';
  const query = `mutation CreateWallet($coin_id: String!, $coin_code: String){
    apiWalletCreate(coin_id: $coin_id, coin_code: $coin_code) {
      status,
      request_id
    }
  }`;
  const variables = {
    coin_id: coin,
    coin_code: coin_code,
  };
  try {
    // call webservice
    const result = await fetch({ query, variables }).catch(err => {
      throw new Error(err.message);
    });
    // dispatch result
    if (result && result.apiWalletCreate && result.apiWalletCreate.status) {
      let query = `query GetWalletDetail($coin_id: String!, $coin_code: String) {
        apiWalletDetail(coin_id: $coin_id, coin_code: $coin_code) {
          status
          result {
            site_code
            site_user_id
            coin_code
            coin_id
            coin_address
            coin_tag
            status
            active_fee
            fee
            available_to_use
            send_holding_balance
            receive_holding_balance
            current_balance
            withdraw_minimum
            deposit_minimum
            deposit_description
            withdraw_description
            allow_3rd_column
            additional_column_name
            is_allow_simple_trade
          }
          request_id
        }
      }`;
      let variables = {
        coin_id: coin,
        coin_code: coin_code,
      };

      let wallet = await fetch({ query, variables })
        .then(res => res)
        .catch(err => {
          throw new Error(err.message);
        });
      if (wallet && wallet.error && !wallet.error.status) {
        err = wallet.error.reason;
      } else {
        wallet = wallet && wallet.data ? wallet.data : wallet;
        if (wallet && wallet.apiWalletDetail && wallet.apiWalletDetail.status) {
          clearInterval(this.intervalId);
          dispatch({
            type: CREATE_WALLET_SUCCESS,
            data: wallet.apiWalletDetail,
          });
        } else {
          this.intervalId = setInterval(() => {
            wallet = fetch({ query, variables })
              .then(res => res)
              .catch(err => {
                throw new Error(err.message);
              });
          }, 10000);
          dispatch({
            type: GET_WALLET_FAIL,
          });
        }
      }
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: CREATE_WALLET_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: CREATE_WALLET_FAIL,
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

//Send user action withdraw
export const requestWithdrawAction = object => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: REQUEST_WITHDRAW_ACTION_START,
  });
  let err = '';
  const query = `mutation RequestWithdrawAction($transaction_id: String!, $action: String!, $userId: String!, $coinId: String!, $amount: String!, $ciphertext: String!) {
    apiUserRequestActionWithdraw (transaction_id: $transaction_id, action: $action, userId: $userId, coinId: $coinId, amount: $amount, ciphertext: $ciphertext) {
      error_code,
      transaction_id,
      success,
      description
    }
  }`;
  const variables = {
    transaction_id: object.transaction_id || '',
    action: object.action || '',
    userId: object.userId || '',
    coinId: object.coinId || '',
    amount: object.amount || '',
    ciphertext: object.ciphertext || '',
  };
  try {
    // call webservice
    let result = await fetch({ query, variables })
      .then(res => res)
      .catch(err => {
        throw new Error(err.message);
      });
    // dispatch result
    if (result && result.error && !result.error.success) {
      switch (result.error.error_code || result.error.reason) {
        case ERRORS.SOMETHING_HAPPENED:
          err = <FormattedMessage id="error.global.message" />;
          break;
        case ERRORS.DATA_IS_NOT_VALID:
          err = <FormattedMessage id="wallet.data-invalid" />;
          break;
        default:
          err = result.error.description;
          dispatch({
            type: REQUEST_WITHDRAW_ACTION_FAIL,
          });
      }
    } else {
      result = result && result.data ? result.data : result;
      if (
        result &&
        result.apiUserRequestActionWithdraw &&
        result.apiUserRequestActionWithdraw.success === 'false'
      ) {
        err = result.apiUserRequestActionWithdraw.description;
        return err;
      } else {
        if (
          result &&
          result &&
          result.apiUserRequestActionWithdraw &&
          result.apiUserRequestActionWithdraw.success
        ) {
          dispatch({
            type: REQUEST_WITHDRAW_ACTION_SUCCESS,
            data: result.apiUserRequestActionWithdraw,
          });
          err = <FormattedMessage id="wallet.approve-transaction.message" />;
          return err;
        } else {
          err = <FormattedMessage id="error.global.message" />;
          dispatch({
            type: REQUEST_WITHDRAW_ACTION_FAIL,
          });
        }
      }
    }
  } catch (error) {
    dispatch({
      type: REQUEST_WITHDRAW_ACTION_FAIL,
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

export const sendCoin = object => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: SEND_BALANCE_START,
  });
  let err = '';
  const query = `mutation WithdrawCoin($coin_code: String!, $coin_id: String!, $amount: Float!, $bank_code: String, $from_coin_address: String!, $to_coin_address: String, $user_bank_account: String, $user_bank_account_name: String, $type: String, $google_2fa: String, $tag: String) {
    apiWithdrawCreate (coin_code: $coin_code, coin_id: $coin_id, amount: $amount, bank_code: $bank_code, from_coin_address: $from_coin_address, to_coin_address: $to_coin_address, user_bank_account: $user_bank_account, user_bank_account_name: $user_bank_account_name, type: $type, google_2fa: $google_2fa, tag: $tag) {
      error_code,
      transaction_status,
      success,
      data {
        transaction_status
        transaction_id
        to_coin
        bank_code
        user_bank_account
        user_bank_account_name
        amount_to_send
        user_id
        fee
        type
        from_coin_address
        to_coin_address
        tag
      },
      description
    }
  }`;
  const variables = {
    coin_code: object.coin_code || '',
    coin_id: object.coin_id || '',
    from_coin_address: object.from_coin_address || '',
    to_coin: object.to_coin || '',
    to_coin_address: object.to_coin_address || '',
    tag: object.tag || '',
    amount: object.amount_to_send || 0,
    google_2fa: object.google_2fa || '',
  };
  try {
    // call webservice
    let result = await fetch({ query, variables })
      .then(res => res)
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result && result.error && !result.error.status) {
      switch (result.error.reason) {
        case ERRORS.USER_BLOCKED:
          err = <FormattedMessage id="error.account.user-block" />;
          break;
        case ERRORS.SOMETHING_HAPPENED:
          err = <FormattedMessage id="error.global.message" />;
          break;
        case ERRORS.WRONG_GOOGLE_AUTH:
          err = <FormattedMessage id="error.account.wrong_gg2fa_code" />;
          break;
        case ERRORS.OVER_DAILY_WITHDRAW_LIMITATION:
          err = (
            <FormattedMessage
              id="error.wallet.overbudget"
              values={{
                limitTransferAmount: formatNumber(
                  result.error.data.limitTransferAmount,
                ),
                uptonowamount: formatNumber(result.error.data.uptonowamount),
              }}
            />
          );
          break;
        default:
          err = result.error.reason;
          dispatch({
            type: SEND_BALANCE_FAIL,
          });
      }
    } else {
      result = result && result.data ? result.data : result;
      console.log(result);
      if (
        result &&
        result.apiWithdrawCreate &&
        result.apiWithdrawCreate.data &&
        result.apiWithdrawCreate.data.transaction_status === 'RESERVE'
      ) {
        err = 'RESERVE';
      } else {
        if (
          result &&
          result.apiWithdrawCreate &&
          result.apiWithdrawCreate.success
        ) {
          dispatch({
            type: SEND_BALANCE_SUCCESS,
            data: result.apiWithdrawCreate,
          });

          // Refresh wallet list
          await getActiveWallets()(dispatch, getState);
        } else {
          err = <FormattedMessage id="error.global.message" />;
          dispatch({
            type: SEND_BALANCE_FAIL,
          });
        }
      }
    }
  } catch (error) {
    dispatch({
      type: SEND_BALANCE_FAIL,
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

export const getDepositHistory = coin => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: GET_DEPOSITS_START,
  });
  let err = '';
  const walletHistoryQuery = `query {
    apiWalletHistoryReceive {
      status,
      reason,
      data {
        id,
        coin,
        type,
        from_address,
        to_address,
        amount,
        site_code,
        site_user_id,
        request_unique_id,
        status,
        created_at,
        updated_at,
        to_address_tag,
        tx_id,
        fee,
        confirmation_number,
        min_confirmation_number,
        bank_code,
        user_bank_account,
        user_bank_account_name,
        memo,
        transaction_id
      }
    }
  }`;

  const walletCoinHistoryQuery = `query CoinReceiveHistory($coin_code: String!) {
    apiWalletHistoryCoinReceive(coin_code: $coin_code) {
      status,
      reason,
      data {
        id,
        coin,
        type,
        from_address,
        to_address,
        amount,
        site_code,
        site_user_id,
        request_unique_id,
        status,
        created_at,
        updated_at,
        to_address_tag,
        tx_id,
        fee,
        confirmation_number,
        min_confirmation_number,
        bank_code,
        user_bank_account,
        user_bank_account_name,
        memo,
        transaction_id
      }
    }
  }`;
  const query = coin ? walletCoinHistoryQuery : walletHistoryQuery;
  const variables = coin ? { coin_code: coin } : null;

  try {
    // call webservice
    const result = await fetch({ query, variables })
      .then(res => res.data)
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (coin) {
      if (
        result &&
        result.apiWalletHistoryCoinReceive &&
        result.apiWalletHistoryCoinReceive.status
      ) {
        dispatch({
          type: GET_DEPOSITS_SUCCESS,
          data: result.apiWalletHistoryCoinReceive,
        });
      } else {
        err = 'The internet connection is down, please try later.';
        dispatch({
          type: GET_DEPOSITS_FAIL,
        });
      }
    } else {
      if (
        result &&
        result.apiWalletHistoryReceive &&
        result.apiWalletHistoryReceive.status
      ) {
        dispatch({
          type: GET_DEPOSITS_SUCCESS,
          data: result.apiWalletHistoryReceive,
        });
      } else {
        err = 'The internet connection is down, please try later.';
        dispatch({
          type: GET_DEPOSITS_FAIL,
        });
      }
    }
  } catch (error) {
    dispatch({
      type: GET_DEPOSITS_FAIL,
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

export const getSendHistory = coin => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: GET_TRANSACTIONS_START,
  });
  let err = '';
  const historySendQuery = `query {
    apiWalletHistorySend {
      status,
      reason,
      data {
        id,
        coin,
        type,
        from_address,
        to_address,
        amount,
        site_code,
        site_user_id,
        request_unique_id,
        status,
        created_at,
        updated_at,
        to_address_tag,
        tx_id,
        fee,
        confirmation_number,
        min_confirmation_number,
        bank_code,
        user_bank_account,
        user_bank_account_name,
        memo,
        transaction_id
      }
    }
  }`;

  const historyCoinSendQuery = `query CoinHistory ($coin_code: String!){
    apiWalletHistoryCoinSend(coin_code: $coin_code) {
      status,
      reason,
      data {
        id,
        coin,
        type,
        from_address,
        to_address,
        amount,
        site_code,
        site_user_id,
        request_unique_id,
        status,
        created_at,
        updated_at,
        to_address_tag,
        tx_id,
        fee,
        confirmation_number,
        min_confirmation_number,
        bank_code,
        user_bank_account,
        user_bank_account_name,
        memo,
        transaction_id
      }
    }
  }`;

  const coinSendHistoryVariables = {
    coin_code: coin,
  };

  const query = coin ? historyCoinSendQuery : historySendQuery;
  const variables = coin ? coinSendHistoryVariables : null;
  try {
    // call webservice
    const result = await fetch({ query, variables })
      .then(res => res.data)
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (coin) {
      if (
        result &&
        result.apiWalletHistoryCoinSend &&
        result.apiWalletHistoryCoinSend.status
      ) {
        dispatch({
          type: GET_TRANSACTIONS_SUCCESS,
          data: result.apiWalletHistoryCoinSend,
        });
      } else {
        err = 'The internet connection is down, please try later.';
        dispatch({
          type: GET_TRANSACTIONS_FAIL,
        });
      }
    } else {
      if (
        result &&
        result.apiWalletHistorySend &&
        result.apiWalletHistorySend.status
      ) {
        dispatch({
          type: GET_TRANSACTIONS_SUCCESS,
          data: result.apiWalletHistorySend,
        });
      } else {
        err = 'The internet connection is down, please try later.';
        dispatch({
          type: GET_TRANSACTIONS_FAIL,
        });
      }
    }
  } catch (error) {
    dispatch({
      type: GET_TRANSACTIONS_FAIL,
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

export const userDepositRequest = object => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: USER_DEPOSIT_REQUEST_START,
  });
  let err = '';
  const query = ` mutation UserDepositRequest($coin_id: String!, $amount: Float!) {
    apiUserDepositRequest (coin_id: $coin_id, amount: $amount) {
      request_id,
      error_code,
      success,
      description,
      data {
        id
        user_id
        coin_id
        from_address
        to_address
        requested_tx_id
        bittrex_tx_id
        requested_amount
        approved_amount
        status
        canceled_reason
        created_at
        updated_at
        deleted_at
        admin_user_id
        tag
      }
    }
  }`;
  const variables = {
    coin_id: object.coin_id || '',
    amount: object.amount || 0,
  };
  try {
    // call webservice
    let result = await fetch({ query, variables })
      .then(res => res)
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result && result.error && !result.error.status) {
      switch (result.error.reason) {
        case ERRORS.NO_WALLET:
          err = <FormattedMessage id="error.wallet.request.isfakewallet" />;
          break;
        case ERRORS.INVALID_WALLET:
          err = <FormattedMessage id="error.wallet.request.invalid" />;
          break;
        default:
          err = result.error.reason;
          dispatch({
            type: USER_DEPOSIT_REQUEST_FAIL,
          });
      }
    } else {
      result = result && !result.error ? result.data : result;
      if (
        result &&
        result.apiUserDepositRequest &&
        result.apiUserDepositRequest.success
      ) {
        dispatch({
          type: USER_DEPOSIT_REQUEST_SUCCESS,
          data: result.apiUserDepositRequest.data,
        });
      } else {
        err = <FormattedMessage id="error.global.message" />;
        dispatch({
          type: USER_DEPOSIT_REQUEST_FAIL,
        });
      }
    }
  } catch (error) {
    dispatch({
      type: USER_DEPOSIT_REQUEST_FAIL,
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

export const updateDepositRequest = object => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: USER_DEPOSIT_REQUEST_START,
  });
  let err = '';
  const query = ` mutation UserDepositRequestUpdate($requested_tx_id: String!, $to_address: String!, $requested_amount: Float!, $coin_id: String!, $user_id: String!, $tag: String) {
    apiUserDepositRequestUpdate (requested_tx_id: $requested_tx_id, to_address: $to_address, requested_amount: $requested_amount, coin_id: $coin_id, user_id: $user_id, tag: $tag) {
      request_id,
      error_code,
      success,
      description,
      data {
        id
        user_id
        coin_id
        from_address
        to_address
        requested_tx_id
        bittrex_tx_id
        requested_amount
        approved_amount
        status
        canceled_reason
        created_at
        updated_at
        deleted_at
        admin_user_id
        tag
      }
    }
  }`;
  const variables = {
    requested_tx_id: object.txid || '',
    requested_amount: object.requested_amount || '',
    to_address: object.to_address,
    coin_id: object.coin_id,
    user_id: object.user_id,
    tag: object.tag || '',
  };
  try {
    // call webservice
    let result = await fetch({ query, variables })
      .then(res => res)
      .catch(err => {
        throw new Error(err.message);
      });
    // dispatch result
    if (result && result.error && !result.error.status) {
      switch (result.error.reason) {
        case ERRORS.SOMETHING_HAPPENED:
          err = <FormattedMessage id="error.global.message" />;
          break;
        case ERRORS.EXIST_DEPOSIT_REQUEST:
          err = <FormattedMessage id="error.wallet.duplicate" />;
          break;
        default:
          err = result.error.reason;
          dispatch({
            type: UPDATE_DEPOSIT_REQUEST_FAIL,
          });
      }
    } else {
      result = result && !result.error ? result.data : result;
      if (
        result &&
        result.apiUserDepositRequestUpdate &&
        result.apiUserDepositRequestUpdate.success
      ) {
        dispatch({
          type: UPDATE_DEPOSIT_REQUEST_SUCCESS,
          data: result.apiUserDepositRequestUpdate.data,
        });
      } else {
        err = <FormattedMessage id="error.global.message" />;
        dispatch({
          type: UPDATE_DEPOSIT_REQUEST_FAIL,
        });
      }
    }
  } catch (error) {
    dispatch({
      type: UPDATE_DEPOSIT_REQUEST_FAIL,
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

export const getDepositRequestHistory = () => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: GET_DEPOSIT_REQUEST_HISTORY_START,
  });
  let err = '';
  const query = `{
    apiUserDepositRequestHistory {
      status
      reason
      data {
        id,
        user_id,
        coin_id,
        from_address,
        to_address,
        requested_tx_id,
        bittrex_tx_id,
        requested_amount,
        approved_amount,
        status,
        canceled_reason,
        created_at,
        updated_at,
        deleted_at
      }
    }
  }    
  `;
  try {
    // call webservice
    const result = await fetch({ query })
      .then(res => res.data)
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (
      result &&
      result.apiUserDepositRequestHistory &&
      result.apiUserDepositRequestHistory.data.length > 0
    ) {
      let data = result.apiUserDepositRequestHistory.data.filter(
        item => item.status !== USER_DEPOSIT_REQUEST_STATUS.COMPLETED,
      );
      dispatch({
        type: GET_DEPOSIT_REQUEST_HISTORY_SUCCESS,
        data: data,
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: GET_DEPOSIT_REQUEST_HISTORY_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_DEPOSIT_REQUEST_HISTORY_FAIL,
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

export const getListCoin = () => async (dispatch, getState) => {
  dispatch({
    type: GET_LIST_COIN_START,
  });

  if (localStorage.getItem('list_coin')) {
    const items = JSON.parse(localStorage.getItem('list_coin'));
    if (items.length) {
      dispatch({
        type: GET_LIST_COIN_SUCCESS,
        data: items,
      });

      return false;
    }
  }

  let err = '';
  const query = `{
    apiGetListFastExchange {
      id
      coin_code
      coin_id
      coin_name
    }
  }  
  `;
  try {
    // call webservice
    const result = await fetch({ query })
      .then(res => res.data)
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result && result.apiGetListFastExchange && result.apiGetListFastExchange.length > 0) {
      dispatch({
        type: GET_LIST_COIN_SUCCESS,
        data: result.apiGetListFastExchange,
      });
      localStorage.setItem('list_coin', JSON.stringify(result.apiGetListFastExchange));
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: GET_LIST_COIN_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_LIST_COIN_FAIL,
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
}