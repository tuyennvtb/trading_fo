/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import Link from '../Link';
import LoginForm from '../Forms/LoginForm';
import Authentication from '../Helpers/RequireGoogle2FA';
import GoogleAuthHandleForm from '../Forms/GoogleAuthHandleForm';
import { FormattedMessage } from 'react-intl';

class LoginWithGoogleAuth extends React.Component {
  render() {
    return (
      <div className="div-authen-layout paper login">
        <nav className="navbar">
          <div className="">
            <div className="navbar-header">
              <Link href="/">
                <img
                  src="/assets/global/img/bitmoon/logo.png"
                  alt="logo"
                  className="logo-default lazy"
                />
              </Link>
            </div>
            <div className="collapse navbar-collapse" id="navigation-uch-menu">
              <ul className="nav navbar-nav register-navbar-ul">
                <li className="active">
                  <Link href="/login">
                    <FormattedMessage id="app.global.login.text" />
                  </Link>
                </li>
                <li>
                  <Link href="/register">
                    <FormattedMessage id="app.global.register.text" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="text-center" id="div-binding-container">
          <h4 className="h4-title">
            <span>
              <FormattedMessage id="app.login.login.welcome" />
            </span>
          </h4>
          <div className="div-authen-form">
            <LoginForm />
            <GoogleAuthHandleForm />
          </div>
        </div>
      </div>
    );
  }
}

export default Authentication(LoginWithGoogleAuth);
