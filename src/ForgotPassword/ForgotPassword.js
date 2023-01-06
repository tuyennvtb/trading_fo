/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import { FormattedMessage } from 'react-intl';
import Link from '../Link';
import ForgotPasswordForm from '../Forms/ForgotPasswordForm';

class ForgotPassword extends React.Component {
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
          </div>
        </nav>

        <div className="text-center" id="div-binding-container">
          <h4 className="h4-title">
          <FormattedMessage id="app.login.forgotpassword.welcome" />
          </h4>
          <div className="div-authen-form">
            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    );
  }
}

export default ForgotPassword;
