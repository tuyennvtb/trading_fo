import {
  SWAP_GET_LIST_COINS,
  SWAP_GET_LIST_COINS_SUCCESS,
  SWAP_GET_LIST_COINS_FAIL,
  SWAP_GET_HISTORY,
  SWAP_GET_HISTORY_SUCCESS,
  SWAP_GET_HISTORY_FAIL,
  SWAP_ESTIMATE,
  SWAP_ESTIMATE_SUCCESS,
  SWAP_ESTIMATE_FAIL,
  SWAP_ESTIMATE_RESET
} from '../constants';

const STATE = {
  coins: [],
  transactions: [],
  confirm: {
    status: false,
    dataConfirm: {}
  }
}
const swap = (state = STATE, action) => {
  switch (action.type) {
    case SWAP_GET_LIST_COINS: {
      return {
        ...state,
      };
    }
    case SWAP_GET_LIST_COINS_SUCCESS: {
      return {
        ...state,
        coins: action.data,
      };
    }
    case SWAP_GET_LIST_COINS_FAIL: {
      return {
        ...state,
      };
    }
    case SWAP_GET_HISTORY: {
      return {
        ...state,
      };
    }
    case SWAP_GET_HISTORY_SUCCESS: {
      return {
        ...state,
        transactions: action.data,
      };
    }
    case SWAP_GET_HISTORY_FAIL: {
      return {
        ...state,
      };
    }
    case SWAP_ESTIMATE: {
      return {
        ...state
      };
    }
    case SWAP_ESTIMATE_SUCCESS: {
      return {
        ...state,
        confirm: action.data,
      };
    }
    case SWAP_ESTIMATE_FAIL: {
      return {
        ...state,
      };
    }
    case SWAP_ESTIMATE_RESET: {
      return {
        ...state,
        confirm: STATE.confirm
      };
    }
    default:
      return state;
  }
};

export default swap;