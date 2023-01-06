import React from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { formatNumber } from '../Helpers/utils';

class ScroreBoardTable extends React.Component {

  numberFormatter(cell, row) {
    return formatNumber(cell);
  }

  render() {
    const { data, type } = this.props;
    return (
      <BootstrapTable
        data={data}
        className={`table-striped table-advance order-table-container ${type}`}
        hover
        bordered={false}
        pagination
        condensed
        multiColumnSort={3}
      >
        <TableHeaderColumn
          dataField="rank"
          dataSort
          width="50px"
          columnClassName="coin-col"
          className="coin-col-header"
          dataAlign="center"
        >
          #
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="name"
          dataSort
          columnClassName="coin-col"
          className="coin-col-header"
          dataAlign="center"
        >
          Name
        </TableHeaderColumn>
        <TableHeaderColumn
          isKey
          dataField="username"
          dataSort
          columnClassName="coin-col"
          className="coin-col-header"
          dataAlign="center"
        >
          Email
        </TableHeaderColumn>
        <TableHeaderColumn
          dataFormat={this.numberFormatter}
          dataField="total_quantity"
          dataSort
          // width="15%"
          columnClassName="estimate-total-col"
          className="estimate-total-col-header"
          dataAlign="center"
        >
          <FormattedMessage id="app.order.total_quantity" />
        </TableHeaderColumn>
        <TableHeaderColumn
          dataFormat={this.numberFormatter}
          dataField="total_amount"
          dataSort
          // width="15%"
          columnClassName="estimate-total-col"
          className="estimate-total-col-header"
          dataAlign="center"
        >
          <FormattedMessage id="app.order.estimate_total" />
        </TableHeaderColumn>

      </BootstrapTable>
    );
  }
}

export default connect()(ScroreBoardTable);
