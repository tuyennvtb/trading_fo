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
  GET_ORDER_HISTORY_FOR_ALL_COINS_SUCCESS,
  GET_ORDER_OPENING_START,
  GET_ORDER_OPENING_SUCCESS,
  GET_ORDER_OPENING_FOR_ALL_COINS_START,
  GET_ORDER_OPENING_FOR_ALL_COINS_SUCCESS,
  GET_ORDER_BOOK_BUY_START,
  GET_ORDER_BOOK_BUY_SUCCESS,
  GET_ORDER_BOOK_BUY_FAIL,
  RESET_ORDER_BOOK_BUY,
  GET_ORDER_BOOK_SELL_START,
  GET_ORDER_BOOK_SELL_SUCCESS,
  GET_ORDER_BOOK_SELL_FAIL,
  RESET_ORDER_BOOK_SELL,
  CLEAR_EXCHANGE_INFORMATION,
  SIMPLE_BUY_COIN_SUCCESS,
  SIMPLE_SELL_COIN_SUCCESS,
  GET_ALL_TRADING_INFO_START,
  GET_ALL_TRADING_INFO_SUCCESS,
  GET_ALL_TRADING_INFO_ERROR,
} from '../constants';

const exchange = (state = null, action) => {
  switch (action.type) {
    case BUY_START: {
      return {
        ...state,
        response: [],
      };
    }
    case BUY_SUCCESS: {
      return {
        ...state,
        response: action.data,
      };
    }
    case BUY_FAIL: {
      return {
        ...state,
        response: [],
      };
    }
    case SELL_START: {
      return {
        ...state,
        response: [],
      };
    }
    case SELL_SUCCESS: {
      return {
        ...state,
        response: action.data,
      };
    }
    case SELL_FAIL: {
      return {
        ...state,
        response: [],
      };
    }
    case GET_ORDER_HISTORY_START: {
      return {
        ...state,
      };
    }
    case GET_ORDER_HISTORY_SUCCESS: {
      return {
        ...state,
        orderConfirmed: action.data,
      };
    }
    case GET_ALL_TRADING_INFO_SUCCESS: {
      return {
        ...state,
        allTradingInfo: action.data,
      };
    }
    case GET_ORDER_HISTORY_FAIL: {
      return {
        ...state,
        orderConfirmed: null,
      };
    }
    case GET_ORDER_HISTORY_FOR_ALL_COINS_SUCCESS: {
      return {
        ...state,
        orderConfirmedForAllCoins: action.data,
      };
    }
    case GET_ORDER_OPENING_START: {
      return {
        ...state,
      };
    }
    case GET_ORDER_OPENING_SUCCESS: {
      return {
        ...state,
        orderOpening: action.data,
      };
    }
    case GET_ORDER_OPENING_FOR_ALL_COINS_START: {
      return {
        ...state,
      };
    }
    case GET_ORDER_OPENING_FOR_ALL_COINS_SUCCESS: {
      return {
        ...state,
        orderOpeningForAllCoins: action.data,
      };
    }
    case GET_ORDER_BOOK_BUY_START: {
      return {
        ...state,
      };
    }
    case GET_ORDER_BOOK_BUY_SUCCESS: {
      return {
        ...state,
        orderBookBuy: action.data,
      };
    }
    case GET_ORDER_BOOK_BUY_FAIL: {
      return {
        ...state,
        orderBookBuy: null,
      };
    }
    case RESET_ORDER_BOOK_BUY: {
      return {
        ...state,
        orderBookBuy: null,
      };
    }
    case GET_ORDER_BOOK_SELL_START: {
      return {
        ...state,
      };
    }
    case GET_ORDER_BOOK_SELL_SUCCESS: {
      return {
        ...state,
        orderBookSell: action.data,
      };
    }
    case GET_ORDER_BOOK_SELL_FAIL: {
      return {
        ...state,
        orderBookSell: null,
      };
    }
    case RESET_ORDER_BOOK_SELL: {
      return {
        ...state,
        orderBookSell: null,
      };
    }
    case CANCEL_START: {
      return {
        ...state,
        orderCancel: null,
      };
    }
    case CANCEL_SUCCESS: {
      return {
        ...state,
        orderCancel: action.data,
      };
    }
    case CANCEL_FAIL: {
      return {
        ...state,
        orderCancel: null,
      };
    }
    case CLEAR_EXCHANGE_INFORMATION: {
      return {
        ...state,
        response: [],
        orderConfirmed: null,
        orderOpening: null,
      };
    }
    case SIMPLE_BUY_COIN_SUCCESS: {
      return {
        ...state,
        simpleTradeResponse: action.data,
      };
    }
    case SIMPLE_SELL_COIN_SUCCESS: {
      return {
        ...state,
        simpleTradeResponse: action.data,
      };
    }
    default:
      return state;
  }
};

export default exchange;
