import { default as fetch } from '../../Core/fetch/graph.fetch';

/* eslint-disable import/prefer-default-export, new-cap */
import {
  GET_SETTING_START,
  GET_SETTING_SUCCESS,
  GET_SETTING_FAIL,
  GET_CUSTOMER_SERVICE_START,
  GET_COINSINFO_BY_ID_SUCCESS,
  GET_CUSTOMER_SERVICE_FAIL,
  GET_CUSTOMER_SERVICE_SUCCESS,
} from '../constants';
export const getSettingsByID = id => async (dispatch, getState) => {
  dispatch({
    type: GET_SETTING_START,
  });
  let err = '';
  const query = `
    query getSettings {
      apiGetSettings {
        success,
        error_code,
        data {
          id,
          item,
          value
        }
      }
    }
  `;
  const variables = {
    id: id,
  };
  try {
    // call webservice
    var result = await fetch({ query, variables })
      .then(res => {
        return res.data.apiGetSettings;
      })
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result && result.success) {
      dispatch({
        type: GET_SETTING_SUCCESS,
        data: result.data,
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: GET_SETTING_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_SETTING_FAIL,
    });
    err = error.message;
  }
  return err;
};

export const getSettingsByItem = item => async (dispatch, getState) => {
  dispatch({
    type: GET_SETTING_START,
  });
  let err = '';
  const query = `
    query getItemSettings($item: String!) {
      apiGetItemSettings(item: $item) {
        success,
        error_code,
        data {
          id,
          item,
          value
        }
      }
    }
  `;
  const variables = {
    item: item,
  };
  try {
    // call webservice
    var result = await fetch({ query, variables })
      .then(res => {
        return res.data.apiGetItemSettings;
      })
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result && result.success) {
      dispatch({
        type: GET_SETTING_SUCCESS,
        data: result.data,
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: GET_SETTING_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_SETTING_FAIL,
    });
    err = error.message;
  }
  return err;
};

export const getCustomerService = () => async (dispatch, getState) => {
  dispatch({
    type: GET_CUSTOMER_SERVICE_START,
  });
  let err = '';
  const query = `
    query getCustomerService {
      apiGetCustomerService {
        success,
        error_code,
        data {
          key,
          text,
          value
        }
      }
    }
  `;
  try {
    // call webservice
    var result = await fetch({ query })
      .then(res => {
        return res.data.apiGetCustomerService;
      })
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result && result.success) {
      dispatch({
        type: GET_CUSTOMER_SERVICE_SUCCESS,
        data: result.data,
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: GET_CUSTOMER_SERVICE_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_CUSTOMER_SERVICE_FAIL,
    });
    err = error.message;
  }
  return err;
};
