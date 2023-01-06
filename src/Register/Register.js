/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import Link from '../Link';
import RegisterForm from '../Forms/RegisterForm';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { googleCaptchaV3 } from '../Core/config';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

class Register extends React.Component {
  render() {
    return (
      <div className="div-authen-layout paper register">
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
                <li>
                  <Link href="/login">
                    <FormattedMessage id="app.global.login.text" />
                  </Link>
                </li>
                <li className="active">
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
              <FormattedHTMLMessage id="app.login.register.welcome" />
            </span>
          </h4>
          <div className="div-authen-form">
            <GoogleReCaptchaProvider reCaptchaKey={googleCaptchaV3.siteKey}>
              <RegisterForm refererId={this.props.refererId} />
            </GoogleReCaptchaProvider>
          </div>
        </div>
      </div>
    );
  }
}

export default Register;
