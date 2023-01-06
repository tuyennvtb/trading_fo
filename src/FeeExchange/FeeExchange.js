/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import BootstrapTable from 'react-bootstrap-table/lib/BootstrapTable';
import { TableHeaderColumn } from 'react-bootstrap-table';
import { bindActionCreators } from 'redux';
import { getWalletList } from '../Redux/actions/wallet';
import { getUserComission } from '../Redux/actions/userLevelDinitions';
import { USER_GROUP_TYPE } from '../Helpers/constants/system';

class FeePage extends React.Component {
  componentDidMount() {
    this.props.actions.getWalletList();
    this.props.actions.getUserComission([
      USER_GROUP_TYPE.TRADE_FEE
    ]);
  }

  render() {
    const { data, level } = this.props;
    return (
      <div className="portlet mt-element-ribbon light portlet-fit bordered">
        <div className="portlet-title">
          <div className="caption">
            <h2 className="caption-subject bold uppercase">
              <FormattedMessage id="page.fee_exchange.header.fee_trading" />
            </h2>
          </div>
        </div>
        <div className="portlet-body">
          <BootstrapTable
            data={level}
            className="table-striped table-advance order-table-container"
            hover
            bordered={false}
            pagination
            condensed
            multiColumnSort={3}
            search
            options={{
              clearSearch: true,
              searchPosition: 'left',
              sortName: 'sort',
              sortOrder: 'asc'
            }}
            trClassName={this.rowClassNameFormat}
          >
            <TableHeaderColumn
              dataField="user_group_code"
              dataSort
              isKey
              dataAlign="center"
              className="center"
              dataFormat={(col, row) => {
                return (
                  <div>
                    <FormattedMessage id="page.fee_exchange.table.level" /> {row.sort}
                  </div>
                );
              }}
            >
              <FormattedMessage id="page.fee_exchange.table.level" />
            </TableHeaderColumn>


            <TableHeaderColumn
              dataField="value"
              dataSort
              dataAlign="center"
              className="center"
              dataFormat={(col) => {
                return (
                  <div>
                    {col} %
                  </div>
                );
              }}
            >
              <FormattedMessage id="page.fee_exchange.table.fee" />
            </TableHeaderColumn>
            <TableHeaderColumn
              dataField="sort"
              dataSort
              hidden
            />

          </BootstrapTable >
        </div>

        <div className="portlet-title">
          <div className="caption">
            <h2 className="caption-subject bold uppercase">
              <FormattedMessage id="page.fee_exchange.header.fee_withdraw_deposit" />
            </h2>
          </div>
        </div>
        <div className="portlet-body">
          <BootstrapTable
            data={data}
            className="table-striped table-advance order-table-container"
            hover
            bordered={false}
            pagination
            condensed
            multiColumnSort={3}
            search
            options={{
              clearSearch: true,
              searchPosition: 'left',
              // sortName: 'coin_code',
              // sortOrder: 'asc'
            }}
            trClassName={this.rowClassNameFormat}
          >
            <TableHeaderColumn
              dataField="coin_code"
              dataSort
              isKey
              dataAlign="center"
              className="center"
            >
              <FormattedMessage id="page.fee_exchange.table.coin" />
            </TableHeaderColumn>

            <TableHeaderColumn
              dataField="coin_name"
              dataSort
              dataAlign="center"
              className="center"
            >
              <FormattedMessage id="page.fee_exchange.table.fullname" />
            </TableHeaderColumn>

            <TableHeaderColumn
              dataFormat={() => {
                return <FormattedMessage id="page.fee_exchange.table.free" />;
              }}
              dataSort
              dataAlign="center"
              className="center"
            >
              <FormattedMessage id="page.fee_exchange.table.depositfee" />
            </TableHeaderColumn>

            <TableHeaderColumn
              dataField="transfer_fee"
              dataSort
              dataAlign="center"
              className="center"
            >
              <FormattedMessage id="page.fee_exchange.table.withdrawfee" />
            </TableHeaderColumn>
          </BootstrapTable >
        </div>
      </div>
    );
  }
}


function mapStateToProps({ wallet, userLevelDefinitions }) {
  const data = (wallet && wallet.listWallet) || [];
  const level = (userLevelDefinitions && userLevelDefinitions.userGroupList) || [];
  return {
    data,
    level
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ getWalletList, getUserComission }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FeePage);
