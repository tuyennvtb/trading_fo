/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import Link from '../Link';
import { FormattedMessage } from 'react-intl';

class AppLeftToolbar extends React.Component {
  render() {
    return (
      <ul
        className="page-sidebar-menu"
        data-keep-expanded="false"
        data-auto-scroll="true"
        data-slide-speed="200"
      >
        <li className="nav-item start open">
          <Link href="/profile" className="nav-link nav-toggle">
            <i className="icon-settings" />
            <span className="title">
              &nbsp;<FormattedMessage id="app.leftnavigation.profile.setting" />
            </span>
            <span className="arrow open" />
          </Link>
          <ul className="sub-menu" style={{ display: 'block' }}>
            <li className="nav-item start ">
              <Link href="/profile" className="nav-link ">
                <i className="icon-user" />
                <span className="title">
                  &nbsp;<FormattedMessage id="app.leftnavigation.profile.profile" />
                </span>
              </Link>
            </li>
            <li className="nav-item start ">
              <Link href="/verify-account" className="nav-link ">
                <i className="fa fa-check" />
                <span className="title">
                  &nbsp;<FormattedMessage id="app.leftnavigation.profile.verify" />
                </span>
              </Link>
            </li>
            <li className="nav-item start ">
              <Link href="/referral" className="nav-link ">
                <i className="fa fa-user-plus" />
                <span className="title">
                  &nbsp;<FormattedMessage id="app.leftnavigation.profile.referral" />
                </span>
              </Link>
            </li>
            <li className="nav-item start ">
              <Link href="/change-password" className="nav-link ">
                <i className="icon-pencil" />
                <span className="title">
                  &nbsp;<FormattedMessage id="app.leftnavigation.profile.changepassword" />
                </span>
              </Link>
            </li>
            <li className="nav-item start ">
              <Link href="/security" className="nav-link ">
                <i className="icon-lock" />
                <span className="title">
                  &nbsp;<FormattedMessage id="app.leftnavigation.profile.google2fa" />
                </span>
              </Link>
            </li>
          </ul>
        </li>

        <li className="nav-item start open">
          <Link href="/wallet" className="nav-link nav-toggle">
            <i className="icon-wallet" />
            <span className="title">
              <FormattedMessage id="app.leftnavigation.profile.wallet" />
            </span>
            <span className="arrow open" />
          </Link>
          <ul className="sub-menu" style={{ display: 'block' }}>
            <li className="nav-item start ">
              <Link href="/wallet" className="nav-link ">
                <i className="icon-support" />
                <span className="title">
                  &nbsp;<FormattedMessage id="app.leftnavigation.profile.depositandwithdraw" />
                </span>
              </Link>
            </li>
            <li className="nav-item start ">
              <Link href="/cash" className="nav-link ">
                <i className="fa fa-money" />
                <span className="title">
                  &nbsp;<FormattedMessage id="app.leftnavigation.profile.cash" />
                </span>
              </Link>
            </li>
            <li className="nav-item start ">
              <Link href="/transactions" className="nav-link ">
                <i className="icon-shuffle" />
                <span className="title">
                  &nbsp;<FormattedMessage id="app.transaction.title" />
                </span>
              </Link>
            </li>
          </ul>
        </li>
        <li className="nav-item start open">
          <Link href="#" className="nav-link nav-toggle">
            <i className="icon-wallet" />
            <span className="title">
              <FormattedMessage id="app.leftnavigation.profile.exchange" />
            </span>
            <span className="arrow open" />
          </Link>
          <ul className="sub-menu" style={{ display: 'block' }}>
            <li className="nav-item start ">
              <Link href="/mua-ban" className="nav-link ">
                <i className="fa fa-money" />
                <span className="title">
                  &nbsp;<FormattedMessage id="app.exchange.link.title" />
                </span>
              </Link>
            </li>
          </ul>
        </li>
      </ul>
    );
  }
}

export default AppLeftToolbar;
