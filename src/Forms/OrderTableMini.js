import React from 'react';
import { FormattedDate } from 'react-intl';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { formatNumber, convertDateByTimeZone } from '../Helpers/utils';
import matchSorter from 'match-sorter';
import {
  EXCHANGE_ORDER_STATUS,
  EXCHANGE_ORDER_TYPE,
} from '../Helpers/constants/system';
import ReactBootstrapTable from '../ReactBootstrapTable/ReactBootstrapTable';
import history from '../history';

class OrderTableMini extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sorted: [],
      currentSortCriteria: 'none',
    };
  }

  sortTable = sortedState => {
    this.setState({
      sorted: [sortedState],
    });
  };

  resetSortState = () => {
    this.setState({
      sorted: [],
    });
  };

  renderOrderTableMini = () => {
    const { orders } = this.props;
    if (orders) {
      const columns = [
        {
          Header: '',
          accessor: 'type',
          filterable: true,
          headerClassName: 'type-col-header',
          className: 'type-col',
          filterMethod: (filter, props) => {
            return matchSorter(props, filter.value, {
              keys: ['_original.coin_id'],
            });
          },
          filterAll: true,
          Filter: ({ onChange }) => (
            <div className="input-icon">
              <i className="fa fa-search" />
              <input
                type="text"
                onChange={event => onChange(event.target.value)}
                className="form-control"
                placeholder="Search"
              />{' '}
            </div>
          ),
          Cell: props => {
            var labelClass = 'bg-green-jungle';
            if (props.value === EXCHANGE_ORDER_TYPE.SELL) {
              labelClass = 'label-danger';
            }
            labelClass += ' label exchange-type';
            return (
              <div>
                <div className="primary-row">
                  <span className={labelClass}>{props.value}</span>
                </div>
                <div className="sub-row">
                  <span className="uppercase">
                    {props.row._original.coin_id}
                  </span>
                </div>
              </div>
            );
          },
        },
        {
          Header: '',
          accessor: 'quantity',
          width: 95,
          headerClassName: 'quantity-col-header',
          Cell: props => (
            <div>
              <div className="primary-row">
                <span>SL: {props.value}</span>
              </div>
              <div className="sub-row">
                <span>Giá: {formatNumber(props.row._original.price)}</span>
              </div>
            </div>
          ),
        },
        {
          Header: '',
          accessor: 'status',
          filterable: true,
          Cell: props => {
            var spanClass = 'label-default';
            switch (props.value) {
              case EXCHANGE_ORDER_STATUS.OPEN:
                spanClass = 'label-primary font-white';
                break;
              case EXCHANGE_ORDER_STATUS.PROCESSING:
                spanClass = 'label-warning font-white';
                break;
              default:
                spanClass = 'label-default';
                break;
            }
            spanClass += ' label status';
            return (
              <div>
                <div className="primary-row">
                  <span className={spanClass}>{props.value}</span>
                </div>
                <div className="sub-row">
                  <span>
                    <FormattedDate
                      value={convertDateByTimeZone(
                        new Date(props.row._original.created_at),
                      )}
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
            );
          },
          filterMethod: (filter, row) => {
            var sortCriteria = '';
            switch (filter.value) {
              case 'name-asc':
                this.sortTable({
                  desc: false,
                  id: 'coin_id',
                });
                break;
              case 'name-desc':
                this.sortTable({
                  desc: true,
                  id: 'coin_id',
                });
                break;
              case 'type-asc':
                this.sortTable({
                  desc: false,
                  id: 'type',
                });
                break;
              case 'type-desc':
                this.sortTable({
                  desc: true,
                  id: 'type',
                });
                break;
              case 'status-asc':
                this.sortTable({
                  desc: false,
                  id: 'status',
                });
                break;
              case 'status-desc':
                this.sortTable({
                  desc: true,
                  id: 'status',
                });
                break;
              case 'date-asc':
                this.sortTable({
                  desc: false,
                  id: 'created_at',
                });
                break;
              case 'date-desc':
                this.sortTable({
                  desc: true,
                  id: 'created_at',
                });
                break;
              default:
                this.resetSortState();
                break;
            }
            sortCriteria = filter.value;
            this.setState({
              currentSortCriteria: sortCriteria,
            });
          },
          Filter: ({ filter, onChange }) => (
            <select
              onChange={event => onChange(event.target.value)}
              style={{ width: '100%' }}
              value={this.state.currentSortCriteria}
            >
              <option value="none">
                <FormattedMessage id="app.global.sort">
                  {txt => {
                    return txt;
                  }}
                </FormattedMessage>
              </option>
              <option value="name-asc">
                <FormattedMessage id="app.global.sort.name.asc">
                  {txt => {
                    return txt;
                  }}
                </FormattedMessage>
              </option>
              <option value="name-desc">
                <FormattedMessage id="app.global.sort.name.desc">
                  {txt => {
                    return txt;
                  }}
                </FormattedMessage>
              </option>
              <option value="status-asc">
                <FormattedMessage id="app.order.status">
                  {txt => {
                    return txt + ' (A -> Z)';
                  }}
                </FormattedMessage>
              </option>
              <option value="status-desc">
                <FormattedMessage id="app.order.status">
                  {txt => {
                    return txt + ' (Z -> A)';
                  }}
                </FormattedMessage>
              </option>
              <option value="type-asc">Buy -> Sell</option>
              <option value="type-desc">Sell -> Buy</option>
              <option value="date-asc">
                <FormattedMessage id="app.global.sort.transactiondate.asc">
                  {txt => {
                    return txt;
                  }}
                </FormattedMessage>
              </option>
              <option value="date-desc">
                <FormattedMessage id="app.global.sort.transactiondate.desc">
                  {txt => {
                    return txt;
                  }}
                </FormattedMessage>
              </option>
            </select>
          ),
        },
        {
          Header: '',
          accessor: 'coin_id',
          show: false,
        },
        {
          Header: '',
          accessor: 'created_at',
          show: false,
          sortMethod: (a, b) => {
            var dateA = new Date(a ? a : 0, 10);
            var dateB = new Date(b ? b : 0, 10);
            return dateA - dateB;
          },
        },
      ];
      const miniOrderTableProps = {
        className: 'mini-order-table -striped -highlight',
        data: orders,
        columns: columns,
        defaultPageSize: 15,
        minRows: 0,
        noDataText: <FormattedMessage id="app.order.noorders" />,
        filterable: false,
        sorted: this.state.sorted,
        onSortedChange: sorted => this.setState({ sorted }),
        showPageJump: false,
        showPageSizeOptions: false,
        previousText: <i className="fa fa-chevron-left" />,
        nextText: <i className="fa fa-chevron-right" />,
        loadingText: 'Loading...',
        pageText: <FormattedMessage id="app.global.page" />,
        ofText: '/',
        rowsText: '',
        getTrProps: (state, rowInfo, column) => {
          return {
            onClick: () => {
              history.push(`/mua-ban/${rowInfo.original.coin_id}`);
            },
          };
        },
      };
      return <ReactBootstrapTable {...miniOrderTableProps} />;
    } else {
      return '';
    }
  };
  render() {
    return <div>{this.renderOrderTableMini()}</div>;
  }
}

export default OrderTableMini;
