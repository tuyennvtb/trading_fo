/* eslint-disable import/prefer-default-export, new-cap */
import {
  GOOGLE_AUTH_GENERATE_START,
  GOOGLE_AUTH_GENERATE_SUCCESS,
  GOOGLE_AUTH_GENERATE_FAIL,
} from '../constants';

const google2fa = (state = null, action) => {
  switch (action.type) {
    case GOOGLE_AUTH_GENERATE_START: {
      return {
        ...state,
        general_code: {},
      };
    }
    case GOOGLE_AUTH_GENERATE_SUCCESS: {
      return {
        ...state,
        general_code: action.data,
      };
    }
    case GOOGLE_AUTH_GENERATE_FAIL: {
      return {
        ...state,
        general_code: {},
      };
    }

    default:
      return state;
  }
};

export default google2fa;
