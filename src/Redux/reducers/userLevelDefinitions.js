/* eslint-disable import/prefer-default-export, new-cap */
import {
  GET_USER_LEVEL_DEFINITIONS_SUCCESS,
  GET_CURRENT_USER_LEVEL_DEFINITIONS_SUCCESS,
  GET_USER_GROUP_LIST_SUCCESS,
  GET_CURRENT_USER_LEVEL_DEFINITIONS_FAILED,
} from '../constants';

const userLevel = (state = null, action) => {
  switch (action.type) {
    case GET_USER_LEVEL_DEFINITIONS_SUCCESS: {
      return {
        ...state,
        data: action.data,
      };
    }
    case GET_CURRENT_USER_LEVEL_DEFINITIONS_SUCCESS: {
      return {
        ...state,
        currentUserLevel: action.data,
      };
    }
    case GET_CURRENT_USER_LEVEL_DEFINITIONS_FAILED: {
      return {
        ...state,
        currentUserLevel: null,
      };
    }
    case GET_USER_GROUP_LIST_SUCCESS: {
      return {
        ...state,
        userGroupList: action.data,
      };
    }
    default:
      return state;
  }
};

export default userLevel;
