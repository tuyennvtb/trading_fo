import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, FormattedDate } from 'react-intl';
import { convertDateByTimeZone, formatNumber } from '../Helpers/utils';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

class SwapHistory extends React.Component {
  formatRow(cell, row) {
    return (
      <div className="p-2">
        <div className={`${row.from_coin == 'ethereum' ? 'green-bg' : 'red-bg'} col-title`}>
          <b>{row.from_coin.toUpperCase()}</b> -> <b>{row.to_coin.toUpperCase()}</b>
        </div>
        <div className="col-xs-12 p-0">
          <div className="col-xs-6">
            <span><FormattedMessage id="page.swap.label.transactionId" />: </span>
          </div>
          <div className="col-xs-6">
            <span>{row.transaction_id}</span>
          </div>
        </div>
        {row.tx_id &&
          <div className="col-xs-12 p-0">
            <div className="col-xs-6">
              <span>Txid: </span>
            </div>
            <div className="col-xs-6">
              <span className="break-text">
                {row.tx_id}
                <span className="tooltip-content">
                  <a className="btn has-tooltip p-0" data-clipboard-text={row.tx_id}>
                    <i className="fas fa fa-copy"></i>
                  </a>
                  <div
                    className="tooltip fade bottom"
                    role="tooltip"
                  >
                    <div className="tooltip-arrow" />
                    <div className="tooltip-inner">
                      <FormattedMessage id="app.global.copied" />
                    </div>
                  </div>
                </span>
              </span>
            </div>
          </div>
        }
        <div className="col-xs-12 p-0">
          <div className="col-xs-6">
            <span><FormattedMessage id="page.swap.label.amount" />: </span>
          </div>
          <div className="col-xs-6">
            <span>{row.from_amount}</span>
          </div>
        </div>
        <div className="col-xs-12 p-0">
          <div className="col-xs-6">
            <span><FormattedMessage id="page.swap.label.estimateReceive" />: </span>
          </div>
          <div className="col-xs-6">
            <span>{formatNumber(row.estimate_receive_amount, 5)}</span>
          </div>
        </div>
        <div className="col-xs-12 p-0">
          <div className="col-xs-6">
            <span><FormattedMessage id="page.swap.label.deliveredAmount" />: </span>
          </div>
          <div className="col-xs-6">
            <span>{formatNumber(row.final_delivered_amount, 5)}</span>
          </div>
        </div>
        <div className="col-xs-12 p-0">
          <div className="col-xs-6">
            <span><FormattedMessage id="page.swap.label.status" />: </span>
          </div>
          <div className="col-xs-6">
            <span><b>{row.status}</b></span>
          </div>
        </div>
        <div className="col-xs-12 p-0">
          <div className="col-xs-6">
            <span><FormattedMessage id="page.swap.label.date" />: </span>
          </div>
          <div className="col-xs-6">
            <span title={row.created_at}>
              <FormattedDate
                value={convertDateByTimeZone(row.created_at)}
                year="numeric"
                month="short"
                day="2-digit"
                hour="2-digit"
                hour12={false}
                minute="2-digit"
                second="2-digit"
              />
            </span>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { transactions } = this.props;
    const data = transactions;
    return (
      <div className="ui-view">
        <div id="history-box-content">
          <div className="mt-3">
            <BootstrapTable
              data={data}
              className='table-striped table-advance order-table-container'
              bordered={false}
              pagination
              condensed
              multiColumnSort={3}
            >
              <TableHeaderColumn
                isKey
                dataFormat={this.formatRow.bind(this)}
                dataField="transaction_id"
              />
            </BootstrapTable>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps({ swap }) {
  const transactions = swap.transactions || [];
  return {
    transactions
  };
}

export default injectIntl(connect(mapStateToProps)(SwapHistory));