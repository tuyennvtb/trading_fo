import _ from 'lodash';
import React from 'react';
import { FormattedDate } from 'react-intl';
import PropTypes from 'prop-types';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import Link from '../Link';
import { callApiCancelOrder, fbSharingTransaction } from '../Redux/actions/exchange';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { formatNumber, convertDateByTimeZone } from '../Helpers/utils';
import { EXCHANGE_ORDER_STATUS } from '../Helpers/constants/system';
import { FBSharing } from '../Helpers/FacebookUtils';
import { CHECK_IS_MOBILE } from '../Helpers/constants/system';

class OrderTable extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      callApiCancelOrder: PropTypes.func.isRequired,
    }).isRequired,
    data: PropTypes.array.isRequired,
    type: PropTypes.string.isRequired,
  };

  static defaultProps = {
    data: [],
    type: 'confirmed',
  };

  constructor(props) {
    super(props);
    this.cellDateFormatter = this.cellDateFormatter.bind(this);
    this.cellStringFormatter = this.cellStringFormatter.bind(this);
    this.quantityFormatter = this.quantityFormatter.bind(this);
    this.cancelOrderBtn = this.cancelOrderBtn.bind(this);
    this.cancelAction = this.cancelAction.bind(this);
  }

  state = {
    selectedCoin: ''
  }

  cellDateFormatter(cell, row) {
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

  dateColumn = (cell, row) => {
    return (
      <div>
        <span>
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
        <br />
        {row.actual_filled > 0 &&
          <span>
            <FormattedDate
              value={convertDateByTimeZone(row.updated_at)}
              year="numeric"
              month="short"
              day="2-digit"
              hour="2-digit"
              hour12={false}
              minute="2-digit"
              second="2-digit"
            />
          </span>
        }
      </div>
    );
  }

  quantityFormatter(cell, row) {
    return (
      <div>
        <div className="transaction-content">
          <span className="transaction-content__value">{formatNumber(cell)}</span>
        </div>
      </div>
    );
  }

  actualFilledFormatter(cell, row) {
    return (
      <div>
        <p className="title visible-xs visible-sm">
          <FormattedMessage id="app.order.actual_filled" />:
        </p>
        <span>{formatNumber(cell)}</span>

        <div className="visible-xs visible-sm">
          <p className="title">
            <FormattedMessage id="app.order.actual_total_amount" />:
          </p>
          <p>{formatNumber(row.cost_amount_after_fee)}</p>
        </div>
      </div>
    );
  }
  numberFormatter(cell, row) {
    return (
      <div className="transaction-content">
        <span className="transaction-content__value">{formatNumber(cell)}</span>
      </div>
    );
  }
  coinFormatter = (cell, row) => {
    if (cell) {
      return (
        <div className="text-center">
          <Link href={`/mua-ban/${cell}`} className={CHECK_IS_MOBILE() && 'coin-name'}>{cell.toUpperCase()}</Link>
          <div className="visible-xs visible-sm">
            {this.typeFormatter(row.type, row)}
          </div>
        </div>
      );
    } else {
      return '';
    }
  };

  typeFormatter(cell, row) {
    let transactionStatus = null;
    if (row.type.toUpperCase() === 'SELL') {
      transactionStatus = (
        <span className="label label-danger exchange-type">{cell}</span>
      );
    } else {
      transactionStatus = (
        <span className="label label-success exchange-type">{cell}</span>
      );
    }
    return (
      <div>{transactionStatus}</div>
    );
  }

  async cancelAction(e, id) {
    const { actions } = this.props;
    await actions.callApiCancelOrder(id);
  }

  cancelOrderBtn(cell, row) {
    if (
      row.status === EXCHANGE_ORDER_STATUS.OPEN ||
      row.status === EXCHANGE_ORDER_STATUS.ACTIVE ||
      row.status === EXCHANGE_ORDER_STATUS.PARTIAL
    ) {
      return (
        <div>
          <button
            className="btn btn-outline btn-circle red btn-sm btn-block"
            onClick={e => this.cancelAction(e, cell)}
          >
            <i className="fa fa-trash" />{' '}
            <FormattedMessage id="app.order.cancel" />
          </button>
        </div>
      );
    }
  }

  cellStringFormatter(cell, row) {
    var spanClass = 'label-default';
    var statusMessage = cell.toUpperCase();
    var title = '';
    switch (cell.toLowerCase()) {
      case 'open':
        spanClass = 'label-primary font-white';
        break;
      case 'processing':
        spanClass = 'label-warning font-white';
        break;
      case 'closed':
        spanClass = 'label-default';
        statusMessage = 'COMPLETED';
        break;
      case 'partial':
        spanClass = 'label-danger font-white';
        title = "Đã khớp 1 phần";
        break;
      default:
        spanClass = 'label-default';
        break;
    }
    return (
      <div title={title}>
        <span className={'label status ' + spanClass}>{statusMessage}</span>
      </div>
    );
  }

  mobileFormatter(cell, row) {
    return (
      <div className="visible-xs visible-sm">
        <Link href={`/mua-ban/${row.coin_id}`} className={'coin-name'}>{row.coin_id.toUpperCase()}</Link>

        <div>
          <span className="title">Transaction ID: </span>
          <span>{row.unique_id}</span>
          <span className="tooltip-content">
            <a className="btn has-tooltip" data-clipboard-text={row.unique_id}>
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
        </div>

        <div className="col-xs-12 p-0">
          <div className="col-xs-6 pl-0">
            <p className="title">
              <FormattedMessage id="app.order.quantity" />: {formatNumber(row.quantity)}
            </p>
          </div>
          <div className="col-xs-6 ">
            <p className="title">
              <FormattedMessage id="app.order.actual_filled" />:
              {' '}
              <span className="data-fill">{formatNumber(row.actual_filled)}</span>
            </p>
          </div>
        </div>

        <div className="col-xs-12 p-0">
          <div className="col-xs-6 pl-0">
            <p className="title">
              <FormattedMessage id="app.order.price" />: {formatNumber(row.price)}
            </p>
          </div>
          <div className="col-xs-6">
            <p className="title">
              <FormattedMessage id="app.order.actual_price" />:
              {' '}
              <span className="data-fill">{formatNumber(row.price)}</span>
            </p>
          </div>
        </div>

        <div className="col-xs-12 p-0">
          <div className="col-xs-6 pl-0">
            <p className="title">
              <FormattedMessage id="app.order.estimate_total" />: {formatNumber(row.estimate_total_vnd)}
            </p>
          </div>

          <div className="col-xs-6">
            <p className="title">
              <FormattedMessage id="app.order.actual_total_amount" />:
              {' '}
              <span className="data-fill">{formatNumber(row.cost_amount_after_fee)}</span>
            </p>
          </div>
        </div>

        <div className="col-xs-12 p-0">
          <div className="col-xs-12 pl-0">
            <p className="title">
              <FormattedMessage id="app.order.status" />:
              {this.attrs.formatStatus(row.status)}
            </p>
          </div>
        </div>

        <div className="col-xs-12 p-0">
          {row.actual_filled > 0 &&
            <div className="col-xs-12 pl-0">
              <p className="title">
                <FormattedMessage id="app.order.actual_filled_time" />:
              {' '}

                <span className="data-fill">{this.attrs.formatDate(row.updated_at)}</span>
              </p>
            </div>
          }
          <div className="col-xs-12 pl-0">
            <p className="title">
              <FormattedMessage id="app.order.date" />: {this.attrs.formatDate(row.created_at)}
            </p>
          </div>
        </div>

        <div className="col-xs-12 p-0">
          <div className="col-xs-6 pl-0">
            <p className="title">
              {this.attrs.cancelOrderBtn(cell, row)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  _onClickSharingFB = (transaction_id) => {
    const params = {
      method: 'share',
      href: 'https://bitmoon.net/',
      quote: 'Welcome to Bitmoon.net',
      hashtag: 'bitmoon.net'
    };

    FBSharing(params, (response) => {
      if (response && !response.error_message) {
        // update in here
        this.props.actions.fbSharingTransaction(transaction_id);
        this.props.reloadHistory();
      } else {
        console.log('Error while posting.');
      }
    });
  }

  FBSharingFormatter = (cell, row) => {
    if (row.is_shared == 0) {
      const { sharing } = this.props;
      const { status } = row;
      if (status.toLowerCase() == 'closed' ||
        status.toLowerCase() == 'canceled'
      ) {
        const transaction_fee = row.actual_total_amount - row.cost_amount_after_fee;
        if (transaction_fee > 0) {
          const start = moment(new Date(sharing.start)).unix();
          const transactionTime = moment(new Date(row.created_at)).unix();
          if (start <= transactionTime) {
            return (
              <span key={row.unique_id} onClick={() => this._onClickSharingFB(row.unique_id)}>
                <i className="fa fa-facebook-official fa-2x"></i>
              </span>
            );
          }
        }
      }
    }
    return null;
  }

  rowClassNameFormat(row, rowIdx) {
    // row is whole row object
    // rowIdx is index of row
    return row.type.toUpperCase() === 'SELL' ? 'row-table row-table--sell' : 'row-table row-table--buy';
  }

  _onChangeCoin = (option, funcSearch) => {
    if (option) {
      this.setState({
        selectedCoin: option,
      });
      funcSearch(option.value);
    } else {
      this.setState({
        selectedCoin: ''
      });
      funcSearch('');
    }
  }

  searchPanel = (searchProps) => {
    const { data } = this.props;
    const optionCoins = [];
    const listCoin = {};
    _.each(data, coin => {
      if (!listCoin[coin.coin_id]) {
        listCoin[coin.coin_id] = coin.coin_id;
        const option = {
          value: coin.coin_id,
          label: coin.coin_id
        };
        optionCoins.push(option);
      }
    });

    return (
      <div>
        <div className="form-group form-group-sm react-bs-table-search-form input-group input-group-sm">
          {searchProps.searchField}
          <span className="input-group-btn">
            {searchProps.clearBtn}
            <span>Clear</span>
          </span>
        </div>
        <div className="mt-10">
          <span className="title">
            <FormattedMessage id="app.order.listCoin" />
          </span>
          <Select
            className="react-select"
            name="DropdownCoin"
            options={optionCoins}
            onChange={(option) => (
              this._onChangeCoin(option, searchProps.search)
            )}
            value={this.state.selectedCoin}
            isClearable={0}
          />
        </div>
      </div>
    );
  }


  render() {
    const { data, type, isForAllCoins, sharing } = this.props;
    const isHiddenFromOpenTable = type === 'open';
    const isHiddenFromConfirmedTable = type === 'confirmed';

    return (
      <BootstrapTable
        data={data}
        className={`table-striped table-advance order-table-container ${type}`}
        hover
        bordered={false}
        pagination
        condensed
        multiColumnSort={3}
        search
        options={{
          clearSearch: true,
          searchPosition: 'left',
          searchPanel: this.searchPanel
        }}
        trClassName={this.rowClassNameFormat}
      >
        <TableHeaderColumn
          dataField="unique_id"
          dataSort
          columnClassName="hidden-xs hidden-sm unique-id-col"
          className="hidden-xs hidden-sm unique-id-col-header"
          dataAlign="center"
        >
          Transaction ID
        </TableHeaderColumn>

        <TableHeaderColumn
          dataFormat={this.coinFormatter}
          dataField="coin_id"
          dataSort
          columnClassName="hidden-xs hidden-sm coin-col"
          className="hidden-xs hidden-sm coin-col-header"
          dataAlign="center"
        >
          Coin
        </TableHeaderColumn>

        <TableHeaderColumn
          dataField="unique_id"
          dataFormat={this.mobileFormatter}
          tdAttr={{
            cancelOrderBtn: this.cancelOrderBtn,
            formatDate: this.cellDateFormatter,
            formatStatus: this.cellStringFormatter
          }}
          columnClassName="visible-xs visible-sm unique-id-col"
          className="visible-xs visible-sm unique-id-col-header"
          dataAlign="center"
        >
        </TableHeaderColumn>

        <TableHeaderColumn
          dataFormat={this.typeFormatter}
          // width="10%"
          dataField="type"
          dataSort
          columnClassName="hidden-xs hidden-sm type-col"
          className="hidden-xs hidden-sm type-col-header"
          dataAlign="center"
        >
          <FormattedMessage id="app.order.type" />
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="quantity"
          dataSort
          hidden={isHiddenFromConfirmedTable}
          dataFormat={this.quantityFormatter}
          dataAlign="center"
          columnClassName={'hidden-xs hidden-sm quantity-col ' + type}
          className={'hidden-xs hidden-sm quantity-col-header ' + type}
        >
          <FormattedMessage id="app.order.quantity" />
        </TableHeaderColumn>
        <TableHeaderColumn
          dataFormat={this.numberFormatter}
          dataField="price"
          dataSort
          hidden={isHiddenFromConfirmedTable || (isHiddenFromOpenTable && CHECK_IS_MOBILE())}
          columnClassName="hidden-xs hidden-sm price-col"
          className="hidden-xs hidden-sm price-col-header"
          dataAlign="center"
        >
          <FormattedMessage id="app.order.price" />
        </TableHeaderColumn>
        <TableHeaderColumn
          dataFormat={this.numberFormatter}
          dataField="estimate_total_vnd"
          dataSort
          // width="15%"
          hidden={isHiddenFromConfirmedTable || (isHiddenFromOpenTable && CHECK_IS_MOBILE())}
          columnClassName="hidden-xs hidden-sm estimate-total-col"
          className="hidden-xs hidden-sm estimate-total-col-header"
          dataAlign="center"
        >
          <FormattedMessage id="app.order.estimate_total" />
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="actual_filled"
          dataFormat={this.actualFilledFormatter}
          dataSort
          tdAttr={{
            formatDate: this.cellDateFormatter
          }}
          columnClassName={'hidden-xs hidden-sm actual-filled-col ' + type}
          className={'hidden-xs hidden-sm actual-filled-col-header ' + type}
          // width="15%"
          dataAlign="center"
        >
          <FormattedMessage id="app.order.actual_filled" />
        </TableHeaderColumn>
        <TableHeaderColumn
          dataFormat={this.numberFormatter}
          dataField="price"
          dataSort
          hidden={isHiddenFromOpenTable}
          columnClassName="hidden-xs hidden-sm actual-price-col"
          className="hidden-xs hidden-sm actual-price-col-header"
          dataAlign="center"
        >
          <FormattedMessage id="app.order.actual_price" />
        </TableHeaderColumn>

        <TableHeaderColumn
          hidden={isHiddenFromOpenTable}
          dataFormat={this.numberFormatter}
          dataField="cost_amount_after_fee"
          dataSort
          columnClassName={'hidden-xs hidden-sm actual-amount-col ' + type}
          className={'hidden-xs hidden-sm actual-amount-col-header ' + type}
          // width="15%"
          dataAlign="center"
        >
          <FormattedMessage id="app.order.actual_total_amount" />
        </TableHeaderColumn>
        <TableHeaderColumn
          isKey
          dataField="created_at"
          dataFormat={this.dateColumn}
          dataSort
          // width="15%"
          dataAlign="center"
          // hidden
          columnClassName="hidden-xs hidden-sm date-col"
          className="hidden-xs hidden-sm date-col-header"
        >
          <FormattedMessage id="app.order.date" />
        </TableHeaderColumn>
        <TableHeaderColumn
          dataFormat={this.cellStringFormatter}
          // width="15%"
          dataField="status"
          dataSort
          dataAlign="center"
          columnClassName={'hidden-xs hidden-sm status-col ' + type}
          className={'hidden-xs hidden-sm status-col-header ' + type}
        >
          <FormattedMessage id="app.order.status" />
        </TableHeaderColumn>
        <TableHeaderColumn
          hidden={!isHiddenFromOpenTable}
          dataFormat={this.cancelOrderBtn}
          // width="15%"
          dataField="unique_id"
          dataAlign="center"
          columnClassName="hidden-xs hidden-sm cancel-button-col"
          className="hidden-xs hidden-sm cancel-button-col-header"
        />
        {
          sharing && sharing.enable &&
          <TableHeaderColumn
            dataAlign="center"
            dataFormat={this.FBSharingFormatter}
            columnClassName={'hidden-xs hidden-sm status-col ' + type}
            className={'hidden-xs hidden-sm status-col-header ' + type}
          >
            Sharing FB
        </TableHeaderColumn>
        }
      </BootstrapTable >
    );
  }
}

function mapStateToProps({ exchange }) {
  const orders = (exchange && exchange.orderCancel) || {};
  return {
    orders,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ callApiCancelOrder, fbSharingTransaction }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderTable);