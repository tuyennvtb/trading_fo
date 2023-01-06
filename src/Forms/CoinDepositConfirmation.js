import React from 'react';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { userDepositRequest } from '../Redux/actions/wallet';
import { FormattedMessage } from 'react-intl';
class CoinDepositConfirmation extends React.Component {
  onClickHandler = () => {
    const { setStep } = this.props;
    setStep(1);
  };
  render() {
    return (
      <div className="panel panel-warning">
        <div className="note note-info">
          <FormattedMessage
            id="v2.wallet.popup.confirmation"
            values={{
              link: (
                <a href="/transactions" target="_blank">
                  <FormattedMessage id="v2.wallet.transactions.suggest" />
                </a>
              ),
            }}
          />
        </div>
        <button
          style={{ marginTop: '10px' }}
          type="button"
          className="btn md-btn pull-right blue"
          onClick={this.onClickHandler}
        >
          <i className="fa fa-upload" />&nbsp;<FormattedMessage id="v2.wallet.confirmation.button" />
        </button>
      </div>
    );
  }
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ user: { profile } }) {
  return {
    user: profile,
  };
}
// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ userDepositRequest }, dispatch),
  };
}

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(CoinDepositConfirmation),
);
