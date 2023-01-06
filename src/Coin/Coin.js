import React from 'react';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import { transformString } from '../Helpers/utils';
import Link from '../Link';
import '../assets/css/pages/coin.css';
class Coin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      coinDisplayName: '',
      coinCode: '',
    };
  }

  componentDidMount() {
    const { coin_id } = this.props;
    if (!_.isEmpty(coin_id)) {
      var arr = coin_id.split('-');
      if (arr.length > 1) {
        this.setState({
          coinDisplayName: transformString(coin_id),
          coinCode: arr[1],
        });
      }
    }
  }

  render() {
    const { coinDisplayName } = this.state;
    return (
      <div className="container-fluid coin-page">
        <div className="row">
          <div className="col-md-12">
            <h3 className="title text-center bold">
              <FormattedMessage
                id="app.coin.titleextend"
                values={{
                  displayName: coinDisplayName,
                }}
              />
            </h3>
            <div className="description">
              <span className="label label-primary buy-coin">
                {' '}
                <FormattedMessage id="app.exchange.form.buy.title" />{' '}
                {coinDisplayName}{' '}
              </span>
              <span className="label label-primary">
                {' '}
                <FormattedMessage id="app.exchange.form.sell.title" />{' '}
                {coinDisplayName}{' '}
              </span>
              <span className="label label-primary">
                {' '}
                <FormattedMessage id="app.exchange.title" /> {coinDisplayName}{' '}
              </span>
              <span className="label label-primary">
                {' '}
                <FormattedMessage id="app.exchange.form.buynow.title" />{' '}
                {coinDisplayName}{' '}
              </span>
              <span className="label label-primary">
                {' '}
                <FormattedMessage id="app.coin.invest" /> {coinDisplayName}{' '}
              </span>
            </div>
            <div className="actions">
              <Link
                href={`/mua-ban/${this.state.coinCode}`}
                className="btn btn-success btn-lg"
              >
                <i className="fa fa-money" />
                <FormattedMessage id="app.exchange.form.buynow.title" />
              </Link>
              <Link
                href={`/mua-ban/${this.state.coinCode}`}
                className="btn btn-danger btn-lg"
              >
                <i className="fa fa-money" />
                <FormattedMessage id="app.exchange.form.sellnow.title" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Coin;
