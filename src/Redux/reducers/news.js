/* eslint-disable import/prefer-default-export, new-cap */
import {
  GET_NEWS_START,
  GET_NEWS_SUCCESS,
  GET_NEWS_FAIL,
  GET_SLIDER_START,
  GET_SLIDER_SUCCESS,
  GET_SLIDER_FAIL,
} from '../constants';

const news = (state = null, action) => {
  switch (action.type) {
    case GET_NEWS_START: {
      return {
        ...state,
      };
    }

    case GET_NEWS_SUCCESS: {
      return {
        ...state,
        id: action.data.id,
        name: action.data.name,
        htmlContent: action.data.html_content,
      };
    }

    case GET_SLIDER_START: {
      return {
        ...state,
      };
    }

    case GET_SLIDER_SUCCESS: {
      return {
        ...state,
        sliderId: action.data.id,
        sliderName: action.data.name,
        sliderContent: action.data.html_content,
      };
    }

    default:
      return state;
  }
};

export default news;
