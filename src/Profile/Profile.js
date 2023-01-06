/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import ProfileForm from '../Forms/ProfileForm';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import { passwordMask, passwordMaskPhoneField } from '../Helpers/utils';
import UserWarningMessage from '../Processing/UserWarningMessageOC';
class Profile extends React.Component {
  static propTypes = {
    user: PropTypes.object,
  };

  static defaultProps = {
    user: null,
  };

  render() {
    const { user } = this.props;

    const isAllowToChange = !!(user && user.is_allow_to_change);
    if (user) {
      if (user.birthday) {
        user.birthday = moment(user.birthday).format('DD/MM/YYYY');
      }
      if (!isAllowToChange) {
        if (user.mobile) {
          user.mobile = passwordMaskPhoneField(user.mobile);
        }
        if (user.ssn) {
          user.ssn = passwordMask(user.ssn);
        }
        if (user.street_addr) {
          user.street_addr = passwordMask(user.street_addr);
        }
      }
    }

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
                  <FormattedMessage id="app.profile.header.myprofile" />
                </span>
              </div>
            </div>
            <div className="portlet-body">
              <ProfileForm isAllowToChange={isAllowToChange} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ user }) {
  const userData = (user && user.profile) || null;
  return {
    user: userData,
  };
}

export default connect(mapStateToProps, null)(UserWarningMessage(Profile));
