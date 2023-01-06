import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { Cookies } from 'react-cookie';
import { createUploadLink } from 'apollo-upload-client';
import { APIEndPoint } from '../Core/config';
import { setContext } from 'apollo-link-context';
const cookies = new Cookies();

const httpLink = createUploadLink({
  uri: APIEndPoint,
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from cookie if it exists
  const token = cookies.get('uid_btm_token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const createApolloClient = (initialState = {}) =>
  new ApolloClient({
    ssrMode: false,
    cache: new InMemoryCache().restore(initialState),
    link: authLink.concat(httpLink),
  });
export default createApolloClient;
