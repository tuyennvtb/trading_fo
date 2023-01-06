/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import { updateIntl } from 'react-intl-redux';
import store from '../store';
import enBundle from '../Resourse/en.json';
import viBundle from '../Resourse/vi.json';

class Flag extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    e.preventDefault();
    let localeBundle = enBundle;
    if (e.target.dataset.locale === 'vi') {
      localeBundle = viBundle;
    }

    store.dispatch(
      updateIntl({
        locale: e.target.dataset.locale,
        messages: localeBundle,
      }),
    );
    let cookieInfo = {
      locale: e.target.dataset.locale,
      messages: localeBundle,
    };
    localStorage.setItem('uid_btm_lang', JSON.stringify(cookieInfo));
  }
  render() {
    let imgPath = '../assets/global/img/bitmoon/flags/vn.png';
    let language = 'Vietnam';
    const { locale } = store.getState().intl;
    if (locale === 'en') {
      language = 'US';
      imgPath = '../assets/global/img/bitmoon/flags/us.png';
    }
    return (
      <li className="dropdown dropdown-language">
        <a className="dropdown-toggle">
          <img alt="" src={imgPath} className="lazy" />
          <span className="langname"> {language} </span>
        </a>
        {/* <ul className="dropdown-menu">
          <li>
            <a
              href=""
              onClick={this.handleClick}
              data-locale="vi"
              data-imgpath="../assets/global/img/bitmoon/flags/vn.png"
            >
              <img alt="" src="../assets/global/img/bitmoon/flags/vn.png" />
              Vietnam
            </a>
          </li>
          <li>
            <a
              href=""
              onClick={this.handleClick}
              data-locale="en"
              data-imgpath="../assets/global/img/bitmoon/flags/us.png"
            >
              <img alt="" src="../assets/global/img/bitmoon/flags/us.png" />
              US
            </a>
          </li>
        </ul> */}
      </li>
    );
  }
}

export default Flag;
