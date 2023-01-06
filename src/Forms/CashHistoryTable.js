import React from 'react';
import { FormattedDate, FormattedTime } from 'react-intl';
import PropTypes from 'prop-types';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { FormattedMessage } from 'react-intl';
class CashHistoryTable extends React.Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    type: PropTypes.string.isRequired,
  };

  static defaultProps = {
    data: [],
    type: 'deposit',
  };

  constructor(props) {
    super(props);
    this.isExpandableRow = this.isExpandableRow.bind(this);
    this.expandComponent = this.expandComponent.bind(this);
    this.expandColumnComponent = this.expandColumnComponent.bind(this);
    this.cellDateFormatter = this.cellDateFormatter.bind(this);
    this.cellStringFormatter = this.cellStringFormatter.bind(this);
    this.transactionFormatter = this.transactionFormatter.bind(this);
  }

  cellDateFormatter(cell, row) {
    return (
      <span title={cell}>
        <FormattedDate
          value={new Date(cell)}
          year="numeric"
          month="short"
          day="2-digit"
        />
      </span>
    );
  }

  transactionFormatter(cell, row) {
    let transactionStatus = null;
    if (row.status === 1 || row.status === 0 || row.status === -3) {
      transactionStatus = <span>{cell}</span>;
    } else {
      transactionStatus = (
        <span style={{ color: 'red', fontWeight: 'bold' }}>{cell}</span>
      );
    }
    return <div>{transactionStatus}</div>;
  }

  cellStringFormatter(cell, row) {
    let result = null;
    if (cell) {
      result = (
        <strong>
          <span>{cell.toUpperCase()}</span>
        </strong>
      );
    }
    return result;
  }

  statusFormatter(cell, row) {
    let status = null;
    if (row.status === 1) {
      status = (
        <span style={{ color: 'rgba(30, 196, 30, 0.877)' }}>
          <strong>
            <FormattedMessage id="app.global.text.completed" />
          </strong>
        </span>
      );
    } else if (row.status === 0 || row.status === -3 || row.status === 3) {
      status = (
        <span style={{ color: '#f9e491' }}>
          {' '}
          <strong>
            <FormattedMessage id="app.global.text.processing" />
          </strong>
        </span>
      );
    } else {
      status = (
        <span style={{ color: 'rgb(255, 0, 0)' }}>
          {' '}
          <strong>
            <FormattedMessage id="app.global.text.failed" />
          </strong>
        </span>
      );
    }
    return (
      <div>
        {status} <br />
        <span title={row.created_at}>
          <i className="fa fa-calendar" /> &nbsp;
          <FormattedDate
            value={new Date(row.created_at)}
            year="numeric"
            month="2-digit"
            day="2-digit"
          />&nbsp;&nbsp;&nbsp;
          <i className="fa fa-clock-o" />&nbsp;
          <FormattedTime
            hour12={false}
            value={new Date(row.created_at)}
            hour="2-digit"
            minute="2-digit"
            second="2-digit"
          />
        </span>
      </div>
    );
  }

  isExpandableRow(row) {
    return true;
  }

  expandComponent(row) {
    const { type } = this.props;
    return (
      <div className="summarize">
        <div className="row">
          <div className="col-md-3 text-left">
            <strong className="color-primary">
              <i className="icon-support" /> {row.coin.toUpperCase()}
            </strong>
          </div>
          <div className="col-md-9 text-right">
            <span>
              <i className="fa fa-calendar" /> 2017-12-20
            </span>
            &nbsp;&nbsp;
            <span>
              <i className="fa fa-clock-o" /> 08:53
            </span>
          </div>
        </div>
        <hr />
        {row.tx_id && (
          <div className="row static-info">
            <div className="col-md-3 name text-left">
              <strong style={{ lineHeight: '28px' }}>Transaction ID</strong>
            </div>
            <div className="col-md-9 value text-right">
              <input
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  fontSize: '11px',
                }}
                type="text"
                value={row.tx_id}
                readOnly
              />
            </div>
          </div>
        )}
        {row.tx_id && <hr />}
        <div className="row static-info">
          <div className="col-md-3 name text-left">
            <strong>Address</strong>
          </div>
          <div className="col-md-9 value text-right">
            {type === 'deposit' ? row.to_address : row.from_address}
          </div>
        </div>
        {!!row.to_address_tag && (
          <div className="row static-info">
            <div className="col-md-3 name text-left">
              <strong>
                <FormattedMessage id="app.sendcoin.history.column.destinationtag" />
              </strong>
            </div>
            <div className="col-md-9 value text-right">
              {row.to_address_tag}
            </div>
          </div>
        )}
        {!!row.fee && (
          <div className="row static-info">
            <div className="col-md-3 name text-left">
              <strong>Transaction fee</strong>
            </div>
            <div className="col-md-9 value text-right">
              {row.fee} {row.coin.toUpperCase()}
            </div>
          </div>
        )}
        <div className="row static-info">
          <div className="col-md-3 name text-left">
            <strong>Sent</strong>
          </div>
          <div className="col-md-9 value text-right">
            <strong
              className={row.type === 'INCOME' ? 'color-green' : 'color-red'}
            >
              {row.type === 'OUTCOME' && '- '}
              {row.amount} {row.coin.toUpperCase()}
            </strong>
          </div>
        </div>
      </div>
    );
  }
  expandColumnComponent({ isExpandableRow, isExpanded }) {
    return (
      <div className="view-transaction" title="View detail">
        <strong>
          {isExpanded ? (
            <span aria-hidden="true" className="icon-magnifier-remove" />
          ) : (
            <span aria-hidden="true" className="icon-magnifier-add" />
          )}
        </strong>
      </div>
    );
  }

  render() {
    const { data } = this.props;
    return (
      <BootstrapTable
        data={data}
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
          dataFormat={this.statusFormatter}
          width="200px"
          dataField="status"
          dataSort
        >
          <FormattedMessage id="app.history.deposit.status.title" />
        </TableHeaderColumn>
        <TableHeaderColumn
          dataFormat={this.cellStringFormatter}
          dataAlign="center"
          width="100px"
          dataField="coin"
          dataSort
        >
          <FormattedMessage id="app.history.deposit.currency.title" />
        </TableHeaderColumn>
        <TableHeaderColumn
          dataFormat={this.cellStringFormatter}
          dataAlign="center"
          width="100px"
          dataField="bank_code"
          dataSort
        >
          <FormattedMessage id="app.history.deposit.cash.bankname" />
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="amount"
          dataSort
          dataAlign="right"
          width="15%"
        >
          <FormattedMessage id="app.history.deposit.amount.title" />
        </TableHeaderColumn>
        <TableHeaderColumn
          width="50%"
          dataSort
          dataFormat={this.addressFormatter}
          dataField="memo"
        >
          <FormattedMessage id="app.history.deposit.transactioninfo.title" />
        </TableHeaderColumn>
        <TableHeaderColumn hidden dataField="to_address" dataSort>
          <FormattedMessage id="app.history.deposit.status.title" />
        </TableHeaderColumn>
        <TableHeaderColumn hidden dataField="from_address" dataSort>
          From Address
        </TableHeaderColumn>
        <TableHeaderColumn
          hidden
          width="45%"
          dataField="tx_id"
          dataSort
          dataFormat={this.transactionFormatter}
        >
          Transaction ID
        </TableHeaderColumn>
        <TableHeaderColumn
          hidden
          isKey
          dataFormat={this.cellDateFormatter}
          dataField="created_at"
          dataSort
        >
          Date
        </TableHeaderColumn>
      </BootstrapTable>
    );
  }
}

export default CashHistoryTable;
