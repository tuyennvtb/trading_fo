import React from 'react';
import { FormattedDate, FormattedTime } from 'react-intl';
import PropTypes from 'prop-types';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { formatNumber, convertDateByTimeZone } from '../Helpers/utils';
import {
  WALLET_ORDER_STATUS,
  GLOBAL_VARIABLES,
} from '../Helpers/constants/system';
class TransactionTable extends React.Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    type: PropTypes.string.isRequired,
    intl: intlShape.isRequired,
  };

  static defaultProps = {
    data: [],
    type: 'deposit',
  };

  constructor(props) {
    super(props);
    this.isExpandableRow = this.isExpandableRow.bind(this);
    this.expandColumnComponent = this.expandColumnComponent.bind(this);
    this.cellDateFormatter = this.cellDateFormatter.bind(this);
    this.cellStringFormatter = this.cellStringFormatter.bind(this);
    this.transactionFormatter = this.transactionFormatter.bind(this);
    this.addressFormatter = this.addressFormatter.bind(this);
    this.statusFormatter = this.statusFormatter.bind(this);
  }

  cellDateFormatter(cell, row) {
    return (
      <span title={cell}>
        <FormattedDate
          value={convertDateByTimeZone(cell)}
          year="numeric"
          month="short"
          day="2-digit"
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
          <span><b>{cell.toUpperCase()}</b></span>
        </div>
        <div className="coin-amount">
          <p>
            <FormattedMessage id="app.history.deposit.amount.title" />
          </p>
          <span><b>{formatNumber(row.amount)}</b></span>
        </div>
      </div>
    );
  }

  statusFormatter(cell, row) {
    const { intl } = this.props;
    const order_completed = intl.formatMessage({
      id: 'app.global.text.completed',
    });
    const order_processing = intl.formatMessage({
      id: 'app.global.text.processing',
    });
    const order_reserve = intl.formatMessage({
      id: 'app.global.text.reserve',
    });
    const order_validated = intl.formatMessage({
      id: 'app.global.text.validated',
    });
    const order_cancel = intl.formatMessage({
      id: 'app.global.text.requestcancel',
    });
    const order_feedback = intl.formatMessage({
      id: 'app.global.text.feedback',
    });
    const order_fail = intl.formatMessage({
      id: 'app.global.text.failed',
    });
    let status = null;
    switch (row.status) {
      case WALLET_ORDER_STATUS.SUCCESS:
        status = (
          <span
            className="label label-success exchange-type"
            title={order_completed}
          >
            <strong>{order_completed}</strong>
          </span>
        );
        break;
      case WALLET_ORDER_STATUS.NEW:
      case WALLET_ORDER_STATUS.PROCESSING:
        status = (
          <span
            className="label label-warning exchange-type"
            title={order_processing}
          >
            <strong>{order_processing}</strong>
          </span>
        );
        break;
      case WALLET_ORDER_STATUS.RESERVE:
        status = (
          <span
            className="label label-info exchange-type"
            title={order_reserve}
          >
            <strong>{order_reserve}</strong>
          </span>
        );
        break;
      case WALLET_ORDER_STATUS.VALIDATED:
        status = (
          <span
            className="label label-success exchange-type"
            title={order_validated}
          >
            <strong>{order_validated}</strong>
          </span>
        );
        break;

      case WALLET_ORDER_STATUS.REQUEST_TO_CANCEL:
        status = (
          <span
            className="label label-success exchange-type"
            title={order_cancel}
          >
            <strong>{order_cancel}</strong>
          </span>
        );
        break;

      case WALLET_ORDER_STATUS.FEEDBACK:
        status = (
          <span
            className="label label-warning exchange-type"
            title={order_feedback}
          >
            <strong>{order_feedback}</strong>
          </span>
        );
        break;

      case WALLET_ORDER_STATUS.FAIL:
        status = (
          <span className="label label-danger exchange-type" title={order_fail}>
            <strong>{order_fail}</strong>
          </span>
        );
        break;
      default:
        status = (
          <span
            className="label label-warning exchange-type"
            title={order_processing}
          >
            <strong>{order_processing}</strong>
          </span>
        );
    }
    return (
      <div>
        {status}
        <span className="date-time" title={row.created_at}>
          <i className="fa fa-calendar" /> &nbsp;
          <FormattedDate
            value={convertDateByTimeZone(row.created_at)}
            year="numeric"
            month="2-digit"
            day="2-digit"
          />&nbsp;&nbsp;&nbsp;
          <i className="fa fa-clock-o" />&nbsp;
          <FormattedTime
            hour12={false}
            value={convertDateByTimeZone(row.created_at)}
            hour="2-digit"
            minute="2-digit"
            second="2-digit"
          />
        </span>
      </div>
    );
  }
  amountFormatter(cell, row) {
    return formatNumber(cell);
  }
  addressFormatter(cell, row) {
    const { type } = this.props;
    let addressValue =
      type === GLOBAL_VARIABLES.WALLET_TYPE.DEPOSIT
        ? row.from_address
        : row.to_address;
    let addressSection = null;
    let destinationTag = null;
    let transactionStatus = null;
    let confirmationStatus = null;

    if (row.coin !== GLOBAL_VARIABLES.BASE_CURRENCY) {
      if (type === GLOBAL_VARIABLES.WALLET_TYPE.DEPOSIT) {
        switch (row.status) {
          case WALLET_ORDER_STATUS.SUCCESS:
            if (row.tx_id) {
              transactionStatus = (
                <div className="tx-id line-break item-address">
                  {' '}
                  <strong>TxID: </strong> <span>{row.tx_id}</span>{' '}
                </div>
              );
            }
            break;
          case WALLET_ORDER_STATUS.NEW:
          case WALLET_ORDER_STATUS.PROCESSING:
            if (
              row.min_confirmation_number !== 'undefined' &&
              row.confirmation_number !== 'undefined'
            ) {
              confirmationStatus = (
                <div className="item-address">
                  <strong>
                    {' '}
                    <FormattedMessage id="app.coin.history.confirmation" />:
                  </strong>{' '}
                  <span>
                    {' '}
                    {row.confirmation_number} / {row.min_confirmation_number}
                  </span>{' '}
                </div>
              );
            }
            break;

          default:
            confirmationStatus = null;
        }
      } else {
        if (row.tx_id) {
          transactionStatus = (
            <div className="tx-id line-break item-address">
              {' '}
              <strong>TxID: </strong> <span>{row.tx_id}</span>{' '}
            </div>
          );
        }

        if (!!row.to_address_tag && row.to_address_tag !== '0') {
          destinationTag = (
            <div className="destination-tag">
              <strong>
                <FormattedMessage id="app.sendcoin.history.column.destinationtag" />:
              </strong>
              <span style={{ color: '#0275d8', fontWeight: 'bold' }}>
                {' '}
                {row.to_address_tag}
              </span>
            </div>
          );
        }
      }

      addressSection = (
        <div>
          <div className="address-value line-break item-address">
            <strong>
              <FormattedMessage id="app.sendcoin.history.column.address" />:
            </strong>{' '}
            {addressValue}
          </div>
          {destinationTag}
          {transactionStatus}
          {confirmationStatus}
        </div>
      );
    } else {
      let withdrawMemo = null;
      if (row.type === GLOBAL_VARIABLES.WALLET_TYPE.OUTCOME) {
        withdrawMemo = (
          <FormattedMessage
            id="v2.cash.withdraw.memo"
            values={{
              amount: <strong>{formatNumber(row.amount)}</strong>,
              bankAccount: <strong>{row.user_bank_account}</strong>,
              bankUser: <strong>{row.user_bank_account_name}</strong>,
              bankCode: <strong>{row.bank_code}</strong>,
            }}
          />
        );
      } else {
        withdrawMemo = row.memo;
      }
      addressSection = (
        <div className="item-address">
          {' '}
          <div>
            <strong>
              <FormattedMessage id="user.withdraw.bankaccount.bankname" />:
            </strong>{' '}
            <span>{row.bank_code}</span>
          </div>
          <div>
            <strong>
              <FormattedMessage id="app.history.deposit.transactioninfo.title" />:
            </strong>{' '}
            <span>{withdrawMemo}</span>
          </div>
        </div>
      );
    }
    return (
      <div className="transaction-info">
        <div>
          <span className="bold">Transaction ID: </span>
          {row.transaction_id}
        </div>
        <div>{addressSection}</div>
      </div>
    );
  }

  isExpandableRow(row) {
    return true;
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

  mobileFormatter = (cell, row) => {
    return (
      <div>
         <div className="col-xs-12 p-0">
            {this.statusFormatter(cell,row)}
        </div>

        <div className="col-xs-12 p-0 text-left">
          <div className="col-xs-6">
            <p className="title">
            <FormattedMessage id="app.history.deposit.coin.title" />: <b>{row.coin.toUpperCase()}</b>
            </p>
          </div>
          <div className="col-xs-6">
            <p className="title">
            <FormattedMessage id="app.history.deposit.amount.title" />: <b>{formatNumber(row.amount)}</b>
            </p>
          </div>
        </div>

        <div className="col-xs-12 text-left">
          {this.addressFormatter(cell,row)}
        </div>

      </div>
    );
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
          dataFormat={this.mobileFormatter}
          isKey
          dataField="id"
          className="status-col-header visible-xs visible-sm mobile-col"
          columnClassName="status-col visible-xs visible-sm mobile-col"
          dataAlign="center"
          hidden
          width="100%"
        >
          <FormattedMessage id="app.history.deposit.transactioninfo.title" />
        </TableHeaderColumn>

        <TableHeaderColumn
          dataFormat={this.statusFormatter}
          // width="200px"
          dataField="status"
          className="status-col-header hidden-xs hidden-sm w-3"
          columnClassName="status-col hidden-xs hidden-sm w-3"
          dataAlign="center"
          dataSort
        >
          <FormattedMessage id="app.history.deposit.status.title" />
        </TableHeaderColumn>
        <TableHeaderColumn
          dataFormat={this.cellStringFormatter}
          dataAlign="center"
          dataField="coin"
          className="coin-col-header hidden-xs hidden-sm w-3"
          columnClassName="coin-col hidden-xs hidden-sm w-3"
          dataSort
        >
          <FormattedMessage id="app.history.deposit.coin.title" />
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="amount"
          dataFormat={this.amountFormatter}
          dataSort
          dataAlign="center"
          className="amount-col-header hidden-xs hidden-sm"
          columnClassName="amount-col hidden-xs hidden-sm"
          hidden
        >
          <FormattedMessage id="app.history.deposit.amount.title" />
        </TableHeaderColumn>
        <TableHeaderColumn
          dataSort
          dataFormat={this.addressFormatter}
          dataField="to_address"
          dataAlign="left"
          className="transaction-col-header hidden-xs hidden-sm"
          columnClassName="transaction-col hidden-xs hidden-sm"
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
          dataField="tx_id"
          dataSort
          dataFormat={this.transactionFormatter}
        >
          TX ID
        </TableHeaderColumn>
        <TableHeaderColumn
          hidden         
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

export default injectIntl(TransactionTable);
