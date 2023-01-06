import React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';

const NotLoggedInForm = () => (
  <div className="row">
    <div className="col-md-12">
      <div className="row unauthorized-form-section">
        <div className="col-md-12">
          <div className="portlet portlet-fit light bordered paper-3">
            <div className="portlet-title">
              <div className="caption">
                <span className="caption-subject bold uppercase text-center font-red-mint">
                  <FormattedHTMLMessage id="app.notloginyet" />
                </span>
              </div>
            </div>
            <div className="portlet-body">
              <div className="row">
                <div className="col-md-6 text-center">
                  <a
                    href="/login"
                    className="btn btn-circle uppercase bold yellow start-trading-btn"
                  >
                    <i className="fa fa-sign-in" />{' '}
                    <FormattedHTMLMessage id="app.logintobitmoon" />
                  </a>
                </div>
                <div className="col-md-6 text-center">
                  <a
                    href="/register"
                    className="btn btn-circle uppercase bold yellow start-trading-btn"
                  >
                    <i className="fa fa-user" />{' '}
                    <FormattedHTMLMessage id="app.registeratbitmoon" />
                  </a>
                </div>
              </div>
              <div className="clearfix" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default NotLoggedInForm;
