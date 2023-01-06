/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import { FormattedMessage } from 'react-intl';
import Link from '../Link';
import ResetPasswordForm from '../Forms/ResetPasswordForm';
import PropTypes from 'prop-types';

class ResetPassword extends React.Component {
  static propTypes = {
    activationCode: PropTypes.string.isRequired,
  };

  render() {
    const { activationCode } = this.props;
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
            <FormattedMessage id="app.login.resetpassword.welcome" />
          </h4>
          <div className="div-authen-form">
            <ResetPasswordForm activationCode={activationCode} />
          </div>
        </div>
      </div>
    );
  }
}

export default ResetPassword;
