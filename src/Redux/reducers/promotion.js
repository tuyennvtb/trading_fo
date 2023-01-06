/* eslint-disable import/prefer-default-export, new-cap */
import {
  GET_USER_PROMOTION_INFO_START,
  GET_USER_PROMOTION_INFO_SUCCESS,
  GET_USER_PROMOTION_INFO_ERROR,
} from '../constants';

const userPromotion = (state = null, action) => {
  switch (action.type) {
    case GET_USER_PROMOTION_INFO_START: {
      return {
        ...state,
        data: action.data,
      };
    }
    case GET_USER_PROMOTION_INFO_SUCCESS: {
      return {
        ...state,
        promotionList: action.data,
      };
    }
    case GET_USER_PROMOTION_INFO_ERROR: {
      return {
        ...state,
        promotionList: null,
      };
    }
    default:
      return state;
  }
};

export default userPromotion;
