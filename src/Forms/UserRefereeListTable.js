import React from 'react';
import { FormattedDate } from 'react-intl';
import PropTypes from 'prop-types';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { formatNumber, convertDateByTimeZone } from '../Helpers/utils';

class UserRefereeListTable extends React.Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    intl: intlShape.isRequired,
  };

  static defaultProps = {
    data: [],
  };

  constructor(props) {
    super(props);
    this.isExpandableRow = this.isExpandableRow.bind(this);
    this.cellDateFormatter = this.cellDateFormatter.bind(this);
    this.cellStringFormatter = this.cellStringFormatter.bind(this);
    this.transactionFormatter = this.transactionFormatter.bind(this);
  }

  cellDateFormatter(cell) {
    return (
      <span title={cell}>
        <FormattedDate
          value={convertDateByTimeZone(cell)}
          year="numeric"
          month="short"
          day="2-digit"
          hour="2-digit"
          hour12={false}
          minute="2-digit"
          second="2-digit"
        />
      </span>
    );
  }

  transactionFormatter(cell, row) {
    let transactionStatus = <span>{cell}</span>;
    return <div>{transactionStatus}</div>;
  }

  cellStringFormatter(cell, row) {
    return (
      <div className="coin-title">
        <div>
          <span className="bold visible-xs visible-sm">
            <FormattedMessage id="app.history.deposit.coin.title" />:
          </span>
          <span>{cell.toUpperCase()}</span>
        </div>
        <div className="visible-xs visible-sm coin-amount">
          <p className="bold">
            <FormattedMessage id="app.history.deposit.amount.title" />
          </p>
          <span>{formatNumber(row.amount)}</span>
        </div>
      </div>
    );
  }

  amountFormatter(cell, row) {
    return formatNumber(cell);
  }

  isExpandableRow(row) {
    return true;
  }

  render() {
    const { data } = this.props;
    return (
      <BootstrapTable
        data={data}
        className="transaction-table table-striped table-advance"
        hover
        pagination
        condensed
        multiColumnSort={3}
        search
        options={{
          clearSearch: true,
          searchPosition: 'left',
        }}
      >
        <TableHeaderColumn
          dataField="email"
          dataSort
          dataAlign="left"
          className="amount-col-header"
          columnClassName="amount-col"
        >
          <FormattedMessage id="app.referral.email" />
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="user_id"
          dataSort
          dataAlign="left"
          className="amount-col-header"
          columnClassName="amount-col"
          hidden
        // width="15%"
        >
          <FormattedMessage id="app.referral.referee" />
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="bonus_amount"
          dataFormat={this.amountFormatter}
          dataSort
          dataAlign="right"
          className="amount-col-header"
          columnClassName="amount-col"
          hidden
        // width="15%"
        >
          <FormattedMessage id="app.history.deposit.amount.title" />
        </TableHeaderColumn>
        <TableHeaderColumn
          isKey
          dataFormat={this.cellDateFormatter}
          dataField="created_at"
          dataSort
          dataAlign="right"
        >
          Date
        </TableHeaderColumn>
      </BootstrapTable>
    );
  }
}

export default injectIntl(UserRefereeListTable);
