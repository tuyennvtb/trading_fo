import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getSendHistory } from '../Redux/actions/wallet';
import TransactionTable from './TransactionTable';
import { FormattedMessage } from 'react-intl';

class SendHistoryForm extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      getSendHistory: PropTypes.func.isRequired,
    }).isRequired,
    history: PropTypes.object,
  };

  static defaultProps = {
    history: null,
  };

  async componentDidMount() {
    // send create coin request if it's the first time user open the coin
    const { actions } = this.props;
    await actions.getSendHistory();
    var getSendHistoryInterval = setInterval(
      await actions.getSendHistory,
      30000,
    );
    this.setState({ getSendHistoryInterval: getSendHistoryInterval });
  }

  componentWillUnmount() {
    clearInterval(this.state.getSendHistoryInterval);
  }

  render() {
    const { history } = this.props;
    const transactions =
      (history && history.status === true && history.data) || [];
    const records = transactions.length > 0 ? transactions : [];
    return (
      <div className="portlet light bordered paper-3">
        <div className="portlet-title">
          <div className="caption">
            <i className="fa fa-upload" />
            <span className="caption-subject bold uppercase">
              <FormattedMessage id="app.history.withdraw.title" />
            </span>
          </div>
        </div>
        <div className="portlet-body history">
          {history !== null ? (
            <TransactionTable data={records} type="withdraw" />
          ) : (
            <p className="spin-loading">Loading...</p>
          )}
        </div>
      </div>
    );
  }
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ wallet }) {
  const history = (wallet && wallet.transactions) || null;
  return {
    history,
  };
}
// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ getSendHistory }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SendHistoryForm);
