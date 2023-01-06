/* eslint-disable import/prefer-default-export, new-cap */
import {
  GET_DEPOSIT_BANK_LIST_SUCCESS,
  GET_WITHDRAW_BANK_LIST_SUCCESS,
  BANK_DEPOSIT_START,
  BANK_DEPOSIT_SUCCESS,
  BANK_WITHDRAW_START,
  BANK_WITHDRAW_SUCCESS,
  GET_DEPOSIT_HISTORY_CASH_SUCCESS,
  GET_WITHDRAW_HISTORY_CASH_SUCCESS,
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

import { cloneDeep } from 'lodash';

const cash = (state = null, action) => {
  switch (action.type) {
    case GET_DEPOSIT_BANK_LIST_SUCCESS: {
      return {
        ...state,
        list: action.data,
      };
    }
    case GET_WITHDRAW_BANK_LIST_SUCCESS: {
      return {
        ...state,
        list: action.data,
      };
    }
    case BANK_DEPOSIT_START: {
      return {
        ...state,
        depositResponse: [],
      };
    }
    case BANK_DEPOSIT_SUCCESS: {
      return {
        ...state,
        depositResponse: action.data,
      };
    }
    case BANK_WITHDRAW_START: {
      return {
        ...state,
        withdrawResponse: [],
      };
    }
    case BANK_WITHDRAW_SUCCESS: {
      return {
        ...state,
        withdrawResponse: action.data,
      };
    }
    case GET_DEPOSIT_HISTORY_CASH_SUCCESS: {
      return {
        ...state,
        depositHistory: action.data,
      };
    }
    case GET_WITHDRAW_HISTORY_CASH_SUCCESS: {
      return {
        ...state,
        withdrawHistory: action.data,
      };
    }
    case GET_USER_BANK_LIST_START: {
      return {
        ...state,
        userBankList: [],
        error: Object.assign({}, state.error || {}, {
          bankList: ''
        }),
      }
    }
    case GET_USER_BANK_LIST_SUCCESS: {
      return {
        ...state,
        userBankList: action.data || [],
        error: Object.assign({}, state.error || {}, {
          bankList: ''
        }),
      }
    }
    case GET_USER_BANK_LIST_FAILED: {
      return {
        ...state,
        userBankList: [],
        error: Object.assign({}, state.error || {}, {
          bankList: action.data,
        }),
      }
    }
    case ADD_USER_BANK_START: {
      return {
        ...state,
        error: Object.assign({}, state.error || {}, {
          addBank: '',
          updateBank: '',
          deleteBank: '',
        }),
      }
    }
    case ADD_USER_BANK_SUCCESS: {
      const bankList = cloneDeep(state.userBankList);
      bankList.push(action.data);
      return {
        ...state,
        userBankList: bankList,
        error: Object.assign({}, state.error || {}, {
          addBank: '',
          updateBank: '',
          deleteBank: '',
        }),
      }
    }
    case ADD_USER_BANK_FAILED: {
      return {
        ...state,
        error: Object.assign({}, state.error || {}, {
          addBank: action.data,
        }),
      }
    }
    case UPDATE_USER_BANK_START: {
      return {
        ...state,
        error: Object.assign({}, state.error || {}, {
          addBank: '',
          updateBank: '',
          deleteBank: '',
        }),
      }
    }
    case UPDATE_USER_BANK_SUCCESS: {
      const bankList = cloneDeep(state.userBankList);
      const idx = bankList.findIndex(item => item.id === action.data.id);
      if (idx >= 0) bankList[idx] = action.data;
      return {
        ...state,
        userBankList: bankList,
        error: Object.assign({}, state.error || {}, {
          updateBank: ''
        }),
      }
    }
    case UPDATE_USER_BANK_FAILED: {
      return {
        ...state,
        error: Object.assign({}, state.error || {}, {
          updateBank: action.data,
        }),
      }
    }
    case DELETE_USER_BANK_START: {
      return {
        ...state,
        error: Object.assign({}, state.error || {}, {
          addBank: '',
          updateBank: '',
          deleteBank: '',
        }),
      }
    }
    case DELETE_USER_BANK_SUCCESS: {
      const bankList = state.userBankList.filter(item => item.id !== action.data.id);
      return {
        ...state,
        userBankList: bankList,
        error: Object.assign({}, state.error || {}, {
          deleteBank: ''
        }),
      }
    }
    case DELETE_USER_BANK_FAILED: {
      return {
        ...state,
        error: Object.assign({}, state.error || {}, {
          deleteBank: action.data,
        }),
      }
    }
    default:
      return state;
  }
};

export default cash;
