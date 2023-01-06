/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from "react";
import "../assets/css/pages/cash.css";
import WalletForm from "../Forms/WalletForm";
import {  getWalletDetail } from '../Redux/actions/wallet';
import { bindActionCreators } from 'redux';
import { ERRORS } from '../Helpers/constants/system';
import { connect } from 'react-redux';
import { IMAGE_URL } from '../Helpers/constants/system'

class WalletDepositGroup extends React.Component {
  coinStyle = {
    width: 20,
    marginRight: 5,
    display: 'inline-block',
    verticalAlign: 'bottom'
  }
  constructor(props) {
    super(props);
    this.state = {
      isSelectedTab: props.group && props.group[0].walletCode,
      isDetailLoadding: false,
      isNoWallet: false
    };
  }

  getWalletDetail = async (coinCode) => {
    const { coinId, actions} = this.props
    this.setState({
      isDetailLoadding: true,
    });
    const err = await actions.getWalletDetail(
      coinId,
      true,
      'BUY',
      null,
      coinCode
    );
    if (err && err === ERRORS.NO_WALLET) {
      return this.setState({
        isDetailLoadding: false,
        error: err,
        isNoWallet: true,
      });
    }
    return this.setState({
      isDetailLoadding: false,
    });
  }

  async componentDidMount() {
    const {  group = []} = this.props
    if (group[0]) {
     await this.getWalletDetail(group[0].walletCode)
    }

  }

  _onClickTab = async (coinCode) => {
    const { isSelectedTab } = this.state
    console.log('ahaha')
    if (isSelectedTab !== coinCode) {
      await this.getWalletDetail(coinCode)
      this.setState({
        isSelectedTab: coinCode,
      });
    }

  };

  render() {
    const {  group } = this.props;
    const {  isSelectedTab } = this.state;

    return (
      <div>
        <div className="portlet light bordered" style={{marginBottom: 0, paddingBottom: 0}}>
          <div className="portlet-body">
            <div className="row">
                <div>
                  <div className="tab-content">
                    <div className="tab-pane active" style={{marginLeft: 15, marginBottom: 15}}>
                    <div>Select Network: </div>
                      {group.map((coinCode) => {
                        return (
                          <button
                            style={{marginTop: 15, marginBottom: 15, marginRight: 15}}
                            key={`button${coinCode.walletCode}`}
                            type="button"
                            onClick={() => this._onClickTab(coinCode.walletCode)}
                            className={`btn btn-outline yellow wallet-button ${isSelectedTab === coinCode.walletCode ? 'active' : ''}`}
                          >
                              {IMAGE_URL[coinCode.walletCode] ? <img alt={coinCode.walletCode} src={IMAGE_URL[coinCode.walletCode]} style={this.coinStyle}/> : null}{coinCode.walletName}
                          </button>
                        );
                      })}
                      <br />
                    </div>
                      <WalletForm
                        isGroup={true}
                        key={isSelectedTab}
                        coinCode={isSelectedTab}
                        displayAsCoinName={true}
                        {...this.props}
                        />
                  </div>
                </div>
            </div>
          </div>
        </div>

        <div className="clearfix" />
      </div>
    );
  }
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ wallet}) {
  const detail = (wallet && wallet.detail) || null;
  return {
    detail,
  };
}

// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {  getWalletDetail },
      dispatch,
    ),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(WalletDepositGroup);
