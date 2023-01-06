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
  GET_TRANSACTIONS_SUCCESS,
  GET_DEPOSITS_SUCCESS,
  CLEAR_WALLET_INFORMATION,
  GET_WALLET_SUCCESS_FOR_COIN,
  WALLET_UPDATE_START,
  WALLET_UPDATE_SUCCESS,
  USER_DEPOSIT_REQUEST_SUCCESS,
  UPDATE_DEPOSIT_REQUEST_SUCCESS,
  GET_DEPOSIT_REQUEST_HISTORY_SUCCESS,
  GET_LIST_COIN_START,
  GET_LIST_COIN_SUCCESS,
  GET_LIST_COIN_FAIL,
  GET_LIST_WALLET_START,
  GET_LIST_WALLET_SUCCESS,
  GET_LIST_WALLET_FAIL,
  CLEAR_WALLET_DETAIL
} from '../constants';

const wallet = (state = null, action) => {
  switch (action.type) {
    case CLEAR_WALLET_DETAIL: {
      return {
        ...state,
        detail: null,
      };
    }
    case GET_WALLETS_START: {
      return {
        ...state,
        list: [],
      };
    }
    case GET_WALLETS_SUCCESS: {
      return {
        ...state,
        list: action.data,
      };
    }
    case GET_WALLETS_FAIL: {
      return {
        ...state,
        list: [],
      };
    }
    case GET_WALLET_START: {
      return {
        ...state,
      };
    }
    case GET_WALLET_SUCCESS: {
      return {
        ...state,
        detail: action.data,
      };
    }
    case GET_WALLET_FAIL: {
      return {
        ...state,
      };
    }
    case GET_WALLET_SUCCESS_FOR_COIN: {
      return {
        ...state,
        detail_for_coin: action.data,
      };
    }
    case CREATE_WALLET_START: {
      return {
        ...state,
        detail: null,
      };
    }
    case CREATE_WALLET_SUCCESS: {
      return {
        ...state,
        detail: action.data,
      };
    }
    case CREATE_WALLET_FAIL: {
      return {
        ...state,
        detail: null,
      };
    }
    case SEND_BALANCE_START: {
      return {
        ...state,
        transaction: null,
      };
    }
    case SEND_BALANCE_SUCCESS: {
      return {
        ...state,
        transaction: action.data,
      };
    }
    case SEND_BALANCE_FAIL: {
      return {
        ...state,
        transaction: null,
      };
    }
    case GET_TRANSACTIONS_SUCCESS: {
      return {
        ...state,
        transactions: { ...action.data },
      };
    }
    case GET_DEPOSITS_SUCCESS: {
      return {
        ...state,
        deposit: { ...action.data },
      };
    }
    case CLEAR_WALLET_INFORMATION: {
      return {
        ...state,
        deposit: null,
        transactions: null,
        list: [],
        detail: null,
      };
    }
    case WALLET_UPDATE_START: {
      return {
        ...state,
        walletUptoDate: null,
      };
    }
    case WALLET_UPDATE_SUCCESS: {
      return {
        ...state,
        walletUptoDate: action.data,
      };
    }
    case USER_DEPOSIT_REQUEST_SUCCESS: {
      return {
        ...state,
        userDepositRequest: action.data,
      };
    }
    case UPDATE_DEPOSIT_REQUEST_SUCCESS: {
      return {
        ...state,
        userDepositRequest: action.data,
      };
    }
    case GET_DEPOSIT_REQUEST_HISTORY_SUCCESS: {
      return {
        ...state,
        depositRequestHistory: action.data,
      };
    }
    case GET_LIST_COIN_START: {
      return {
        ...state
      };
    }
    case GET_LIST_COIN_SUCCESS: {
      return {
        ...state,
        listCoin: action.data
      };
    }
    case GET_LIST_COIN_FAIL: {
      return {
        ...state
      };
    }
    case GET_LIST_WALLET_START: {
      return {
        ...state
      };
    }
    case GET_LIST_WALLET_SUCCESS: {
      return {
        ...state,
        listWallet: action.data
      };
    }
    case GET_LIST_WALLET_FAIL: {
      return {
        ...state
      };
    }
    default:
      return state;
  }
};

export default wallet;
