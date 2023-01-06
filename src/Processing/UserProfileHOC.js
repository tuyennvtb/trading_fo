/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import ModalDialog from '../Processing/ModalDialog';
import { ACCOUNT_STATUS } from '../Helpers/constants/system';
import Link from '../Link';

function UserProfileHOC(ComposedComponent) {
  class UserVerification extends React.Component {
    renderVerifyDialog() {
      const { user } = this.props;
      if (user && user.is_allow_to_change !== ACCOUNT_STATUS.isProfileUpdated) {
        return (
          <ModalDialog isOpen={true}>
            <div className="portlet light bordered modal-dialog-content clearfix">
              <div className="portlet-title">
                <div className="caption">
                  <span className="caption-subject font-dark bold uppercase">
                    <i className="icon-lock" />{' '}
                    <FormattedMessage id="app.global.accountnotupdated" />
                  </span>
                </div>
              </div>
              <div className="portlet-body">
                <p>
                  <FormattedMessage id="app.global.accountnotupdated.description" />
                </p>
                <Link href="/profile" className="btn md-btn pull-right">
                  <i className="fa fa-check-circle" />{' '}
                  <FormattedMessage id="app.profile.button.update" />
                </Link>
              </div>
            </div>
          </ModalDialog>
        );
      }
    }
    render() {
      return (
        <div>
          {this.renderVerifyDialog()}
          <ComposedComponent {...this.props} />
        </div>
      );
    }
  }
  return connect(mapStateToProps, null)(UserVerification);
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ wallet, user: { profile } }) {
  return {
    user: profile,
  };
}

export default UserProfileHOC;
