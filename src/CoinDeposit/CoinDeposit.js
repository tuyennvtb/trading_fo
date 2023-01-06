/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import CoinDepositForm from '../Forms/CoinDepositForm';
import { FormattedMessage } from 'react-intl';
import { formatNumber } from '../Helpers/utils';
import { getSettingsByItem } from '../Redux/actions/settings';
import history from '../history';

class CoinDeposit extends React.Component {
  static propTypes = {
    user: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      currentBalance: 0,
      coin_code: '',
    };
  }

  componentDidMount() {
    this.loadSetting();
  }

  componentWillReceiveProps(nextProps) {
    const { settings } = nextProps;
    if (settings
      && settings.item === 'disabled_withdraw_deposit'
    ) {
      const setting = settings.value;
      const { coinID } = this.props;
      if (setting.deposit_status) {
        let coins = setting.deposit_allow_list.split(',');
        coins = coins.map(item => item.trim());
        if (coins.indexOf(coinID) == -1) {
          history.push('/');
        }
      }
    }
  }

  loadSetting = () => {
    this.props.dispatch(getSettingsByItem('disabled_withdraw_deposit'));
  }

  calculateBalance = (balance, coin_code = '') => {
    this.setState({
      currentBalance: balance,
      coin_code: coin_code,
    });
  };
  render() {
    const { currentBalance, coin_code } = this.state;
    return (
      <div>
        <div className="portlet light bordered paper-3 cash">
          <div className="portlet-body">
            <div className="row">
              <div className="col-md-4 col-md-offset-4">
                <p className="text-center title">
                  <span className="caption-subject font-blue bold uppercase">
                    <i
                      className=" icon-wallet font-blue"
                      style={{ padding: '0 5px 0 0' }}
                    />
                    <FormattedMessage id="app.coin.wallet.table.header.availabletouse" />{' '}
                    :
                  </span>
                  <span className="bold font-blue">
                    {` ${formatNumber(currentBalance || 0)} ${coin_code}`}
                  </span>
                </p>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="row">
                  <div className="col-md-12 col-sm-12 col-xs-12">
                    <CoinDepositForm
                      coinID={this.props.coinID}
                      calculateBalance={this.calculateBalance}
                    />
                  </div>
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

function mapStateToProps({ settings }) {
  return {
    settings
  };
}

export default connect(mapStateToProps)(CoinDeposit);
