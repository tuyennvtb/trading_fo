/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getGoogleAuthCode } from '../Redux/actions/google-auth';
import Link from '../Link';
import { FormattedMessage } from 'react-intl';
import '../assets/css/pages/security.css';

class GoogleAuth extends React.Component {
  render() {
    const { user } = this.props;
    return (
      <div className="row security-page">
        <div className="col-md-12">
          <div className="portlet mt-element-ribbon light portlet-fit bordered paper-3">
            <div className="ribbon ribbon-left ribbon-vertical-left ribbon-shadow ribbon-border-dash-vert ribbon-color-primary uppercase">
              <div className="ribbon-sub ribbon-bookmark" />
              <i className="icon-lock" />
            </div>
            <div className="portlet-title">
              <div className="caption">
                <span
                  className="caption-subject bold uppercase"
                  style={{ color: '#c27d0e', paddingLeft: '10px' }}
                >
                  <FormattedMessage id="app.global.text.security" />
                </span>
              </div>
            </div>
            <div className="portlet-body">
              {user && !user.is_active_google_auth ? (
                <div className="container">
                  <div className="alert alert-warning">
                    <p>
                      <FormattedMessage id="app.googleauth.security" />
                    </p>
                    <br />
                    <p>
                      <Link className="md-btn btn" href="/security/google_auth">
                        <FormattedMessage id="app.googleauth.button.security" />
                      </Link>
                    </p>
                  </div>
                  <div className="clearfix guide">
                    <a
                      className="btn bg-green-jungle font-white"
                      href="https://blog.bitmoon.net/2020/06/16/kich-hoat-2fa-bitmoon/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FormattedMessage id="app.googleauth.button.howtosetup" />
                    </a>
                    <Link
                      className="btn md-btn pull-right"
                      href="/verify-account"
                    >
                      <FormattedMessage id="app.googleauth.button.enablelater" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="alert alert-warning">
                  <p>
                    <FormattedMessage id="app.googleauth.handle.success" />
                  </p>
                  <br />
                  <p>
                    <Link className="md-btn btn" href="/security/handle/false">
                      <FormattedMessage id="app.googleauth.button.disable" />
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ user }) {
  const userProfile = (user && user.profile) || null;
  return {
    user: userProfile,
  };
}

// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ getGoogleAuthCode }, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(GoogleAuth);
