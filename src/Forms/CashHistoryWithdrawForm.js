import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { cashWithdrawHistory } from '../Redux/actions/cash';
import TransactionTable from './TransactionTable';
import { FormattedMessage } from 'react-intl';

class CashHistoryDepositForm extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      cashWithdrawHistory: PropTypes.func.isRequired,
    }).isRequired,
    history: PropTypes.array,
  };

  static defaultProps = {
    history: [],
  };

  async componentDidMount() {
    // send create coin request if it's the first time user open the coin
    const { actions } = this.props;
    await actions.cashWithdrawHistory('VND');
  }

  render() {
    const { history } = this.props;
    const deposit = history || [];
    const records = deposit.length > 0 ? deposit : [];
    return (
      <div className="portlet light bordered paper-3">
        <div className="portlet-title">
          <div className="caption">
            <i className="fa fa-download" />
            <span className="caption-subject bold uppercase">
              <FormattedMessage id="app.history.withdraw.title" />
            </span>
          </div>
        </div>
        <div className="portlet-body history">
          {history !== null ? (
            <TransactionTable data={records} />
          ) : (
            <p className="spin-loading">Loading...</p>
          )}
        </div>
      </div>
    );
  }
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ cash }) {
  const history = (cash && cash.withdrawHistory) || null;
  return {
    history,
  };
}
// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ cashWithdrawHistory }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(
  CashHistoryDepositForm,
);
