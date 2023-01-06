/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

function UserWarningMessageHOC(ComposedComponent) {
  class UserVerification extends React.Component {
    render() {
      return (
        <div>
          <div className="row">
            <div className="col-md-12">
              <div
                className="panel-group accordion bitmoon-user-warning"
                id="accordion2"
              >
                <div className="panel panel-default">
                  <div className="panel-heading">
                    <h4 className="panel-title">
                      <a
                        className="accordion-toggle font-red-mint collapsed"
                        data-toggle="collapse"
                        data-parent="#accordion2"
                        href="#collapse_2_1"
                        aria-expanded="false"
                      >
                        <span className="bold">
                          <i className="fa fa-bullhorn margin-right-10" />{' '}
                          <span>
                            <FormattedMessage id="app.global.bitmoonuserwarning" />
                          </span>
                        </span>
                        <i className="fa fa-chevron-down pull-right" />
                        <i className="fa fa-chevron-up pull-right" />
                      </a>
                    </h4>
                  </div>
                  <div
                    id="collapse_2_1"
                    className="panel-collapse collapse"
                    aria-expanded="false"
                  >
                    <div className="panel-body">
                      <div className="mt-element-list">
                        <div className="mt-list-container list-simple">
                          <ul>
                            <li className="mt-list-item">
                              <div className="list-icon-container font-red-mint">
                                <i className="fa fa-warning" />
                              </div>
                              <div className="list-item-content">
                                <label>
                                  <FormattedMessage id="app.global.bitmoonuserwarning.onlyonedomain" />
                                </label>
                              </div>
                            </li>
                            <li className="mt-list-item">
                              <div className="list-icon-container font-red-mint">
                                <i className="fa fa-warning" />
                              </div>
                              <div className="list-item-content">
                                <label>
                                  <FormattedMessage id="app.global.bitmoonuserwarning.notprovidepassword" />
                                </label>
                              </div>
                            </li>
                            <li className="mt-list-item">
                              <div className="list-icon-container font-red-mint">
                                <i className="fa fa-warning" />
                              </div>
                              <div className="list-item-content">
                                <label>
                                  <FormattedMessage id="app.global.bitmoonuserwarning.nottransfercoins" />
                                </label>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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

export default UserWarningMessageHOC;
