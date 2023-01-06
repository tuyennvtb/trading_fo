import React from 'react';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RenderSingleField } from './Renders';
import { isRequired } from './Validation';
import accounting from 'accounting';
import Link from '../Link';
import {
  getWalletDetail,
  createWallet,
  userDepositRequest,
} from '../Redux/actions/wallet';
import CoinDepositTransferForm from '../Forms/CoinDepositTransferForm';
import CoinDepositConfirmation from '../Forms/CoinDepositConfirmation';
import SystemWalletHOC from '../Processing/SystemWalletHOC';
import { ERRORS } from '../Helpers/constants/system';
import _ from 'lodash';
class CoinDepositForm extends React.Component {
  static propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    error: PropTypes.any, // eslint-disable-line react/forbid-prop-types, react/require-default-props
    pristine: PropTypes.bool.isRequired,
    reset: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    submitSucceeded: PropTypes.bool.isRequired,
    coinID: PropTypes.string.isRequired,
    wallet: PropTypes.object,
    intl: intlShape.isRequired,
  };

  static defaultProps = {
    wallet: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      sendTo: null,
      errMsg: '',
    };
    this.handleMaxAmount = this.handleMaxAmount.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onConfirmation = this.onConfirmation.bind(this);
  }

  handleMaxAmount() {
    const { wallet } = this.props;
    this.props.change('amount_to_send', (wallet.available_to_use || 0) * 1);
  }

  async componentDidMount() {
    const { actions, coinID } = this.props;
    const err1 = await actions.getWalletDetail(coinID, false, 'BUY');
    if (err1 === ERRORS.NO_WALLET) {
      actions.createWallet(coinID);
    }

    let myHandler = setInterval(async () => {
      const err = await actions.getWalletDetail(coinID, false, 'BUY');
      if (!err) {
        clearInterval(myHandler);
      }
    }, 3000);
  }

  async componentDidUpdate(prevProps) {
    const { wallet, calculateBalance } = this.props;
    if (prevProps.wallet !== wallet && wallet) {
      calculateBalance(wallet.available_to_use, wallet.coin_code);
    }
  }
  async onSubmit(value) {
    const { actions, coinID, amount } = this.props;
    value.coin_id = coinID;
    var params = { ...value };
    params.amount = amount;
    let err = await actions.userDepositRequest(params);
    if (!err) {
      this.setState({
        step: 2,
      });
    } else {
      this.setState({
        errMsg: err,
      });
    }
  }
  stepHandler(step) {
    this.setState({
      step: step,
    });
  }
  async onConfirmation() {}
  render() {
    const {
      handleSubmit,
      submitting,
      intl,
      coinID,
      user,
      userDepositData,
    } = this.props;
    const { step, errMsg } = this.state;

    const coinAmount = intl.formatMessage(
      {
        id: 'v2.wallet.popup.send.coinamount',
      },
      {
        coinCode: coinID,
      },
    );

    return (
      <div className="panel panel-warning">
        <div className="panel-heading coin-deposit-header">
          <h3 className="panel-title">
            {!_.isEmpty(user) ? (
              <FormattedMessage
                id="v2.wallet.popup.send.bittrex.coin"
                values={{
                  coinID: coinID,
                  userID: user.id,
                  userEmail: user.email,
                }}
              />
            ) : null}
          </h3>
        </div>
        <div>
          {step === 1 && (
            <div>
              <form onSubmit={handleSubmit(this.onSubmit)} className="clearfix">
                <Field
                  name="amount"
                  label={coinAmount}
                  type="text"
                  options={{
                    numeral: true,
                    numeralThousandsGroupStyle: 'thousand',
                    numeralDecimalScale: 4,
                    numeralPositiveOnly: true,
                  }}
                  component={RenderSingleField}
                  id="amount"
                  validate={[isRequired]}
                  icon="fa-balance-scale"
                />
                <Link
                  style={{ marginTop: '10px' }}
                  type="button"
                  className="btn md-btn pull-right red"
                  href="/wallet"
                >
                  <i className="fa fa-times" />&nbsp;<FormattedMessage id="app.global.button.cancel" />
                </Link>
                <button
                  style={{ marginTop: '10px', marginRight: '10px' }}
                  type="submit"
                  className="btn md-btn pull-right blue"
                  disabled={submitting}
                >
                  <i className="fa fa-upload" />&nbsp;<FormattedMessage id="app.global.button.continue" />
                </button>
              </form>
              {errMsg && (
                <div
                  className="alert alert-danger"
                  style={{ marginTop: '20px' }}
                >
                  <strong>
                    <FormattedMessage id="app.global.button.warning" />
                  </strong>{' '}
                  {errMsg}.
                </div>
              )}
            </div>
          )}
          {step === 2 && (
            <CoinDepositTransferForm
              coinID={coinID}
              id={userDepositData && userDepositData.id}
              setStep={this.stepHandler.bind(this)}
            />
          )}
          {step === 3 && (
            <CoinDepositConfirmation
              coinID={coinID}
              setStep={this.stepHandler.bind(this)}
            />
          )}
        </div>
      </div>
    );
  }
}

const selector = formValueSelector('CoinDepositForm'); // <-- same as form name
CoinDepositForm = connect(state => {
  // can select values individually
  const amount = selector(state, 'amount') || 0;
  return {
    amount: accounting.unformat(amount),
  };
})(CoinDepositForm);

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ wallet, user: { profile } }) {
  let userDepositRequest =
    wallet && wallet.userDepositRequest ? wallet.userDepositRequest : null;
  const detail = (wallet && wallet.detail) || null;
  const firstWallet =
    detail && detail.result && detail.result[0] ? detail.result[0] : null;
  return {
    user: profile,
    userDepositData: userDepositRequest,
    wallet: firstWallet,
  };
}
// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      { getWalletDetail, createWallet, userDepositRequest },
      dispatch,
    ),
  };
}

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    reduxForm({
      form: 'CoinDepositForm',
    })(SystemWalletHOC(CoinDepositForm)),
  ),
);
