/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import { FormattedHTMLMessage } from 'react-intl';

class AboutPage extends React.Component {
  render() {
    return (
      <div className="portlet mt-element-ribbon light portlet-fit bordered">
        <div className="portlet-title">
          <div className="caption">
            <h2 className="caption-subject bold uppercase">
              Bitmoon, LLC PRIVACY POLICY
            </h2>
          </div>
        </div>
        <div className="portlet-body">
          <FormattedHTMLMessage id="v2.staticpage.privacy" />
        </div>
      </div>
    );
  }
}

export default AboutPage;
