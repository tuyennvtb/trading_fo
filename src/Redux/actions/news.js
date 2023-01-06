import { default as fetch } from '../../Core/fetch/graph.fetch';

/* eslint-disable import/prefer-default-export, new-cap */
import {
  GET_NEWS_START,
  GET_NEWS_SUCCESS,
  GET_NEWS_FAIL,
  GET_SLIDER_START,
  GET_SLIDER_SUCCESS,
  GET_SLIDER_FAIL,
} from '../constants';

export const getNewsByID = id => async (dispatch, getState) => {
  dispatch({
    type: GET_NEWS_START,
  });
  let err = '';
  const query = `
    query getNews($id: Int!) {
      apiGetNews(id: $id) {
        success,
        error_code,
        data {
          id,
          name,
          html_content
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
        return res.data.apiGetNews;
      })
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result && result.success) {
      dispatch({
        type: GET_NEWS_SUCCESS,
        data: result.data,
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: GET_NEWS_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_NEWS_FAIL,
    });
    err = error.message;
  }
  return err;
};

export const getSliderById = id => async (dispatch, getState) => {
  dispatch({
    type: GET_SLIDER_START,
  });
  let err = '';
  const query = `
    query getSlider($id: Int!) {
      apiGetNews(id: $id) {
        success,
        error_code,
        data {
          id,
          name,
          html_content
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
        return res.data.apiGetNews;
      })
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result && result.success) {
      dispatch({
        type: GET_SLIDER_SUCCESS,
        data: result.data,
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: GET_SLIDER_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_SLIDER_FAIL,
    });
    err = error.message;
  }
  return err;
};
