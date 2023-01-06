/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import VerifyAccountForm from '../Forms/VerifyAccountForm';
import UserProfile from '../Processing/UserProfileHOC.js';
import UserWarningMessage from '../Processing/UserWarningMessageOC';
import { FormattedMessage } from 'react-intl';
import ToastNotification from '../Processing/ToastNotification.js';
import '../assets/css/pages/verify_account.css';

class VerifyAccount extends React.Component {
  render() {
    return (
      <div className="row">
        <div className="col-md-12">
          <div className="portlet mt-element-ribbon light portlet-fit bordered paper-3">
            <div className="ribbon ribbon-left ribbon-vertical-left ribbon-shadow ribbon-border-dash-vert ribbon-color-primary uppercase">
              <div className="ribbon-sub ribbon-bookmark" />
              <i className="fa fa-user" />
            </div>
            <div className="portlet-title">
              <div className="caption">
                <span
                  className="caption-subject bold uppercase"
                  style={{ color: '#c27d0e', paddingLeft: '10px' }}
                >
                  <FormattedMessage id="app.profile.header.verify" />
                </span>
              </div>
            </div>
            <div className="portlet-body">
              <VerifyAccountForm />
            </div>
          </div>
        </div>
        <ToastNotification />
      </div>
    );
  }
}

export default UserProfile(UserWarningMessage(VerifyAccount));
