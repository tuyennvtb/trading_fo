/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
class ReferralWidget extends React.Component {
  render() {
    const { user_id, size } = this.props;
    const domain = `${window.location.protocol}//${window.location.host}`;
    return (
      <div className="referral widget">
        <a href={`${domain}/register/referer/${user_id}`} target="_blank">
          <img
            className="img-responsive lazy"
            src={`${domain}/assets/global/img/bitmoon/bitmoon_ref_${size}.png`}
            alt="bitmoon-referral"
          />
        </a>
      </div>
    );
  }
}

export default ReferralWidget;
