import { Cookies } from 'react-cookie';
import { default as fetch } from '../Core/fetch/graph.fetch';
const cookies = new Cookies();

fetch.use(({ request, options }, next) => {
  if (!options.headers) {
    options.headers = {}; // Create the headers object if needed.
  }
  options.headers['Authorization'] = `Bearer ${cookies.get('uid_btm_token')}`;

  next();
});

const query = `query {
  apiUserProfile {
    id,
    email,
    iu_gender,
    name,
    street_addr,
    city,
    country_id,
    mobile,
    birthday,
    ssn,
    phone,
    state,
    is_active_email,
    is_active_phone,
    is_active_cmnd,
    is_verify_bank,
    is_active_google_auth,
    country_code,
    country,
    is_allow_to_change,
    is_active_google_auth
  }
}`;
const AuthHelper = {
  getProfile: callback => {
    // get user information
    if (cookies.get('uid_btm_token')) {
      // call webservice
      fetch({ query })
        .then(res => {
          if (res.data && res.data.apiUserProfile) {
            callback(res.data.apiUserProfile, null);
          } else {
            callback(null, 'Undefined Error');
            cookies.remove('uid_btm_token', { path: '/' });
          }
        })
        .catch(err => {
          callback(null, err);
        });
    } else {
      callback(null, 'Not login yet');
    }
  },
};

export default AuthHelper;
