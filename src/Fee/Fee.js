/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';

class FeePage extends React.Component {
  render() {
    return (
      <div className="portlet mt-element-ribbon light portlet-fit bordered">
        <div className="portlet-title">
          <div className="caption">
            <h2 className="caption-subject bold uppercase">
              BITMOON SERVICE FEES AND WITHDRAWAL LIMITATIONS
            </h2>
          </div>
        </div>
        <div className="portlet-body">
          <p>
            <strong>Trading Commission</strong>
          </p>
          <p>All trades have a 0.2% commission.</p>
          <p>
            <strong>Requesting Paper Copies</strong>
          </p>
          <p>
            Bitmoon will provide paper copies of electronic correspondence on
            request for a fee. The fee is $10 plus $1 per page for shipping and
            handling to an address within Hong Kong. Shipping outside of Hong
            Kong may incur additional fees.
          </p>
        </div>
      </div>
    );
  }
}

export default FeePage;
