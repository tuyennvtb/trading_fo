import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getOrderHistory } from '../Redux/actions/exchange';
import OrderTable from './OrderTable';
import { FormattedMessage } from 'react-intl';
import openSocket from 'socket.io-client';
import { SocketIOHost } from '../Core/config';

class OrderHistoryForm extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      getOrderHistory: PropTypes.func.isRequired,
    }).isRequired,
    orderConfirmed: PropTypes.array,
    coin_id: PropTypes.string.isRequired,
  };

  static defaultProps = {
    orderConfirmed: [],
  };

  constructor(props) {
    super(props);
    this.socket = openSocket(SocketIOHost);
  }

  async componentDidMount() {
    // send create coin request if it's the first time user open the coin
    const { actions, coin_id } = this.props;
    await actions.getOrderHistory(coin_id, this.socket);
  }

  async componentDidUpdate(prevProps) {
    const { actions, coin_id } = this.props;
    if (prevProps.coin_id !== coin_id) {
      this.socket.close();
      this.socket = openSocket(SocketIOHost);
      await actions.getOrderHistory(coin_id, this.socket);
    }
  }

  componentWillUnmount() {
    this.socket.close();
  }

  render() {
    const { orderConfirmed } = this.props;
    return (
      <div className="portlet mt-element-ribbon light portlet-fit bordered paper-3">
        <div className="ribbon ribbon-left ribbon-vertical-left ribbon-shadow ribbon-border-dash-vert ribbon-color-primary uppercase">
          <div className="ribbon-sub ribbon-bookmark" />
          <i className="fa fa-upload" />
        </div>
        <div className="portlet-title">
          <div className="caption">
            <span className="caption-subject bold uppercase">
              <FormattedMessage id="app.order.confirmed" />
            </span>
          </div>
        </div>
        <div className="portlet-body history">
          {orderConfirmed !== null ? (
            <OrderTable data={orderConfirmed} type="confirmed" />
          ) : (
            <p className="spin-loading">Loading...</p>
          )}
        </div>
      </div>
    );
  }
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ exchange }) {
  const orderConfirmed = (exchange && exchange.orderConfirmed) || [];
  return {
    orderConfirmed,
  };
}
// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ getOrderHistory }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderHistoryForm);
