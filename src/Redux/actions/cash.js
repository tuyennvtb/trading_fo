import { Cookies } from 'react-cookie';
import React from 'react';
import { setRuntimeVariable } from './runtime';
import { default as fetch } from '../../Core/fetch/graph.fetch';
/* eslint-disable import/prefer-default-export, new-cap */
import { FormattedMessage } from 'react-intl';
import { formatNumber } from '../../Helpers/utils';
import {
  GET_DEPOSIT_BANK_LIST_START,
  GET_DEPOSIT_BANK_LIST_SUCCESS,
  GET_DEPOSIT_BANK_LIST_FAIL,
  BANK_DEPOSIT_START,
  BANK_DEPOSIT_SUCCESS,
  BANK_DEPOSIT_FAIL,
  BANK_WITHDRAW_START,
  BANK_WITHDRAW_SUCCESS,
  BANK_WITHDRAW_FAIL,
  GET_DEPOSIT_HISTORY_CASH_START,
  GET_DEPOSIT_HISTORY_CASH_SUCCESS,
  GET_DEPOSIT_HISTORY_CASH_FAIL,
  GET_WITHDRAW_HISTORY_CASH_START,
  GET_WITHDRAW_HISTORY_CASH_SUCCESS,
  GET_WITHDRAW_HISTORY_CASH_FAIL,
  GET_USER_BANK_LIST_START,
  GET_USER_BANK_LIST_SUCCESS,
  GET_USER_BANK_LIST_FAILED,
  ADD_USER_BANK_START,
  ADD_USER_BANK_SUCCESS,
  ADD_USER_BANK_FAILED,
  UPDATE_USER_BANK_START,
  UPDATE_USER_BANK_SUCCESS,
  UPDATE_USER_BANK_FAILED,
  DELETE_USER_BANK_START,
  DELETE_USER_BANK_SUCCESS,
  DELETE_USER_BANK_FAILED,
} from '../constants';
import { ERRORS } from '../../Helpers/constants/system';

const cookies = new Cookies();
fetch.use(({ request, options }, next) => {
  if (!options.headers) {
    options.headers = {}; // Create the headers object if needed.
  }
  options.headers['Authorization'] = `Bearer ${cookies.get('uid_btm_token')}`;

  next();
});

export const getBankList = () => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: GET_DEPOSIT_BANK_LIST_START,
  });
  let err = '';
  const query = `{
    apiWalletBankList {
      success
      error_code
      data {
        bank_code
        bank_name
        allow_deposit
        allow_withdraw
        bank_fee
      }
      description
    }
  }`;
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
      result.apiWalletBankList &&
      result.apiWalletBankList.success
    ) {
      dispatch({
        type: GET_DEPOSIT_BANK_LIST_SUCCESS,
        data: result.apiWalletBankList.data,
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: GET_DEPOSIT_BANK_LIST_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_DEPOSIT_BANK_LIST_FAIL,
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

export const bankWithdraw = bankAccount => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: BANK_WITHDRAW_START,
  });
  let err = '';
  const query = `mutation WithdrawCash($coin_code: String!, $coin_id: String!, $amount: Float!, $bank_code: String, $from_coin_address: String!, $to_coin_address: String, $user_bank_account: String, $user_bank_account_name: String, $type: String, $google_2fa: String, $user_bank_id: String, $note: String!) {
    apiWithdrawCreate (coin_code: $coin_code, coin_id: $coin_id, amount: $amount, bank_code: $bank_code, from_coin_address: $from_coin_address, to_coin_address: $to_coin_address, user_bank_account: $user_bank_account, user_bank_account_name: $user_bank_account_name, type: $type, google_2fa: $google_2fa, user_bank_id: $user_bank_id, note: $note) {
      error_code,
      success,
      data {
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
    coin_code: bankAccount.coin_code || 'VND',
    coin_id: bankAccount.coin_id || 'VND',
    amount: bankAccount.amount,
    from_coin_address: bankAccount.from_coin_address || '',
    type: 'CASH',
    user_bank_account: bankAccount.user_bank_account,
    user_bank_account_name: bankAccount.user_account_name,
    bank_code: bankAccount.bank_code,
    google_2fa: bankAccount.google_2fa,
    user_bank_id: bankAccount.user_bank_id || '',
    note: bankAccount.note
  };
  try {
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
        case ERRORS.BALANCE_NOT_ENOUGH:
          err = <FormattedMessage id="error.cash.not.enough.balance" />;
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
      }
    } else {
      result = result && result.data ? result.data : result;
      if (result && result.apiWithdrawCreate && result.apiWithdrawCreate.data) {
        dispatch({
          type: BANK_WITHDRAW_SUCCESS,
          data: result.apiWithdrawCreate.data,
        });
      } else {
        err = 'The internet connection is down, please try later.';
        dispatch({
          type: BANK_WITHDRAW_FAIL,
        });
      }
    }
  } catch (error) {
    dispatch({
      type: BANK_WITHDRAW_FAIL,
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

export const bankDeposit = bankAccount => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: BANK_DEPOSIT_START,
  });
  let err = '';
  const query = `mutation DepositCash($coin_code: String!, $coin_id: String!, $amount: Float!, $bank_code: String, $destination: String!, $trans_txid: String, $confirmation_number: Int, $from_address: String, $bank_account_name: String, $account: String) {
    apiDepositCreate (coin_code: $coin_code, coin_id: $coin_id, amount: $amount, bank_code: $bank_code, destination: $destination, trans_txid: $trans_txid, confirmation_number: $confirmation_number, from_address: $from_address, bank_account_name: $bank_account_name, account: $account) {
      request_id,
      error_code,
      success,
      data {
        transaction_id
        bank_name
        bank_account_id
        bank_account_name
        memo
        amount
      },
      description
    }
  }
  `;
  const variables = {
    coin_id: bankAccount.coin_id || 'VND',
    amount: bankAccount.amount || '',
    coin_code: bankAccount.coin_code || 'VND',
    bank_code: bankAccount.bank || '',
    destination: bankAccount.destination,
    bank_account_name: bankAccount.bank_account_name,
    account: bankAccount.account,
  };
  try {
    //call webservice
    let result = await fetch({ query, variables })
      .then(res => res)
      .catch(err => {
        throw new Error(err.message);
      });
    if (result && result.error && !result.error.status) {
      switch (result.error.reason) {
        case ERRORS.CAN_NOT_ADD_DEPOSIT_RECORD:
          err = <FormattedMessage id="error.cash.not.add.record" />;
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
          err = result.error.error_code;
      }
    } else {
      result = result && result.data ? result.data : result;
      if (result && result.apiDepositCreate && result.apiDepositCreate.data) {
        dispatch({
          type: BANK_DEPOSIT_SUCCESS,
          data: result.apiDepositCreate,
        });
      } else {
        err = 'The internet connection is down, please try later.';
        dispatch({
          type: BANK_DEPOSIT_FAIL,
        });
      }
    }
  } catch (error) {
    dispatch({
      type: BANK_DEPOSIT_FAIL,
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

export const cashWithdrawHistory = coin_id => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: GET_WITHDRAW_HISTORY_CASH_START,
  });
  let err = '';
  const query = `query CashDepositHistory ($coin_id: String!){
    apiWalletHistoryCoinSend(coin_id: $coin_id) {
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
        memo,
        user_bank_account,
        user_bank_account_name,
        bank_code,
        transaction_id
      }
    }
  }
  `;
  const variables = {
    coin_id: coin_id || 'VND',
  };
  try {
    //call webservice
    const result = await fetch({ query, variables })
      .then(res => res.data)
      .catch(err => {
        throw new Error(err.message);
      });

    if (
      result &&
      result.apiWalletHistoryCoinSend &&
      result.apiWalletHistoryCoinSend.data
    ) {
      dispatch({
        type: GET_WITHDRAW_HISTORY_CASH_SUCCESS,
        data: result.apiWalletHistoryCoinSend.data,
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: GET_WITHDRAW_HISTORY_CASH_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_WITHDRAW_HISTORY_CASH_FAIL,
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

export const cashDepositHistory = coin_id => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: GET_DEPOSIT_HISTORY_CASH_START,
  });
  let err = '';
  const query = `query CashDepositHistory($coin_id: String!) {
    apiWalletHistoryCoinReceive(coin_id: $coin_id) {
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
        memo,
        user_bank_account,
        user_bank_account_name,
        bank_code,
        transaction_id
      }
    }
  }
  `;
  const variables = {
    coin_id: coin_id || 'VND',
  };
  try {
    //call webservice
    const result = await fetch({ query, variables })
      .then(res => res.data)
      .catch(err => {
        throw new Error(err.message);
      });

    if (
      result &&
      result.apiWalletHistoryCoinReceive &&
      result.apiWalletHistoryCoinReceive.data
    ) {
      dispatch({
        type: GET_DEPOSIT_HISTORY_CASH_SUCCESS,
        data: result.apiWalletHistoryCoinReceive.data,
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: GET_DEPOSIT_HISTORY_CASH_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_DEPOSIT_HISTORY_CASH_FAIL,
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

export const getUserBankList = () => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: GET_USER_BANK_LIST_START,
  });
  let err = '';
  const query = `{
    apiGetUserBankList {
      success
      error_code
      data {
        id,
        bank_code,
        bank_account_name,
        account
      }
    }
  }`;
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
      result.apiGetUserBankList &&
      result.apiGetUserBankList.success
    ) {
      dispatch({
        type: GET_USER_BANK_LIST_SUCCESS,
        data: result.apiGetUserBankList.data,
      });
    } else {
      err =
        result.errors && result.errors.message
          ? result.errors.message
          : 'There was an error getting user bank list';
      dispatch({
        type: GET_USER_BANK_LIST_FAILED,
        data: err,
      });
    }
  } catch (error) {
    err = error.message || 'There was an error getting user bank list';
    dispatch({
      type: GET_USER_BANK_LIST_FAILED,
      data: err,
    });
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

export const addUserBank = bankAccount => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: ADD_USER_BANK_START,
  });
  let err = '';
  const query = `mutation AddUserBank($bank_code: String!, $bank_account_name: String!, $account: String!) {
    apiAddUserBank (bank_code: $bank_code, bank_account_name: $bank_account_name, account: $account) {
      error_code,
      success,
      data {
        id
        bank_code
        bank_account_name
        account
      }
    }
  }`;
  const variables = {
    account: bankAccount.user_bank_account,
    bank_account_name: bankAccount.user_account_name,
    bank_code: bankAccount.bank_code,
  };
  try {
    // call webservice
    const result = await fetch({ query, variables })
      .then(res => {
        if (
          res.error &&
          (!res.data.apiAddUserBank || !res.data.apiAddUserBank.success)
        ) {
          throw res.error;
        }
        return res.data;
      })
      .catch(err => {
        return new Error(err.message || err.reason);
      });
    // dispatch result
    if (result && result.apiAddUserBank && result.apiAddUserBank.success) {
      dispatch({
        type: ADD_USER_BANK_SUCCESS,
        data: result.apiAddUserBank.data,
      });
    } else {
      err = result.message || 'There was an error adding user bank';
      dispatch({
        type: ADD_USER_BANK_FAILED,
        data: err,
      });
    }
  } catch (error) {
    err = error.message || 'There was an error adding user bank';
    dispatch({
      type: ADD_USER_BANK_FAILED,
      data: err,
    });
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

export const updateUserBank = bankAccount => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: UPDATE_USER_BANK_START,
  });
  let err = '';
  const query = `mutation UpdateUserBank($id: String!, $bank_code: String!, $bank_account_name: String!, $account: String!) {
    apiUpdateUserBank (id: $id, bank_code: $bank_code, bank_account_name: $bank_account_name, account: $account) {
      error_code,
      success,
      data {
        id
        bank_code
        bank_account_name
        account
      }
    }
  }`;
  const variables = {
    id: bankAccount.id,
    account: bankAccount.account,
    bank_account_name: bankAccount.bank_account_name,
    bank_code: bankAccount.bank_code,
  };
  try {
    // call webservice
    const result = await fetch({ query, variables })
      .then(res => {
        if (
          res.error &&
          (!res.data.apiUpdateUserBank || !res.data.apiUpdateUserBank.success)
        ) {
          throw res.error;
        }
        return res.data;
      })
      .catch(err => {
        return new Error(err.message || err.reason);
      });
    // dispatch result
    if (
      result &&
      result.apiUpdateUserBank &&
      result.apiUpdateUserBank.success
    ) {
      dispatch({
        type: UPDATE_USER_BANK_SUCCESS,
        data: result.apiUpdateUserBank.data,
      });
    } else {
      err = result.message || 'There was an error updating user bank';
      dispatch({
        type: UPDATE_USER_BANK_FAILED,
        data: err,
      });
    }
  } catch (error) {
    err = error.message || 'There was an error updating user bank';
    dispatch({
      type: UPDATE_USER_BANK_FAILED,
      data: err,
    });
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

export const deleteUserBank = userBankId => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: DELETE_USER_BANK_START,
  });
  let err = '';
  const query = `mutation deleteUserBank($id: String!) {
    apiDeleteUserBank (id: $id) {
      error_code,
      success,
      data {
        id
        account
      }
    }
  }`;
  const variables = {
    id: userBankId,
  };
  try {
    // call webservice
    const result = await fetch({ query, variables })
      .then(res => {
        if (
          res.error &&
          (!res.data.deleteUserBank || !res.data.deleteUserBank.success)
        ) {
          throw res.error;
        }
        return res.data;
      })
      .catch(err => {
        return new Error(err.message || err.reason);
      });
    // dispatch result
    if (
      result &&
      result.apiDeleteUserBank &&
      result.apiDeleteUserBank.success
    ) {
      dispatch({
        type: DELETE_USER_BANK_SUCCESS,
        data: result.apiDeleteUserBank.data,
      });
    } else {
      err = result.message || 'There was an error deleting user bank';
      dispatch({
        type: DELETE_USER_BANK_FAILED,
        data: err,
      });
    }
  } catch (error) {
    err = error.message || 'There was an error deleting user bank';
    dispatch({
      type: DELETE_USER_BANK_FAILED,
      data: err,
    });
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
