/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import ModalDialog from '../Processing/ModalDialog';

function SystemWalletHOC(ComposedComponent) {
  class SystemWallet extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        isOpenModal: true,
      };
    }
    renderVerifyDialog() {
      const { wallet, coinID } = this.props;
      return (
        <ModalDialog isOpen={!wallet}>
          <div className="portlet light bordered modal-dialog-content clearfix">
            <div className="portlet-title">
              <div className="caption">
                <span className="caption-subject font-dark bold uppercase">
                  <i className="icon-lock" />{' '}
                  <FormattedMessage id="app.global.hasnowallet" />
                </span>
              </div>
            </div>
            <div className="portlet-body">
              <p>
                <FormattedHTMLMessage
                  id="app.global.hasnowallet.description"
                  values={{
                    coin_id: coinID,
                  }}
                />
              </p>
              {wallet ? (
                <button
                  className="btn md-btn pull-right"
                  onClick={() => {
                    this.setState({ isOpenModal: false });
                  }}
                >
                  <i className="fa fa-check-circle" />
                  <FormattedMessage id="app.global.button.continue" />
                </button>
              ) : (
                <button className="btn md-btn pull-right" disabled={true}>
                  <p className="spin-loading">
                    <FormattedMessage id="app.global.button.continue" />
                  </p>
                </button>
              )}
            </div>
          </div>
        </ModalDialog>
      );
    }
    render() {
      return (
        <div>
          {this.renderVerifyDialog()}
          <ComposedComponent {...this.props} />
        </div>
      );
    }
  }
  return connect(mapStateToProps, null)(SystemWallet);
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ wallet, user: { profile } }) {
  const detail = (wallet && wallet.detail) || null;
  const firstWallet =
    detail && detail.result && detail.result[0] ? detail.result[0] : null;
  return {
    wallet: firstWallet,
    user: profile,
  };
}

export default SystemWalletHOC;
