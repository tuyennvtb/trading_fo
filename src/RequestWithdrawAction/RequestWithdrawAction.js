/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import Link from '../Link';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { requestWithdrawAction } from '../Redux/actions/wallet';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
class ActivateAccount extends React.Component {
  static propTypes = {
    transaction_id: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      message: '',
    };
  }

  async componentDidMount() {
    const {
      actions,
      transaction_id,
      action,
      userId,
      coinId,
      amount,
      ciphertext,
    } = this.props;

    const error = await actions.requestWithdrawAction({
      transaction_id,
      action,
      userId,
      coinId,
      amount,
      ciphertext,
    });
    if (error) {
      this.setState({
        message: error,
      });
    }
  }

  render() {
    return (
      <div className="div-authen-layout paper register">
        <nav className="navbar">
          <div className="">
            <div className="navbar-header">
              <Link href="/">
                <img
                  src="/assets/global/img/bitmoon/logo.png"
                  alt="logo"
                  className="logo-default lazy"
                />
              </Link>
            </div>
          </div>
        </nav>

        {this.state.message ? (
          <div className="text-center" id="div-binding-container">
            <h4 className="h4-title">
              <span>{this.state.message}</span>
            </h4>
            <div className="div-authen-form">
              <div className="forgot-password">
                <span>Quay về </span>&nbsp;
                <Link href="/transactions" className="sign-up-color">
                  lịch sử giao dịch
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ user }) {
  const userData = (user && user.profile) || null;
  return {
    userData,
  };
}

// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ requestWithdrawAction }, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(ActivateAccount);
