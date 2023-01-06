/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getWalletDetail } from '../Redux/actions/wallet';
import WalletSendForm from '../Forms/WalletSendForm';
import WalletForm from '../Forms/WalletForm';

class WalletDetail extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      getWalletDetail: PropTypes.func.isRequired,
    }).isRequired,
    coin: PropTypes.string.isRequired,
  };

  async componentDidMount() {
    const { actions, coin } = this.props;
    await actions.getWalletDetail(coin);
  }

  render() {
    const { coin } = this.props;
    return (
      <div className="row">
        <div className="col-md-8">
          <div className="portlet mt-element-ribbon light portlet-fit bordered paper-3">
            <div className="ribbon ribbon-left ribbon-vertical-left ribbon-shadow ribbon-border-dash-vert ribbon-color-primary uppercase">
              <div className="ribbon-sub ribbon-bookmark" />
              <i className="fa fa-send-o" />
            </div>
            <div className="portlet-title">
              <div className="caption">
                <span
                  className="caption-subject bold uppercase"
                  style={{ color: '#c27d0e', paddingLeft: '10px' }}
                >
                  Send coin
                </span>
              </div>
            </div>
            <div className="portlet-body">
              <WalletSendForm coinCode={coin} />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="portlet mt-element-ribbon light portlet-fit bordered paper-3">
            <div className="ribbon ribbon-left ribbon-vertical-left ribbon-shadow ribbon-border-dash-vert ribbon-color-primary uppercase">
              <div className="ribbon-sub ribbon-bookmark" />
              <i className="fa fa-futbol-o" />
            </div>
            <div className="portlet-title">
              <div className="caption">
                <span
                  className="caption-subject bold uppercase"
                  style={{ color: '#c27d0e', paddingLeft: '10px' }}
                >
                  Wallet detail
                </span>
              </div>
            </div>
            <div className="portlet-body">
              <WalletForm coinCode={coin} />
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="portlet mt-element-ribbon light portlet-fit bordered paper-3">
            <div className="ribbon ribbon-left ribbon-vertical-left ribbon-shadow ribbon-border-dash-vert ribbon-color-primary uppercase">
              <div className="ribbon-sub ribbon-bookmark" />
              <i className="fa fa-history" />
            </div>
            <div className="portlet-title">
              <div className="caption">
                <span
                  className="caption-subject bold uppercase"
                  style={{ color: '#c27d0e', paddingLeft: '10px' }}
                >
                  Send History
                </span>
              </div>
            </div>
            <div className="portlet-body">
              <table className="table">
                <thead>
                  <tr>
                    <th> Coin code </th>
                    <th> Send from </th>
                    <th> Send to </th>
                    <th> Amount </th>
                    <th> Status </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td> XRP </td>
                    <td> xxxxxxxxx</td>
                    <td> yyyyyyyyyyyy </td>
                    <td>pending</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="clearfix" />
      </div>
    );
  }
}

// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ getWalletDetail }, dispatch),
  };
}
export default connect(null, mapDispatchToProps)(WalletDetail);
