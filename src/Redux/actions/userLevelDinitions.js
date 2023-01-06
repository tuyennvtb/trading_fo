import { default as fetch } from '../../Core/fetch/graph.fetch';

/* eslint-disable import/prefer-default-export, new-cap */
import {
  GET_USER_LEVEL_DEFINITIONS_START,
  GET_USER_LEVEL_DEFINITIONS_SUCCESS,
  GET_USER_LEVEL_DEFINITIONS_FAILED,
  GET_CURRENT_USER_LEVEL_DEFINITIONS_START,
  GET_CURRENT_USER_LEVEL_DEFINITIONS_SUCCESS,
  GET_CURRENT_USER_LEVEL_DEFINITIONS_FAILED,
  GET_USER_GROUP_LIST_START,
  GET_USER_GROUP_LIST_SUCCESS,
  GET_USER_GROUP_LIST_FAILED,
} from '../constants';

export const getUserLevelDefinitions = () => async (dispatch, getState) => {
  dispatch({
    type: GET_USER_LEVEL_DEFINITIONS_START,
  });
  let err = '';
  const query = `
    query getUserLevelDefinitions {
      apiGetUserLevelDefinitions {
        success,
        error_code,
        data {
          id,
          code,
          description,
          sort,
          type
        }
      }
    }
  `;
  try {
    // call webservice
    var result = await fetch({ query })
      .then(res => {
        return res.data;
      })
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (
      result &&
      result.apiGetUserLevelDefinitions &&
      result.apiGetUserLevelDefinitions.success
    ) {
      dispatch({
        type: GET_USER_LEVEL_DEFINITIONS_SUCCESS,
        data: result.apiGetUserLevelDefinitions.data,
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: GET_USER_LEVEL_DEFINITIONS_FAILED,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_USER_LEVEL_DEFINITIONS_FAILED,
    });
    err = error.message;
  }
  return err;
};

export const getUserComission = type => async (dispatch, getState) => {
  dispatch({
    type: GET_USER_GROUP_LIST_START,
  });
  let err = '';
  const query = `
    query getUserGroupComission($type: [String!]) {
      apiGetUserGroupValueByType(type: $type) {
        success,
        error_code,
        data {
          id,
          user_group_code,
          sort,
          type,
          value
        }
      }
    }
  `;
  const variables = {
    type: type,
  };
  try {
    // call webservice
    var result = await fetch({ query, variables })
      .then(res => {
        return res.data;
      })
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (
      result &&
      result.apiGetUserGroupValueByType &&
      result.apiGetUserGroupValueByType.success
    ) {
      dispatch({
        type: GET_USER_GROUP_LIST_SUCCESS,
        data: result.apiGetUserGroupValueByType.data,
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: GET_USER_GROUP_LIST_FAILED,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_USER_LEVEL_DEFINITIONS_FAILED,
    });
    err = error.message;
  }
  return err;
};

export const getCurrentUserLevelDefinitions = (userId, type) => async (
  dispatch,
  getState,
) => {
  dispatch({
    type: GET_CURRENT_USER_LEVEL_DEFINITIONS_START,
  });
  let err = '';
  const query = `
    query getCurrentUserLevelDefinitions($userId: String!, $type :String!) {
      apiGetCurrentUserLevelDefinitions(userId: $userId, type: $type) {
        success,
        error_code,
        data {
          id,
          code,
          description,
          sort,
          type
        }
      }
    }
  `;
  const variables = {
    userId: userId,
    type: type,
  };
  try {
    // call webservice
    var result = await fetch({ query, variables })
      .then(res => {
        return res.data;
      })
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (
      result &&
      result.apiGetCurrentUserLevelDefinitions &&
      result.apiGetCurrentUserLevelDefinitions.success
    ) {
      dispatch({
        type: GET_CURRENT_USER_LEVEL_DEFINITIONS_SUCCESS,
        data: result.apiGetCurrentUserLevelDefinitions.data,
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: GET_CURRENT_USER_LEVEL_DEFINITIONS_FAILED,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_CURRENT_USER_LEVEL_DEFINITIONS_FAILED,
    });
    err = error.message;
  }
  return err;
};
