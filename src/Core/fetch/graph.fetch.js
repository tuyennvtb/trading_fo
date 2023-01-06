import { createApolloFetch } from 'apollo-fetch';
import { APIEndPoint, host } from '../../Core/config';
import { Cookies } from 'react-cookie';
import store from '../../store';
import history from '../../history';
import { redirect } from '../../Core/config';

import {
  LOGOUT_SUCCESS,
  CLEAR_WALLET_INFORMATION,
} from '../../Redux/constants';

import { ERRORS } from '../../Helpers/constants/system';
/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

fetch.Promise = Promise;
Response.Promise = Promise;

function localUrl(url) {
  if (url.startsWith('//')) {
    return `https:${url}`;
  }

  if (url.startsWith('http')) {
    return url;
  }

  return `http://${host}${url}`;
}

const uri = localUrl(APIEndPoint);
const apolloFetch = createApolloFetch({ uri });
apolloFetch.useAfter(({ response }, next) => {
  //response.raw will be a non-null string
  //response.parsed may be a FetchResult or undefined
  if (response.parsed) {
    //set parsed response to valid FetchResult
    const errorObject =
      response.parsed.errors && response.parsed.errors.length > 0
        ? JSON.parse(response.parsed.errors[0].message)
        : null;
    if (errorObject && errorObject.reason === ERRORS.INVALID_TOKEN) {
      const cookies = new Cookies();
      cookies.remove('uid_btm_token', { path: '/' });

      // store.dispatch({
      //   type: LOGOUT_SUCCESS,
      // });
      history.push(redirect.noneAuthenticated);
      cookies.set('token_timeout', true, { path: '/' });
      window.location.reload();
    }
    response.parsed = {
      data: response.parsed.data,
      error: errorObject,
    };
  }

  next();
});
export default apolloFetch;
