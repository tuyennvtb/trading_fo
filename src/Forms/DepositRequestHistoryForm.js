import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getDepositRequestHistory } from '../Redux/actions/wallet';
import DepositRequestTable from './DepositRequestTable';
import { FormattedMessage } from 'react-intl';

class DepositRequestHistoryForm extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      getDepositRequestHistory: PropTypes.func.isRequired,
    }).isRequired,
    history: PropTypes.object,
  };

  static defaultProps = {
    history: null,
  };

  async componentDidMount() {
    // send create coin request if it's the first time user open the coin
    const { actions } = this.props;
    await actions.getDepositRequestHistory();
    var getDepositHistoryInterval = setInterval(
      await actions.getDepositRequestHistory,
      30000,
    );
    this.setState({ getDepositHistoryInterval: getDepositHistoryInterval });
  }

  componentWillUnmount() {
    clearInterval(this.state.getDepositHistoryInterval);
  }

  render() {
    const { history } = this.props;
    const records = history && history.length > 0 ? history : [];
    return (
      <div className="portlet light bordered paper-3">
        <div className="portlet-title">
          <div className="caption">
            <i className="fa fa-download" />
            <span className="caption-subject bold uppercase">
              <FormattedMessage id="app.history.deposit.request.title" />
            </span>
          </div>
        </div>
        <div className="portlet-body history">
          {records.length > 0 ? (
            <DepositRequestTable data={records} />
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
  const history = (wallet && wallet.depositRequestHistory) || null;
  return {
    history,
  };
}
// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ getDepositRequestHistory }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(
  DepositRequestHistoryForm,
);
