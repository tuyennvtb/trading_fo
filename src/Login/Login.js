/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import Link from '../Link';
import LoginForm from '../Forms/LoginForm';
import { FormattedMessage } from 'react-intl';
import { googleCaptchaV3 } from '../Core/config';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

class Login extends React.Component {

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
            <GoogleReCaptchaProvider reCaptchaKey={googleCaptchaV3.siteKey}>
              <LoginForm />
            </GoogleReCaptchaProvider>
          </div>
        </div>
      </div>
    );
  }
}

export default Login;
