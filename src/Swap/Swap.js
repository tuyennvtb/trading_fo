import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import openSocket from 'socket.io-client';
import { getSWAPListCoins } from '../Redux/actions/swap';
import { CHECK_IS_MOBILE } from '../Helpers/constants/system';
import { SocketIOHost } from '../Core/config';
import BootstrapTable from '../BootstrapTable';
import { ucFirst } from '../Helpers/utils';
import Link from '../Link';
import '../assets/css/pages/exchange.css';

class Swap extends React.Component {
  constructor(props) {
    super(props);
    this.socket = openSocket(SocketIOHost);
  }

  state = {
    dataTable: []
  }

  componentDidMount() {
    const { actions } = this.props;
    actions.getSWAPListCoins(this.socket);
  }

  componentWillUnmount() {
    this.socket.close();
  }

  coinFormatter = (cell, row) => {
    return (
      <button
        className="btn bg-primary label"
      >
        <span className="coin-svg">
          <i className={`cf cf-${row.to_coin_code.toLowerCase()}`}></i>
        </span>
        <span className="coin-name">{`${ucFirst(row.to_coin_id)} - `}</span>
        <span className="coin-code">{`${row.to_coin_code}`}</span>
      </button>
    );
  }

  btnSwapFormatter = (cell, row) => {
    return (
      <Link
        href={`/swap/${row.to_coin_id}/${row.from_coin_id}`}
        className="btn btn-outline yellow"
      >
        <FormattedMessage id="page.swap.table.btn.swap" />
      </Link>
    );
  }

  render() {
    const { coins } = this.props;
    const options = {
      // sortName: "volume_usd_24h",
      // sortOrder: "desc",
    }
    const columns = [
      {
        dataField: 'to_coin_id',
        dataAlign: 'center',
        dataFormat: this.coinFormatter,
        isKey: true,
        label: <FormattedMessage id="page.swap.table.coin" />
      },
      {
        dataField: 'to_coin_code',
        hidden: true
      },
      {
        dataField: 'from_token_price',
        dataAlign: 'center',
        dataFormat: 'priceFormatter',
        searchable: false,
        label: 'ETH'
      },
      {
        dataField: '',
        dataAlign: 'center',
        dataFormat: this.btnSwapFormatter,
        searchable: false,
        label: <FormattedMessage id="page.swap.table.btn.swap" />
      }
    ];
    return (
      <div>
        <BootstrapTable type="swap" data={coins} options={options} columns={columns} />
      </div>
    );
  }
}

function mapStateToProps({ swap }) {
  const coins = swap.coins;

  return {
    coins: coins
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ getSWAPListCoins }, dispatch),
  };
}

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(Swap),
);

