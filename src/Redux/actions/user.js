import React from 'react';
import { FormattedMessage } from 'react-intl';
import { setRuntimeVariable } from './runtime';
import history from '../../history';
import { Cookies } from 'react-cookie';
import { redirect } from '../../Core/config';
import AuthHelper from '../../Core/auth-helper';
import { default as fetch } from '../../Core/fetch/graph.fetch';
import { ERRORS } from '../../Helpers/constants/system';
/* eslint-disable import/prefer-default-export, new-cap */
import {
  LOGIN_START,
  LOGIN_SUCCESS,
  LOGIN_SUCCESS_NOT_ACTIVE,
  LOGIN_FAIL,
  REGISTER_START,
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  LOGOUT_START,
  LOGOUT_SUCCESS,
  LOGOUT_FAIL,
  FORGOT_PASSWORD_START,
  FORGOT_PASSWORD_SUCCESS,
  FORGOT_PASSWORD_FAIL,
  RESET_PASSWORD_START,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAIL,
  UPDATE_PROFILE_START,
  UPDATE_PROFILE_SUCCESS,
  UPDATE_PROFILE_FAIL,
  CHANGE_PASSWORD_START,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_FAIL,
  ACTIVATE_ACCOUNT_START,
  ACTIVATE_ACCOUNT_SUCCESS,
  ACTIVATE_ACCOUNT_FAIL,
  LOGIN_WITH_GOOGLE_AUTH_START,
  LOGIN_WITH_GOOGLE_AUTH_SUCCESS,
  LOGIN_WITH_GOOGLE_AUTH_FAIL,
  NEWSLETTER_SUBSCRIBE_START,
  NEWSLETTER_SUBSCRIBE_SUCCESS,
  NEWSLETTER_SUBSCRIBE_FAIL,
  CLEAR_WALLET_INFORMATION,
  VERIFY_IMAGE_START,
  VERIFY_IMAGE_SUCCESS,
  VERIFY_IMAGE_FAIL,
  ACTIVE_USER_IP_START,
  ACTIVE_USER_IP_SUCCESS,
  ACTIVE_USER_IP_FAIL,
  GET_REFEREE_LIST_START,
  GET_REFEREE_LIST_SUCCESS,
  GET_REFEREE_LIST_FAIL,
  GET_REFEREE_DETAIL_START,
  GET_REFEREE_DETAIL_SUCCESS,
  GET_REFEREE_DETAIL_FAIL,
  GET_SETTING_START,
  GET_SETTING_SUCCESS,
  GET_SETTING_FAIL,
} from '../constants';

const cookies = new Cookies();

fetch.use(({ request, options }, next) => {
  if (!options.headers) {
    options.headers = {}; // Create the headers object if needed.
  }
  options.headers['Authorization'] = `Bearer ${cookies.get('uid_btm_token')}`;

  next();
});

export const logIn = user => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: LOGIN_START,
  });
  let err = '';
  try {
    const query = `mutation AccountLogin ($email: EmailAddress!, $password: Password!, $rememberDevice: Boolean!, $recaptchaToken: String){
      apiUserLogin (email: $email, password: $password, rememberDevice: $rememberDevice, recaptchaToken: $recaptchaToken) {
        token, user{
              id,
              email,
              name,
              username,
              surname,
              is_activated,
              is_active_google_auth
            }, userFilterDefinitionData {
              id,
              total_bought_times,
              total_sold_times,
              total_bought_amount,
              total_sold_amount
            }
  }
}`;

    const variables = {
      email: user.email || '',
      password: user.password || '',
      rememberDevice: user.rememberDevice || false,
      recaptchaToken: user.recaptchaToken,
    };
    let result = await fetch({
      query,
      variables,
    })
      .then(res => res)
      .catch(err => {
        throw new Error(err.message);
      });
    // dispatch result
    if (result && result.error && !result.error.status) {
      switch (result.error.reason) {
        case ERRORS.USER.INVALID_CREDENTIALS:
          err = <FormattedMessage id="error.account.invalidcredential" />;
          break;
        default:
          err = result.error.reason;
      }
    } else {
      result = result && result.data ? result.data : result;
      if (result && result.apiUserLogin && result.apiUserLogin.user) {
        const cookies = new Cookies();
        dispatch({
          type: LOGIN_SUCCESS,
          data: result.apiUserLogin.user,
        });
        cookies.set(
          'CLIENT_INFO',
          {
            userId: result.apiUserLogin.user.id,
            email: result.apiUserLogin.user.email,
            name: result.apiUserLogin.user.name,
            userFilterData: result.apiUserLogin.userFilterDefinitionData,
          },
          {
            path: '/',
            maxAge: '7200',
          },
        );
        if (result.apiUserLogin.user.is_activated) {
          if (!result.apiUserLogin.user.is_active_google_auth) {
            cookies.set('uid_btm_token', result.apiUserLogin.token, {
              path: '/',
              maxAge: '7200',
            });
            AuthHelper.getProfile((data, err) => {
              console.log(data);
              if (!err && data) {
                dispatch({
                  type: LOGIN_SUCCESS,
                  data: data,
                });
                cookies.set(
                  'CLIENT_INFO',
                  {
                    userId: result.apiUserLogin.user.id,
                    email: result.apiUserLogin.user.email,
                    name: result.apiUserLogin.user.name,
                    birthday: data.birthday,
                    userFilterData:
                      result.apiUserLogin.userFilterDefinitionData,
                  },
                  {
                    path: '/',
                    maxAge: '7200',
                  },
                );
                if (data.is_active_cmnd) {
                  history.push(redirect.default_exchange);
                } else {
                  history.push(redirect.authenticated);
                }
              }
            });
          } else {
            cookies.remove('uid_btm_token', { path: '/' });
          }
        } else {
          dispatch({
            type: LOGIN_SUCCESS_NOT_ACTIVE,
          });
          err = <FormattedMessage id="error.account.inactive" />;
        }
      } else {
        err = <FormattedMessage id="error.account.invalidcredential" />;
        dispatch({
          type: LOGIN_FAIL,
        });
      }
    }
  } catch (error) {
    dispatch({
      type: LOGIN_FAIL,
    });
    err = error.message;
  } finally {
    dispatch(
      setRuntimeVariable({
        name: 'loading',
        value: false,
      }),
    );
  }
  return err;
};

export const getVerifyImages = user => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: VERIFY_IMAGE_START,
  });
  let err = '';
  try {
    const query = `query {
      apiImageList {
        status,
        reason,
        paths {
          ssn_front
          ssn_back
          ssn_selfie
        }
      }
    }`;
    // call webservice
    const result = await fetch({ query })
      .then(res => res.data)
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result && result.apiImageList && result.apiImageList.status) {
      dispatch({
        type: VERIFY_IMAGE_SUCCESS,
        data: result.apiImageList.paths,
      });
    } else {
      err = 'Internet is not stable at the moment. Please try later!';
      dispatch({
        type: VERIFY_IMAGE_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: VERIFY_IMAGE_FAIL,
    });
    err = error.message;
  } finally {
    dispatch(
      setRuntimeVariable({
        name: 'loading',
        value: false,
      }),
    );
  }
  return err;
};

export const logInWithGoogleAuth = (user, googleAuthCode) => async (
  dispatch,
  getState,
) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: LOGIN_WITH_GOOGLE_AUTH_START,
  });
  let err = '';
  try {
    // call webservice
    const query = `mutation LoginWithGoogleAuth ($email: EmailAddress!, $password : Password!, $google_auth_code: String!) {
      apiUserLoginWithGoogleAuth (email : $email, password: $password, google_auth_code: $google_auth_code) {
        token, user {
          id,
          email,
          name,
          username,
          surname,
          is_activated,
          is_active_google_auth
        },  userFilterDefinitionData {
          id,
          total_bought_times,
          total_sold_times,
          total_bought_amount,
          total_sold_amount
        }
      }
    }`;

    const variables = {
      email: user.email || '',
      password: user.password || '',
      google_auth_code: googleAuthCode.googleEnableCode,
    };
    const result = await fetch({
      query,
      variables,
    })
      .then(res => res.data)
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (
      result &&
      result.apiUserLoginWithGoogleAuth &&
      result.apiUserLoginWithGoogleAuth.user
    ) {
      const cookies = new Cookies();
      cookies.set('uid_btm_token', result.apiUserLoginWithGoogleAuth.token, {
        path: '/',
      });
      cookies.set(
        'CLIENT_INFO',
        {
          userId: result.apiUserLoginWithGoogleAuth.user.id,
          email: result.apiUserLoginWithGoogleAuth.user.email,
          name: result.apiUserLoginWithGoogleAuth.user.name,
          birthday: result.apiUserLoginWithGoogleAuth.user.birthday,
          userFilterData:
            result.apiUserLoginWithGoogleAuth.userFilterDefinitionData,
        },
        {
          path: '/',
          maxAge: '7200',
        },
      );
      dispatch({
        type: LOGIN_WITH_GOOGLE_AUTH_SUCCESS,
        data: result.apiUserLoginWithGoogleAuth.user,
      });
      AuthHelper.getProfile((data, err) => {
        if (!err && data) {
          cookies.set(
            'CLIENT_INFO',
            {
              userId: result.apiUserLoginWithGoogleAuth.user.id,
              email: result.apiUserLoginWithGoogleAuth.user.email,
              name: result.apiUserLoginWithGoogleAuth.user.name,
              birthday: data.birthday,
              userFilterData:
                result.apiUserLoginWithGoogleAuth.userFilterDefinitionData,
            },
            {
              path: '/',
              maxAge: '7200',
            },
          );
          dispatch({
            type: LOGIN_WITH_GOOGLE_AUTH_SUCCESS,
            data: data,
          });
        }
      });
      history.push(redirect.authenticated);
    } else {
      err = 'Invalid Google Authentication Code';
      dispatch({
        type: LOGIN_WITH_GOOGLE_AUTH_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: LOGIN_WITH_GOOGLE_AUTH_FAIL,
    });
    err = error.message;
  } finally {
    dispatch(
      setRuntimeVariable({
        name: 'loading',
        value: false,
      }),
    );
  }
  return err;
};

export const register = user => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: REGISTER_START,
  });
  let err = '';
  try {
    // call webservice
    const query = `mutation AccountRegistration ($email: EmailAddress!, $password: Password!, $name:  String!, $password_confirmation: String!, $user_referer_id: String!, $recaptchaToken: String, $referral_resource: String){
      apiUserRegister (email: $email, password: $password, name: $name, password_confirmation: $password_confirmation, user_referer_id: $user_referer_id, recaptchaToken: $recaptchaToken, referral_resource: $referral_resource) {
        status, user{
              id,
              email,
              name,
              username,
              created_at,
              updated_at
            }
  }
}`;

    const variables = {
      email: user.email || '',
      password: user.password || '',
      name: user.name || '',
      password_confirmation: user.confirmPassword || '',
      user_referer_id: user.refererId || '',
      recaptchaToken: user.recaptchaToken,
      referral_resource: user.referral_resource,
    };
    let result = await fetch({ query, variables })
      .then(res => res)
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result && result.error && !result.error.status) {
      switch (result.error.reason) {
        case ERRORS.USER.EMAIL_IS_TAKEN:
          err = <FormattedMessage id="app.user.error.duplicatedemail" />;
          break;
        default:
          err = result.error.reason;
      }
    } else {
      result = result && result.data ? result.data : result;
      if (result && result.apiUserRegister && result.apiUserRegister.user) {
        dispatch({
          type: REGISTER_SUCCESS,
          data: result.apiUserRegister.user,
        });
      } else {
        err =
          result && result.reason
            ? result.reason
            : 'There was an issue occur. Please try later or call to our customer support.';
        dispatch({
          type: REGISTER_FAIL,
        });
      }
    }
  } catch (error) {
    dispatch({
      type: REGISTER_FAIL,
    });
    err = error.message;
  } finally {
    dispatch(
      setRuntimeVariable({
        name: 'loading',
        value: false,
      }),
    );
  }
  return err;
};

export const activeUserIP = user => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: ACTIVE_USER_IP_START,
  });
  let err = '';
  try {
    // call webservice
    const query = `mutation UpdateProfile($userId: ID!, $ip: String) {
      apiUserActiveIp(userId: $userId, ip: $ip) {
        status,
        reason
      }
    }`;

    const variables = {
      userId: user.userId || '',
      ip: user.ip || '',
    };
    const result = await fetch({ query, variables })
      .then(res => res.data)
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result && result.apiUserActiveIp && result.apiUserActiveIp.status) {
      dispatch({
        type: ACTIVE_USER_IP_SUCCESS,
        data: result.apiUserActiveIp.status,
      });
    } else {
      err =
        result && result.apiUserActiveIp && result.apiUserActiveIp.reason
          ? result.apiUserActiveIp.reason
          : 'There was an issue occur. Please try later or call to our customer support.';
      dispatch({
        type: ACTIVE_USER_IP_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: ACTIVE_USER_IP_FAIL,
    });
    err = error.message;
  } finally {
    dispatch(
      setRuntimeVariable({
        name: 'loading',
        value: false,
      }),
    );
  }
  return err;
};

export const logOut = user => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: LOGOUT_START,
  });
  let err = '';
  const cookies = new Cookies();
  try {
    // call webservice
    const query = `mutation {
      apiUserLogout {
        status,
        reason
      }
    }`;
    fetch.use(({ request, options }, next) => {
      if (!options.headers) {
        options.headers = {}; // Create the headers object if needed.
      }
      options.headers['Authorization'] = `Bearer ${cookies.get(
        'uid_btm_token',
      )}`;

      next();
    });

    await fetch({ query })
      .then(res => res.data)
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    cookies.remove('uid_btm_token', { path: '/' });
    dispatch({
      type: LOGOUT_SUCCESS,
    });
    dispatch({
      type: CLEAR_WALLET_INFORMATION,
    });
    history.push(redirect.home);
  } catch (error) {
    dispatch({
      type: LOGOUT_FAIL,
    });
    err = error.message;
  } finally {
    dispatch(
      setRuntimeVariable({
        name: 'loading',
        value: false,
      }),
    );
  }
  return err;
};

export const forceLogOut = user => (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: LOGOUT_START,
  });
  let err = '';
  try {
    const cookies = new Cookies();
    cookies.remove('uid_btm_token', { path: '/' });
    dispatch({
      type: LOGOUT_SUCCESS,
    });
    dispatch({
      type: CLEAR_WALLET_INFORMATION,
    });
    history.push(redirect.home);
  } catch (error) {
    dispatch({
      type: LOGOUT_FAIL,
    });
    err = error.message;
  } finally {
    dispatch(
      setRuntimeVariable({
        name: 'loading',
        value: false,
      }),
    );
  }
  return err;
};

export const forgotPassword = user => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: FORGOT_PASSWORD_START,
  });
  let err = '';
  const query = `mutation ForgotPassword ($email: EmailAddress!) {
    apiUserForgotPassword (email : $email) {
     status,
      data {
        name
        code
        url
      }
    }
  }`;

  const variables = {
    email: user.email || '',
  };
  try {
    // call webservice
    const result = await fetch({ query, variables })
      .then(res => res.data)
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (
      result &&
      result.apiUserForgotPassword &&
      result.apiUserForgotPassword.data
    ) {
      dispatch({
        type: FORGOT_PASSWORD_SUCCESS,
        data: result.apiUserForgotPassword.data,
      });
      history.push(redirect.resetPassword);
    } else {
      err =
        result &&
        result.apiUserForgotPassword &&
        result.apiUserForgotPassword.reason
          ? result.apiUserForgotPassword.reason
          : 'There was an issue occur. Please try later or call to our customer support.';
      dispatch({
        type: FORGOT_PASSWORD_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: FORGOT_PASSWORD_FAIL,
    });
    err = error.message;
  } finally {
    dispatch(
      setRuntimeVariable({
        name: 'loading',
        value: false,
      }),
    );
  }
  return err;
};

export const resetPassword = user => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: RESET_PASSWORD_START,
  });
  let err = '';
  const query = `mutation ResetPassword ($code: String!, $password: Password!) {
    apiUserResetPassword (code : $code, password: $password) {
     status,
     reason
    }
  }
  `;
  const variables = {
    code: user.activationCode || '',
    password: user.password || '',
  };
  try {
    // call webservice
    const result = await fetch({ query, variables })
      .then(res => res.data)
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (
      result &&
      result.apiUserResetPassword &&
      result.apiUserResetPassword.status
    ) {
      dispatch({
        type: RESET_PASSWORD_SUCCESS,
        data: result.status,
      });
      cookies.set('redirect_from_resetpassword', true, { path: '/' });
      history.push(redirect.noneAuthenticated);
    } else {
      err =
        result && result.apiUserResetPassword.reason
          ? result.apiUserResetPassword.reason
          : 'There was an issue occur. Please try later or call to our customer support.';
      dispatch({
        type: RESET_PASSWORD_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: RESET_PASSWORD_FAIL,
    });
    err = error.message;
  } finally {
    dispatch(
      setRuntimeVariable({
        name: 'loading',
        value: false,
      }),
    );
  }
  return err;
};

export const updateProfile = user => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: UPDATE_PROFILE_START,
  });
  const query = `mutation UpdateProfile($name: String, $iu_gender: String, $street_addr: String, $city: String, $state: String, $country_code: String, $mobile: String, $birthday: String, $ssn: String, $phone: String) {
    apiUserProfileUpdate(name: $name, iu_gender: $iu_gender, street_addr: $street_addr, city: $city, state: $state, country_code: $country_code, mobile: $mobile, birthday: $birthday, ssn: $ssn, phone: $phone) {
      status,
      reason,
      user_info {
        id,
        email,
        name,
        iu_gender,
        mobile,
        is_active_email,
        is_active_phone,
        is_active_cmnd,
        is_verify_bank,
        birthday,
        ssn,
        street_addr,
        country_code,
        city,
        phone,
        is_active_google_auth,
        state,
        country,
        is_allow_to_change
      }
    }
  }`;
  const variables = {
    name: user.name || '',
    email: user.email || '',
    birthday: user.user_birthday || '',
    mobile: user.mobile || '',
    city: user.city || '',
    street_addr: user.street_addr || '',
    state: user.state || '',
    country_code: user.country_code || user.country,
    ssn: user.ssn || '',
  };
  let err = '';

  try {
    // call webservice
    let result = await fetch({ query, variables })
      .then(res => res)
      .catch(err => {
        throw new Error(err.message);
      });
    // dispatch result
    if (result && result.error && !result.error.status) {
      switch (result.error.reason) {
        case ERRORS.USER.DUPLICATE_PHONE_NUMBER:
          err = <FormattedMessage id="error.account.duplicate.phonenumber" />;
          break;
        case ERRORS.USER.DUPLICATE_SSN:
          err = <FormattedMessage id="error.account.duplicate.ssn" />;
          break;
        default:
          err = result.error.reason;
      }
    } else {
      result = result && result.data ? result.data : result;
      if (
        result &&
        result.apiUserProfileUpdate &&
        result.apiUserProfileUpdate.user_info
      ) {
        dispatch({
          type: UPDATE_PROFILE_SUCCESS,
          data: result.apiUserProfileUpdate.user_info,
        });
        //history.push(redirect.authenticated);
      } else {
        err =
          result &&
          result.apiUserProfileUpdate &&
          result.apiUserProfileUpdate.reason
            ? result.apiUserProfileUpdate.reason
            : 'There was an issue occur. Please try later or call to our customer support.';
        dispatch({
          type: UPDATE_PROFILE_FAIL,
        });
      }
    }
  } catch (error) {
    dispatch({
      type: UPDATE_PROFILE_FAIL,
    });
    err = error.message;
  } finally {
    dispatch(
      setRuntimeVariable({
        name: 'loading',
        value: false,
      }),
    );
  }
  return err;
};

export const changePassword = user => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: CHANGE_PASSWORD_START,
  });
  const query = `mutation AccountChangePassword ($password: Password!, $old_password: Password!){
    apiUserChangePassword (password: $password, old_password: $old_password) {
      status,
      reason
}
}`;

  const variables = {
    old_password: user.password || '',
    password: user.newPassword || '',
  };
  let err = '';

  try {
    // call webservice
    const result = await fetch({ query, variables })
      .then(res => res.data)
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (
      result &&
      result.apiUserChangePassword &&
      result.apiUserChangePassword.status
    ) {
      dispatch({
        type: CHANGE_PASSWORD_SUCCESS,
        data: result.apiUserChangePassword.status,
      });
    } else {
      err =
        result && result.apiUserChangePassword.reason
          ? result.result.apiUserChangePassword
          : 'There was an issue occur. Please try later or call to our customer support.';
      dispatch({
        type: UPDATE_PROFILE_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: CHANGE_PASSWORD_FAIL,
    });
    err = error.message;
  } finally {
    dispatch(
      setRuntimeVariable({
        name: 'loading',
        value: false,
      }),
    );
  }
  return err;
};

export const verifyAccount = user => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );

  let err = '';
  const query = `mutation VerifyAccount($ssn: SSNPackageInput!) {
    apiVerifyUser(ssn: $ssn) {
      status
      reason
      paths {
        ssn_front
        ssn_back
        ssn_selfie
      }
    }
  }`;
  try {
    if (user && user.images) {
      if (
        user.images.ssn_back &&
        user.images.ssn_front &&
        user.images.ssn_selfie
      ) {
        // call webservice
        await fetch({ query, variables: { ssn: user.images } })
          .then(res => res.data)
          .catch(err => {
            throw new Error(err.message);
          });
      }
    }
  } catch (error) {
    dispatch({
      type: VERIFY_IMAGE_FAIL,
    });
    err = error.message;
  } finally {
    dispatch(
      setRuntimeVariable({
        name: 'loading',
        value: false,
      }),
    );
  }
  return err;
};

export const activateAccount = activationCode => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: ACTIVATE_ACCOUNT_START,
  });
  let err = '';
  const query = `mutation ActiveUser($code: String!) {
    apiUserActiveUser(code: $code) {
      status,
      user {
        id
      }
    }
  }`;
  const variables = {
    code: activationCode,
  };
  try {
    // call webservice
    const result = await fetch({ query, variables })
      .then(res => res.data)
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result && result.apiUserActiveUser && result.apiUserActiveUser.status) {
      dispatch({
        type: ACTIVATE_ACCOUNT_SUCCESS,
        data: result.apiUserActiveUser.user,
      });
    } else {
      err =
        result && result.reason
          ? result.reason
          : 'There was an issue occur. Please try later or call to our customer support.';
      dispatch({
        type: ACTIVATE_ACCOUNT_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: ACTIVATE_ACCOUNT_FAIL,
    });
    err = error.message;
  } finally {
    dispatch(
      setRuntimeVariable({
        name: 'loading',
        value: false,
      }),
    );
  }
  return err;
};

export const newsletterSubscribe = user => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: NEWSLETTER_SUBSCRIBE_START,
  });
  let err = '';
  const query = `mutation NewsletterSubscribe ($email: EmailAddress!) {
    apiNewsletterSubscribe(email: $email) {
      status,
      reason
    }
  }`;
  const variables = {
    email: user.email || '',
  };
  try {
    // call webservice
    const result = await fetch({ query, variables })
      .then(res => res.data)
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (
      result &&
      result.apiNewsletterSubscribe &&
      result.apiNewsletterSubscribe.status
    ) {
      dispatch({
        type: NEWSLETTER_SUBSCRIBE_SUCCESS,
      });
    } else {
      err =
        result && result.reason
          ? result.reason
          : 'There was an issue occur. Please try later or call to our customer support.';
      dispatch({
        type: NEWSLETTER_SUBSCRIBE_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: NEWSLETTER_SUBSCRIBE_FAIL,
    });
    err = error.message;
  } finally {
    dispatch(
      setRuntimeVariable({
        name: 'loading',
        value: false,
      }),
    );
  }
  return err;
};
export const getUserRefereeList = () => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: GET_REFEREE_LIST_START,
  });
  let err = '';
  const query = `{
    apiUserRefereeList {
      success
      reason
      data {
        id,
        email,
        user_id,
        user_referer_id,
        bonus_amount,
        created_at,
        updated_at,
        deleted_at
      }
    }
  }
  `;
  try {
    // call webservice
    const result = await fetch({ query })
      .then(res => res.data)
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (
      result &&
      result.apiUserRefereeList &&
      result.apiUserRefereeList.data.length > 0
    ) {
      dispatch({
        type: GET_REFEREE_LIST_SUCCESS,
        data: result.apiUserRefereeList.data,
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: GET_REFEREE_LIST_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_REFEREE_LIST_FAIL,
    });
    err = error.message;
  } finally {
    dispatch(
      setRuntimeVariable({
        name: 'loading',
        value: false,
      }),
    );
  }
  return err;
};
export const getUserRefereeDetail = () => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: GET_REFEREE_DETAIL_START,
  });
  let err = '';
  const query = `{
    apiUserRefereeDetail {
      success
      reason
      data {
        id,
        user_id,
        user_referer_id,
        reference_id,
        bonus_amount,
        created_at,
        updated_at,
        deleted_at
      }
    }
  }
  `;
  try {
    // call webservice
    const result = await fetch({ query })
      .then(res => res.data)
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (
      result &&
      result.apiUserRefereeDetail &&
      result.apiUserRefereeDetail.data.length > 0
    ) {
      dispatch({
        type: GET_REFEREE_DETAIL_SUCCESS,
        data: result.apiUserRefereeDetail.data,
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: GET_REFEREE_DETAIL_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: GET_REFEREE_DETAIL_FAIL,
    });
    err = error.message;
  } finally {
    dispatch(
      setRuntimeVariable({
        name: 'loading',
        value: false,
      }),
    );
  }
  return err;
};

export const getUserSettings = () => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: GET_SETTING_START,
  });
  let err = '';
  const query = `{
    apiWalletSettings {
      status
      reason
      data {
        id,
        name,
        setting_json,
        is_enable,
        created_at,
        updated_at,
        deleted_at
      }
    }
  }
  `;
  try {
    // call webservice
    const result = await fetch({ query })
      .then(res => res.data)
      .catch(err => {
        throw new Error(err.message);
      });

    // dispatch result
    if (result && result.apiWalletSettings && result.apiWalletSettings.status) {
      dispatch({
        type: GET_SETTING_SUCCESS,
        data: result.apiWalletSettings.data,
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
  } finally {
    dispatch(
      setRuntimeVariable({
        name: 'loading',
        value: false,
      }),
    );
  }
  return err;
};
