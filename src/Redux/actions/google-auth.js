// eslint-disable-next-line
import React from 'react';
import { Cookies } from 'react-cookie';
import history from '../../history';
import { setRuntimeVariable } from './runtime';
//import fetch from '../../Core/fetch';
import { redirect } from '../../Core/config';
import { default as fetch } from '../../Core/fetch/graph.fetch';
import { FormattedMessage } from 'react-intl';

/* eslint-disable import/prefer-default-export, new-cap */
import {
  GOOGLE_AUTH_GENERATE_START,
  GOOGLE_AUTH_GENERATE_SUCCESS,
  GOOGLE_AUTH_GENERATE_FAIL,
  GOOGLE_AUTH_HANDLE_START,
  GOOGLE_AUTH_HANDLE_SUCCESS,
  GOOGLE_AUTH_HANDLE_FAIL,
} from '../constants';

const cookies = new Cookies();

fetch.use(({ request, options }, next) => {
  if (!options.headers) {
    options.headers = {}; // Create the headers object if needed.
  }
  options.headers['Authorization'] = `Bearer ${cookies.get('uid_btm_token')}`;

  next();
});

export const getGoogleAuthCode = () => async (dispatch, getState) => {
  dispatch(
    setRuntimeVariable({
      name: 'loading',
      value: true,
    }),
  );
  dispatch({
    type: GOOGLE_AUTH_GENERATE_START,
  });
  let err = '';
  const query = `mutation  {
    apiGoogle2faGeneralCode {
      status,
      secret,
      url
    }
  }`;
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
      result.apiGoogle2faGeneralCode &&
      result.apiGoogle2faGeneralCode.status
    ) {
      dispatch({
        type: GOOGLE_AUTH_GENERATE_SUCCESS,
        data: result.apiGoogle2faGeneralCode,
      });
    } else {
      err = 'The internet connection is down, please try later.';
      dispatch({
        type: GOOGLE_AUTH_GENERATE_FAIL,
      });
    }
  } catch (error) {
    dispatch({
      type: GOOGLE_AUTH_GENERATE_FAIL,
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

export const handleGoogleAuth = (enable, value) => async (
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
    type: GOOGLE_AUTH_HANDLE_START,
  });
  let err = '';
  const query = `mutation GoogleAuthHandler ($status: Boolean!, $google_auth_code :String!){
    apiGoogle2faHandle (status : $status, google_auth_code: $google_auth_code) {
      status,
      reason
    }
  }
  `;
  const variables = {
    status: enable === 'true',
    google_auth_code: value.googleEnableCode || '',
  };
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
        case 'WRONG_GOOGLE_AUTH':
          err = <FormattedMessage id="error.account.wrong_gg2fa_code" />;
          break;
        default:
          err = result.error.reason;
          dispatch({
            type: GOOGLE_AUTH_HANDLE_FAIL,
          });
      }
    } else {
      result = result && result.data ? result.data : result;
      if (
        result &&
        result.apiGoogle2faHandle &&
        result.apiGoogle2faHandle.status
      ) {
        dispatch({
          type: GOOGLE_AUTH_HANDLE_SUCCESS,
          data: enable === 'true',
        });
        history.push(redirect.google_auth);
      } else {
        err = <FormattedMessage id="system.error.global" />;
        dispatch({
          type: GOOGLE_AUTH_HANDLE_FAIL,
        });
      }
    }
  } catch (error) {
    dispatch({
      type: GOOGLE_AUTH_HANDLE_FAIL,
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

// export const replyTicket = (ticket, ticketID) => async (dispatch, getState) => {
//   dispatch(
//     setRuntimeVariable({
//       name: 'loading',
//       value: true,
//     }),
//   );
//   dispatch({
//     type: REPLY_TICKETS_START,
//   });
//   let err = '';
//   const cookies = new Cookies();
//   try {
//     // call webservice
//     const result = await fetch(APIServices.replyTicket, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${cookies.get('uid_btm_token')}`
//       },
//       body: JSON.stringify({
//         ticket_id: ticketID || '',
//         content: ticket.content || ''
//       })
//     })
//       .then(res => res.json())
//       .catch(err => {
//         throw new Error(err.message);
//       });
//     // dispatch result
//     if (result && result.status) {
//       dispatch({
//         type: REPLY_TICKETS_SUCCESS,
//         data: result,
//       });
//     } else {
//       err = 'The internet connection is down, please try later.';
//       dispatch({
//         type: REPLY_TICKETS_FAIL,
//       });
//     }
//   } catch (error) {
//     dispatch({
//       type: REPLY_TICKETS_FAIL,
//     });
//     err = error.message;
//   } finally {
//     dispatch(
//       setRuntimeVariable({
//         name: 'loading',
//         value: false,
//       }),
//     );
//   }
//   return err;
// };
