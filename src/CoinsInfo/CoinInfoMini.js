/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { getCoinsInfo, updateCoinInfoData } from '../Redux/actions/coin';
import ReactBootstrapTable from '../ReactBootstrapTable/ReactBootstrapTable';
import history from '../history';
import { connect } from 'react-redux';
import { formatNumber, openNewWindow } from '../Helpers/utils';
import HighlightablePrice from '../Processing/HighlightablePrice.js';
import { FormattedMessage } from 'react-intl';
import matchSorter from 'match-sorter';
import { GLOBAL_VARIABLES } from '../Helpers/constants/system';

class CoinInfoMini extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      getCoinsInfo: PropTypes.func.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      coinInfoUpdate: [],
      sorted: [],
      currentSortCriteria: 'none',
    };
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.getCoinsInfo(this.props.socket);
    var updateCoinInfoDataInterval = setInterval(() => {
      actions.updateCoinInfoData();
    }, GLOBAL_VARIABLES.GET_COIN_INFO_INTERVAL_TIME);
    this.setState({
      updateCoinInfoDataInterval: updateCoinInfoDataInterval,
    });
  }

  componentWillMount() {
    clearInterval(this.state.updateCoinInfoDataInterval);
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

  renderCoinInfoMiniTable() {
    const { coinsInfo, coinsInfoUptoDate, isSimpleTrading } = this.props;
    var coinInfoData = coinsInfoUptoDate ? coinsInfoUptoDate : coinsInfo;
    if (coinInfoData) {
      coinInfoData = isSimpleTrading
        ? coinInfoData.filter(item => !!item.fast)
        : coinInfoData.filter(item => !!item.normal);

      // coinInfoData = coinInfoData.sort(
      //   (a, b) =>
      //     parseInt(a.sort_no, 10) - parseInt(b.sort_no, 10) ||
      //     a.coin_id.localeCompare(b.coin_id),
      // );

      const columns = [
        {
          Header: 'name',
          accessor: 'coin_name',
          minWidth: 70,
          filterable: true,
          filterMethod: (filter, props) => {
            return matchSorter(props, filter.value, {
              keys: ['coin_name', '_original.coin'],
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
          Cell: props => (
            <div>
              <div>
                <span>
                  {props.value} - {props.row._original.coin}
                </span>
              </div>
              <div className="font-blue">
                <HighlightablePrice
                  isBlinkOnly={true}
                  price={formatNumber(
                    isSimpleTrading
                      ? props.row._original.fast_ask_price
                      : props.row._original.bid_price_vnd,
                  )}
                />
              </div>
            </div>
          ),
        },
        {
          Header: 'change_24h',
          accessor: 'change_24h',
          minWidth: 70,
          filterable: true,
          sortMethod: (a, b) => {
            var numberA = Number(a ? a : 0, 10);
            var numberB = Number(b ? b : 0, 10);
            return numberA - numberB;
          },
          Cell: props => (
            <div>
              <div>
                <span>{props.value}%</span>
              </div>
              <div className="font-red">
                <HighlightablePrice
                  isBlinkOnly={true}
                  price={formatNumber(
                    isSimpleTrading
                      ? props.row._original.fast_bid_price
                      : props.row._original.ask_price_vnd,
                  )}
                />
              </div>
            </div>
          ),
          filterMethod: (filter, row) => {
            var sortCriteria = '';
            switch (filter.value) {
              case 'name-asc':
                this.sortTable({
                  desc: false,
                  id: 'coin_name',
                });
                break;
              case 'name-desc':
                this.sortTable({
                  desc: true,
                  id: 'coin_name',
                });
                break;
              case 'bid-asc':
                this.sortTable({
                  desc: false,
                  id: 'bid_price_vnd',
                });
                break;
              case 'bid-desc':
                this.sortTable({
                  desc: true,
                  id: 'bid_price_vnd',
                });
                break;
              case 'ask-asc':
                this.sortTable({
                  desc: false,
                  id: 'ask_price_vnd',
                });
                break;
              case 'ask-desc':
                this.sortTable({
                  desc: true,
                  id: 'ask_price_vnd',
                });
                break;
              case 'price-change-asc':
                this.sortTable({
                  desc: false,
                  id: 'change_24h',
                });
                break;
              case 'price-change-desc':
                this.sortTable({
                  desc: true,
                  id: 'change_24h',
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
              <option value="bid-asc">
                <FormattedMessage id="app.global.sort.bidprice.asc">
                  {txt => {
                    return txt;
                  }}
                </FormattedMessage>
              </option>
              <option value="bid-desc">
                <FormattedMessage id="app.global.sort.bidprice.desc">
                  {txt => {
                    return txt;
                  }}
                </FormattedMessage>
              </option>
              <option value="ask-asc">
                <FormattedMessage id="app.global.sort.askprice.asc">
                  {txt => {
                    return txt;
                  }}
                </FormattedMessage>
              </option>
              <option value="ask-desc">
                <FormattedMessage id="app.global.sort.askprice.desc">
                  {txt => {
                    return txt;
                  }}
                </FormattedMessage>
              </option>
              <option value="price-change-asc">
                <FormattedMessage id="app.global.sort.pricechange.asc">
                  {txt => {
                    return txt;
                  }}
                </FormattedMessage>
              </option>
              <option value="price-change-desc">
                <FormattedMessage id="app.global.sort.pricechange.desc">
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
          accessor: 'bid_price_vnd',
          show: false,
        },
        {
          Header: '',
          accessor: 'ask_price_vnd',
          show: false,
        },
      ];

      const coinInfoMiniTableProps = {
        className: 'mini-price-table -striped -highlight',
        data: coinInfoData,
        columns: columns,
        defaultPageSize: 15,
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
          const { isWidget, redirectedUrl } = this.props;
          return {
            onClick: () => {
              if (isWidget) {
                if (redirectedUrl) {
                  openNewWindow(redirectedUrl);
                }
              } else {
                history.push(
                  `/${isSimpleTrading ? 'mua-ban-nhanh' : 'mua-ban'}/${rowInfo
                    .original.coin_id}`,
                );
              }
            },
          };
        },
      };

      return <ReactBootstrapTable {...coinInfoMiniTableProps} />;
    } else {
      return '';
    }
  }

  render() {
    return <div>{this.renderCoinInfoMiniTable()}</div>;
  }
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ coinsInfo }) {
  const coins = (coinsInfo && coinsInfo.coinsList) || null;
  const coinsInfoUptoDate = (coinsInfo && coinsInfo.coinsListUptoDate) || null;
  return {
    coinsInfo: coins,
    coinsInfoUptoDate,
  };
}

// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ getCoinsInfo, updateCoinInfoData }, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(CoinInfoMini);
