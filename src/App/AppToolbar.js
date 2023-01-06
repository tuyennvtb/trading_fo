/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */
/*eslint-disable no-script-url*/
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { logOut } from '../Redux/actions/user';
import Flag from '../Flags';
import Link from '../Link';
import { FormattedMessage } from 'react-intl';

class AppToolbar extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      logOut: PropTypes.func.isRequired,
    }).isRequired,
    user: PropTypes.object,
    template: PropTypes.string.isRequired,
  };

  static defaultProps = {
    user: null,
  };

  renderMobileMenuToggler(template) {
    return (
      <a
        href="javascript:;"
        className="menu-toggler responsive-toggler"
        data-toggle="collapse"
        data-target=".navbar-collapse"
      >
        {' '}
      </a>
    );
  }

  renderUserActionLink(user, actions) {
    if (user && user.profile && user.authenticated) {
      return (
        <ul className="nav navbar-nav pull-right">
          <li className="dropdown dropdown-user dropdown-dark">
            <a
              href="javascript:;"
              className="dropdown-toggle profile-dropdown-toggle"
              data-toggle="dropdown"
              data-hover="dropdown"
              data-close-others="true"
              aria-expanded="true"
            >
              <i className="fa fa-user hidden-xs hidden-sm" />
              &nbsp;
              {user.profile.name}
            </a>
            <Link href="/profile" className="profile-link">
              <i className="fa fa-user hidden-xs hidden-sm" />
              &nbsp;
              {user.profile.name}
            </Link>
            <button
              className="visible-xs visible-sm"
              type="button"
              title="Logout"
              onClick={() => actions.logOut()}
            >
              <i className="icon-logout" />
            </button>
            <ul className="dropdown-menu dropdown-menu-default">
              <li>
                <Link href="/profile" className="nav-link ">
                  <i className="icon-user" />
                  <span className="title">
                    &nbsp;
                    <FormattedMessage id="app.leftnavigation.profile.profile" />
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/profile" className="nav-link ">
                  <i className="icon-user" />
                  <span className="title">
                    &nbsp;
                    <FormattedMessage id="app.leftnavigation.profile.profile" />
                  </span>
                </Link>
              </li>
            </ul>

            <ul className="dropdown-menu dropdown-menu-default">
              <li>
                <Link href="/profile" className="nav-link ">
                  <i className="icon-user" />
                  <span className="title">
                    &nbsp;
                    <FormattedMessage id="app.leftnavigation.profile.profile" />
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/verify-account" className="nav-link ">
                  <i className="fa fa-check" />
                  <span className="title">
                    &nbsp;
                    <FormattedMessage id="app.leftnavigation.profile.verify" />
                  </span>
                </Link>
              </li>
              <li className="nav-item start ">
                <Link href="/referral" className="nav-link ">
                  <i className="fa fa-user-plus" />
                  <span className="title">
                    &nbsp;
                    <FormattedMessage id="app.leftnavigation.profile.referral" />
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/change-password" className="nav-link ">
                  <i className="icon-pencil" />
                  <span className="title">
                    &nbsp;
                    <FormattedMessage id="app.leftnavigation.profile.changepassword" />
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/security" className="nav-link ">
                  <i className="icon-lock" />
                  <span className="title">
                    &nbsp;
                    <FormattedMessage id="app.leftnavigation.profile.google2fa" />
                  </span>
                </Link>
              </li>
              <li className="divider"> </li>
              <li>
                <Link href="/wallet" className="nav-link ">
                  <i className="icon-support" />
                  <span className="title">
                    &nbsp;
                    <FormattedMessage id="app.leftnavigation.profile.depositandwithdraw" />
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/cash" className="nav-link ">
                  <i className="fa fa-money" />
                  <span className="title">
                    &nbsp;
                    <FormattedMessage id="app.leftnavigation.profile.cash" />
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/transactions" className="nav-link ">
                  <i className="icon-shuffle" />
                  <span className="title">
                    &nbsp;
                    <FormattedMessage id="app.transaction.title" />
                  </span>
                </Link>
              </li>
              <li className="divider"> </li>
              <li>
                <Link
                  className="nav-link"
                  href="#"
                  onClick={() => actions.logOut()}
                >
                  <i className="icon-logout" />
                  <span className="title">
                    &nbsp;
                    <FormattedMessage id="app.register.logout" />
                  </span>
                </Link>
              </li>
            </ul>
          </li>

          <li className="dropdown dropdown-extended quick-sidebar-toggler hidden-xs hidden-sm">
            <span className="sr-only">Toggle Quick Sidebar</span>
            <button
              type="button"
              title="Logout"
              onClick={() => actions.logOut()}
            >
              <i className="icon-logout" />
            </button>
          </li>
        </ul>
      );
    }
  }

  render() {
    const { user, template, actions } = this.props;
    var isAuthenticated = false;
    if (user && user.profile && user.authenticated) {
      isAuthenticated = true;
    }

    return (
      <div
        className={`page-header navbar navbar-top ${
          isAuthenticated && 'authenticated'
        } ${template === 'home' ? 'home-default' : 'menu-fixed'}`}
      >
        <div className="page-header-inner clearfix">
          <div className="page-logo">
            <Link href="/">
              <img
                src="/assets/global/img/bitmoon/logo.png"
                alt="logo"
                className="logo-default lazy"
              />
            </Link>
          </div>
          {this.renderMobileMenuToggler(template)}
          <div className="page-actions hidden-md hidden-lg">
            <ul className="nav navbar-nav pull-right">
              <Flag />
            </ul>
          </div>
          <div className="extended-user-action-link visible-xs visible-sm">
            {template !== 'home' && template !== 'blog'
              ? this.renderUserActionLink(user, actions)
              : ''}
          </div>
          <div
            className="page-top collapse navbar-collapse"
            aria-expanded="false"
          >
            <div className={`top-menu ${isAuthenticated ? 'is-loggedin' : ''}`}>
              {/*-----Authenticated Navigation-----*/}
              {this.renderUserActionLink(user, actions)}

              {/*-----Non-Authenticated Navigation-----*/}
              {!isAuthenticated && (
                <ul className="nav navbar-nav pull-right account-buttons none-authen">
                  <li>
                    <Link className="btn btn-transparent" href="/login">
                      <FormattedMessage id="app.global.login.text" />
                    </Link>
                  </li>
                  <li>
                    <Link className="btn btn-transparent" href="/register">
                      <FormattedMessage id="app.global.register.text" />
                    </Link>
                  </li>
                </ul>
              )}
              {/*-----Static Navigation-----*/}
              <ul className="nav navbar-nav pull-right main-nav">
                <li>
                  <Link title="exchange" href="/mua-ban-nhanh/bitcoin">
                    <i className="fa fa-rocket" />
                    <span>
                      {' '}
                      <FormattedMessage id="app.exchange.simpleexchange" />
                    </span>
                  </Link>
                </li>
                <li>
                  <Link title="exchange" href="/mua-ban">
                    <i className="fa fa-exchange visible-xs visible-sm" />
                    <FormattedMessage id="app.header.exchange" />
                  </Link>
                </li>
                <li className="dropdown dropdown-dark dropdown-wallet hidden-xs hidden-sm">
                  <a
                    title="Wallet"
                    className="dropdown-toggle"
                    href="javascript:;"
                    data-toggle="dropdown"
                    data-hover="dropdown"
                    data-close-others="true"
                    aria-expanded="true"
                  >
                    <i className="fa fa-credit-card visible-xs visible-sm" />
                    <FormattedMessage id="app.leftnavigation.profile.wallet" />
                    <i className="fa fa-angle-down" />
                  </a>
                  <ul className="dropdown-menu dropdown-menu-default">
                    <li>
                      <Link href="/wallet" className="nav-link dropdown-toggle">
                        <i className="icon-support" />
                        <span className="title">
                          &nbsp;
                          <FormattedMessage id="app.leftnavigation.profile.depositandwithdraw" />
                        </span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/cash" className="nav-link ">
                        <i className="fa fa-money" />
                        <span className="title">
                          &nbsp;
                          <FormattedMessage id="app.leftnavigation.profile.cash" />
                        </span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/transactions" className="nav-link ">
                        <i className="icon-shuffle" />
                        <span className="title">
                          &nbsp;
                          <FormattedMessage id="app.transaction.title" />
                        </span>
                      </Link>
                    </li>
                  </ul>
                </li>
                {isAuthenticated && [
                  <li key="wallet" className="hidden-md hidden-lg">
                    <Link href="/wallet" className="nav-link">
                      <i className="icon-support" />
                      <span className="title">
                        &nbsp;
                        <FormattedMessage id="app.leftnavigation.profile.depositandwithdraw" />
                      </span>
                    </Link>
                  </li>,
                  <li key="cash" className="hidden-md hidden-lg">
                    <Link href="/cash" className="nav-link ">
                      <i className="fa fa-money" />
                      <span className="title">
                        &nbsp;
                        <FormattedMessage id="app.leftnavigation.profile.cash" />
                      </span>
                    </Link>
                  </li>,
                  <li key="transactions" className="hidden-md hidden-lg">
                    <Link href="/transactions" className="nav-link ">
                      <i className="icon-shuffle" />
                      <span className="title">
                        &nbsp;
                        <FormattedMessage id="app.transaction.title" />
                      </span>
                    </Link>
                  </li>,
                  <li key="trade-histor" className="trade-history">
                    <Link title="exchange" href="/trade-history">
                      <i className="fa fa-exchange visible-xs visible-sm" />
                      <FormattedMessage id="app.order.tradehistory" />
                    </Link>
                  </li>,
                  <li key="verify-account" className="hidden-md hidden-lg">
                    <Link title="exchange" href="/verify-account">
                      <i className="fa fa-lock visible-xs visible-sm" />
                      <FormattedMessage id="app.leftnavigation.profile.verify" />
                    </Link>
                  </li>,
                  <li key="2fa" className="hidden-md hidden-lg">
                    <Link title="exchange" href="/security">
                      <i className="fa fa-lock visible-xs visible-sm" />
                      <FormattedMessage id="app.leftnavigation.profile.google2fa" />
                    </Link>
                  </li>,
                  <li key="referral" className="nav-item start ">
                    <Link href="/referral" className="nav-link ">
                      <i className="fa fa-user-plus" />
                      <span className="title">
                        &nbsp;
                        <FormattedMessage id="app.leftnavigation.profile.referral" />
                      </span>
                    </Link>
                  </li>,
                ]}
                <Flag />
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ user }) {
  return { user };
}
// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ logOut }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AppToolbar);
