/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';

class Risk extends React.Component {
  render() {
    return (
      <div className="portlet mt-element-ribbon light portlet-fit bordered">
        <div className="portlet-title">
          <div className="caption">
            <h2 className="caption-subject bold uppercase">
              <FormattedMessage id="app.footer.link.risk" />
            </h2>
          </div>
        </div>
        <div className="portlet-body">
          <FormattedHTMLMessage id="v2.staticpage.risk" />
        </div>
      </div>
    );
  }
}

export default Risk;
