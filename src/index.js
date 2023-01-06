/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { CookiesProvider } from 'react-cookie';
import { ApolloProvider } from 'react-apollo';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import store from './store';
import AuthHelper from './Core/auth-helper';
import { setRuntimeVariable } from './Redux/actions/runtime';
import App from './App';
import ConnectedIntlProvider from '../src/ConnectedIntlProvider';
import { LOGIN_SUCCESS } from './Redux/constants';
import createApolloClient from './Core/create-apollo-client';

store.dispatch(
  setRuntimeVariable({
    name: 'false',
    value: true, // Set it to "true" if want to show loadding background
  }),
);
AuthHelper.getProfile((data, err) => {
  if (!err && data) {
    store.dispatch({
      type: LOGIN_SUCCESS,
      data: data,
    });
  }
  ReactDOM.render(
    <ApolloProvider client={createApolloClient()}>
      <Provider store={store}>
        <MuiThemeProvider
          muiTheme={getMuiTheme({
            userAgent: navigator.userAgent,
            palette: {
              primary1Color: '#ffe41c',
              primary2Color: '#ffe41c',
              textColor: '#999999',
              pickerHeaderColor: '#000',
            },
            snackbar: {
              actionColor: '#ff4081',
              backgroundColor: 'rgba(255, 228, 28, 1)',
              textColor: '#000',
            },
            datePicker: {
              selectColor: '#d38e1f',
              primary1Color: '#d38e1f',
              pickerHeaderColor: '#d38e1f',
              headerColor: '#d38e1f',
              color: '#d38e1f',
            },
            flatButton: {
              primaryTextColor: '#d38e1f',
            },
          })}
        >
          <ConnectedIntlProvider>
            <CookiesProvider>
              <App />
            </CookiesProvider>
          </ConnectedIntlProvider>
        </MuiThemeProvider>
      </Provider>
    </ApolloProvider>,
    document.getElementById('root'),
  );
});

if (window.navigator && navigator.serviceWorker) {
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}
