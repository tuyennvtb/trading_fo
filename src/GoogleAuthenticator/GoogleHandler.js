/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import GoogleAuthHandleForm from '../Forms/GoogleAuthHandleForm';

class GoogleHandler extends React.Component {
  render() {
    return (
      <div className="row">
        <div className="col-md-12">
          <div className="portlet mt-element-ribbon light portlet-fit bordered paper-3 ">
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
                  Verify
                </span>
              </div>
            </div>
            <div className="portlet-body">
              <GoogleAuthHandleForm isEnable={this.props.isEnable} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default GoogleHandler;
