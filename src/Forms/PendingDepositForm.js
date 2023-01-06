import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TransactionTable from './TransactionTable';

class PendingDepositForm extends React.Component {
  static propTypes = {
    history: PropTypes.object,
  };

  static defaultProps = {
    history: null,
  };

  render() {
    const { history } = this.props;
    const deposit = (history && history.status === true && history.data) || [];
    const records =
      deposit.length > 0 ? deposit.filter(trans => trans.status === 0) : [];
    return (
      <div className="portlet light bordered paper-3">
        <div className="portlet-title">
          <div className="caption">
            <i className="icon-reload" />
            <span className="caption-subject bold uppercase">
              Pending Deposits
            </span>
          </div>
        </div>
        <div className="portlet-body">
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
function mapStateToProps({ wallet }) {
  const history = (wallet && wallet.deposit) || null;
  return {
    history,
  };
}

export default connect(mapStateToProps, null)(PendingDepositForm);
