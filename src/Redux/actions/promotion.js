import { default as fetch } from '../../Core/fetch/graph.fetch';

/* eslint-disable import/prefer-default-export, new-cap */
import {
  GET_USER_PROMOTION_INFO_START,
  GET_USER_PROMOTION_INFO_SUCCESS,
  GET_USER_PROMOTION_INFO_ERROR,
} from '../constants';

export const getUserPromotionInfo = (amount, fee) => async (
  dispatch,
  getState,
) => {
  dispatch({
    type: GET_USER_PROMOTION_INFO_START,
  });
  let err = '';
  const query = `
    query getUserPromotion {
      apiGetPromotionInfo {
        success,
        error_code,
        data {
          id
          name
          is_enable
          from_amount
          value
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
      result.apiGetPromotionInfo &&
      result.apiGetPromotionInfo.success
    ) {
      dispatch({
        type: GET_USER_PROMOTION_INFO_SUCCESS,
        data: result.apiGetPromotionInfo.data,
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: GET_USER_PROMOTION_INFO_ERROR,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_USER_PROMOTION_INFO_ERROR,
    });
    err = error.message;
  }
  return err;
};
