/* eslint-disable import/prefer-default-export, new-cap */
import {
  LOGIN_START,
  LOGIN_SUCCESS,
  LOGIN_SUCCESS_NOT_ACTIVE,
  LOGIN_FAIL,
  LOGOUT_START,
  LOGOUT_SUCCESS,
  LOGOUT_FAIL,
  REGISTER_START,
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  UPDATE_USER_START,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_FAIL,
  UPLOAD_AVATAR_START,
  UPLOAD_AVATAR_SUCCESS,
  UPLOAD_AVATAR_FAIL,
  UPDATE_PROFILE_START,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAIL,
  ACTIVATE_ACCOUNT_SUCCESS,
  LOGIN_WITH_GOOGLE_AUTH_SUCCESS,
  GOOGLE_AUTH_HANDLE_SUCCESS,
  VERIFY_IMAGE_START,
  VERIFY_IMAGE_SUCCESS,
  VERIFY_IMAGE_FAIL,
  ACTIVE_USER_IP_SUCCESS,
  GET_REFEREE_LIST_SUCCESS,
  GET_REFEREE_DETAIL_SUCCESS,
  GET_SETTING_SUCCESS,
} from '../constants';

const user = (state = null, action) => {
  switch (action.type) {
    case LOGIN_START: {
      return {
        ...state,
        authenticated: false,
        profile: null,
      };
    }

    case LOGIN_SUCCESS: {
      return {
        ...state,
        authenticated: true,
        profile: action.data,
      };
    }

    case LOGIN_SUCCESS_NOT_ACTIVE: {
      return {
        ...state,
        authenticated: false,
        profile: {
          ...state.profile,
          is_activated: false,
        },
      };
    }

    case LOGIN_FAIL: {
      return {
        ...state,
        authenticated: false,
        profile: null,
      };
    }

    case VERIFY_IMAGE_START: {
      return {
        ...state,
        document: null,
      };
    }

    case VERIFY_IMAGE_SUCCESS: {
      return {
        ...state,
        document: action.data,
      };
    }

    case VERIFY_IMAGE_FAIL: {
      return {
        ...state,
        document: null,
      };
    }

    case LOGOUT_START: {
      return {
        ...state,
        authenticated: true,
      };
    }

    case LOGOUT_SUCCESS: {
      return {
        ...state,
        authenticated: false,
        profile: null,
      };
    }

    case LOGOUT_FAIL: {
      return {
        ...state,
        authenticated: true,
      };
    }

    case REGISTER_START: {
      return {
        ...state,
        authenticated: false,
        profile: null,
      };
    }

    case REGISTER_SUCCESS: {
      return {
        ...state,
        authenticated: false,
        profile: action.data,
      };
    }

    case REGISTER_FAIL: {
      return {
        ...state,
        authenticated: false,
        profile: null,
      };
    }

    case UPDATE_USER_START: {
      return {
        ...state,
        authenticated: true,
      };
    }

    case UPDATE_USER_SUCCESS: {
      return {
        ...state,
        authenticated: true,
        profile: action.data,
      };
    }

    case UPDATE_USER_FAIL: {
      return {
        ...state,
        authenticated: true,
      };
    }
    case UPLOAD_AVATAR_START: {
      return {
        ...state,
        authenticated: true,
      };
    }

    case UPLOAD_AVATAR_SUCCESS: {
      return {
        ...state,
        authenticated: true,
        profile: action.data,
      };
    }

    case UPLOAD_AVATAR_FAIL: {
      return {
        ...state,
        authenticated: true,
      };
    }
    case UPDATE_PROFILE_START: {
      return {
        ...state,
        authenticated: true,
      };
    }

    case UPDATE_PROFILE_SUCCESS: {
      return {
        ...state,
        authenticated: true,
        profile: action.data,
      };
    }

    case UPDATE_PROFILE_FAIL: {
      return {
        ...state,
        authenticated: true,
      };
    }

    case ACTIVATE_ACCOUNT_SUCCESS: {
      return {
        ...state,
        profile: action.data,
      };
    }
    case ACTIVE_USER_IP_SUCCESS: {
      return {
        ...state,
        profile: { ...state.profile, is_ip_whitelist: action.data },
      };
    }
    case LOGIN_WITH_GOOGLE_AUTH_SUCCESS: {
      return {
        ...state,
        profile: action.data,
        authenticated: true,
      };
    }
    case GOOGLE_AUTH_HANDLE_SUCCESS: {
      return {
        ...state,
        profile: { ...state.profile, is_active_google_auth: action.data },
      };
    }
    case GET_REFEREE_LIST_SUCCESS: {
      return {
        ...state,
        refereeList: action.data,
      };
    }
    case GET_REFEREE_DETAIL_SUCCESS: {
      return {
        ...state,
        refereeDetail: action.data,
      };
    }
    case GET_SETTING_SUCCESS: {
      return {
        ...state,
        userSetting: action.data,
      };
    }
    default:
      return state;
  }
};

export default user;
