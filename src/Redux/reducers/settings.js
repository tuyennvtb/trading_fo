/* eslint-disable import/prefer-default-export, new-cap */
import {
  GET_SETTING_START,
  GET_SETTING_SUCCESS,
  GET_SETTING_FAIL,
  GET_CUSTOMER_SERVICE_START,
  GET_CUSTOMER_SERVICE_SUCCESS,
  GET_CUSTOMER_SERVICE_FAIL,
} from '../constants';

import { isJson } from '../../Helpers/utils';

const settings = (state = null, action) => {
  switch (action.type) {
    case GET_SETTING_START: {
      return {
        ...state,
      };
    }

    case GET_CUSTOMER_SERVICE_START:
    case GET_CUSTOMER_SERVICE_FAIL: {
      return {
        ...state,
        customerService: [],
      }
    }

    case GET_SETTING_SUCCESS: {
      let valueJSON = action.data.value;
      if (isJson(action.data.value)) {
        valueJSON = JSON.parse(action.data.value);
      }
      return {
        ...state,
        id: action.data.id,
        item: action.data.item,
        value: valueJSON,
      };
    }

    case GET_SETTING_FAIL: {
      return {
        ...state,
        id: null,
        item: null,
        value: null,
      };
    }

    case GET_CUSTOMER_SERVICE_SUCCESS: {
      let data = Array.isArray(action.data) ? action.data : []
      return {
        ...state,
        customerService: data,
      }
    }

    default:
      return state;
  }
};

export default settings;
