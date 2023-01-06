/* eslint-disable import/prefer-default-export, new-cap */
import {
  GET_COINSINFO_SUCCESS,
  GET_PRICE_DETAIL_START,
  GET_PRICE_DETAIL_SUCCESS,
  RESET_PRICE_DETAIL,
  UPDATE_SUCCESS,
  GET_COINSINFO_BY_ID_SUCCESS,
  COIN_DETAIL_UPDATE_SUCCESS,
} from '../constants';

const coinsInfo = (state = null, action) => {
  switch (action.type) {
    case GET_COINSINFO_SUCCESS: {
      return {
        ...state,
        coinsList: action.data
      };
    }
    case GET_PRICE_DETAIL_START: {
      return {
        ...state,
      };
    }

    case GET_PRICE_DETAIL_SUCCESS: {
      return {
        ...state,
        priceList: action.data,
      };
    }

    case RESET_PRICE_DETAIL: {
      return {
        ...state,
        priceList: null,
      };
    }

    case UPDATE_SUCCESS: {
      return {
        ...state,
        coinsListUptoDate: [...action.data],
      };
    }

    case GET_COINSINFO_BY_ID_SUCCESS: {
      return {
        ...state,
        coinInfoById: action.data
      };
    }

    case COIN_DETAIL_UPDATE_SUCCESS: {
      return {
        ...state,
        coinInfoByIdUpToDate: action.data
      };
    }

    default:
      return state;
  }
};

export default coinsInfo;
