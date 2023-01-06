/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import ChangePasswordForm from '../Forms/ChangePasswordForm';
import { FormattedMessage } from 'react-intl';

class ChangePassword extends React.Component {
  render() {
    return (
      <div className="row">
        <div className="portlet mt-element-ribbon light portlet-fit bordered paper-3">
          <div className="ribbon ribbon-left ribbon-vertical-left ribbon-shadow ribbon-border-dash-vert ribbon-color-primary uppercase">
            <div className="ribbon-sub ribbon-bookmark" />
            <i className="icon-pencil" />
          </div>
          <div className="portlet-title">
            <div className="caption">
              <span
                className="caption-subject bold uppercase"
                style={{ color: '#c27d0e', paddingLeft: '10px' }}
              >
                <FormattedMessage id="app.changepassword.header.changepass"/>
              </span>
            </div>
          </div>
          <div className="portlet-body">
            <ChangePasswordForm />
          </div>
        </div>
      </div>
    );
  }
}

export default ChangePassword;
