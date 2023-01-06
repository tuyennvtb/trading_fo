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
import BannerDownload from './BannerDownload';

const navigationGest = [
  {
    ID: 'home',
    link: '/',
    classIcon: 'fa fa-home',
    text: 'Home'
  },
  {
    ID: 'buy-sell',
    link: '/mua-ban',
    classIcon: 'fa fa-exchange',
    text: 'Trade'
  },
  {
    ID: 'register',
    link: '/register',
    classIcon: 'fa fa-user-plus',
    text: 'Register'
  },
  {
    ID: 'login',
    link: '/login',
    classIcon: 'fa fa-sign-in',
    text: 'Login'
  },
  {
    ID: 'chat',
    link: '#',
    classIcon: 'fa fa-comments',
    text: 'Chat',
    onClick: 'chat'
  }
];
const navigationCustomer = [
  {
    ID: 'home',
    link: '/',
    classIcon: 'fa fa-home',
    text: 'Home'
  },
  {
    ID: 'buy-sell',
    link: '/mua-ban',
    classIcon: 'fa fa-exchange',
    text: 'Mua Bán'
  },
  {
    ID: 'wallet',
    link: '/wallet',
    classIcon: 'fa fa-credit-card-alt',
    text: 'Balance'
  },
  {
    ID: 'history',
    link: '/trade-history',
    classIcon: 'fa fa-history',
    text: 'Lịch Sử'
  },
  {
    ID: 'logout',
    link: '#',
    classIcon: 'fa fa-sign-out',
    text: 'Logout',
    onClick: 'logout'
  },
  {
    ID: 'chat',
    link: '#',
    classIcon: 'fa fa-comments',
    text: 'Chat',
    onClick: 'chat'
  }
];

class AppStickyNavBottom extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      logOut: PropTypes.func.isRequired,
    }).isRequired,
    user: PropTypes.object,
    location: PropTypes.object.isRequired,
  };

  static defaultProps = {
    user: null,
  };

  render() {
    const { user, location, actions } = this.props;
    var isAuthenticated = false;
    var navigations = navigationGest;
    if (user && user.profile && user.authenticated) {
      isAuthenticated = true;
      navigations = navigationCustomer;
    }
    var maxWidthItem = 100 / (navigations.length);

    return (
      <React.Fragment>
        <BannerDownload />
        <nav className="navbar navbar-sticky-bottom navbar-default navbar-fixed-bottom">
          {
            navigations.map((navigation, index) => (
              <div style={{ maxWidth: maxWidthItem + "%" }} key={index}>
                <Link
                  href={navigation.link}
                  id={navigation.ID}
                  className={navigation.link === location.pathname ? 'active navigation-link' : 'navigation-link'}
                  onClick={typeof navigation.onClick !== 'undefined' ? (event) => {
                    if (navigation.onClick === 'logout') {
                      return actions.logOut();
                    }
                    if (navigation.onClick === 'chat') {
                      window.Tawk_API.toggle()
                    }
                  } : null}
                >
                  <i className={navigation.classIcon} />
                  <span>{navigation.text}</span>
                </Link>
              </div>
            ))
          }
        </nav>
      </React.Fragment>
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

export default connect(mapStateToProps, mapDispatchToProps)(AppStickyNavBottom);
