import React from 'react';
import {
  Field,
  reduxForm,
  SubmissionError,
  formValueSelector,
} from 'redux-form';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import store from '../store';
import AuthHelper from '../Core/auth-helper';
import { LOGIN_SUCCESS } from '../Redux/constants';
import { bindActionCreators } from 'redux';
import { RenderSingleField, RenderSelect2Field } from './Renders';
import { isRequired } from './Validation';
import accounting from 'accounting';
import {
  bankDeposit,
  getBankList,
  cashDepositHistory,
} from '../Redux/actions/cash';
import { getWalletDetail } from '../Redux/actions/wallet';
import {
  FormattedMessage,
  FormattedHTMLMessage,
  injectIntl,
  intlShape,
} from 'react-intl';
import { formatNumber } from '../Helpers/utils';
import renderHTML from 'react-render-html';
import { GLOBAL_VARIABLES, CHECK_IS_MOBILE } from '../Helpers/constants/system';
class DepositCashForm extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      bankDeposit: PropTypes.func.isRequired,
    }).isRequired,
    handleSubmit: PropTypes.func.isRequired,
    error: PropTypes.any, // eslint-disable-line react/forbid-prop-types, react/require-default-props
    pristine: PropTypes.bool.isRequired,
    reset: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    submitSucceeded: PropTypes.bool.isRequired,
    change: PropTypes.func.isRequired,
    isAllowToChange: PropTypes.bool,
    intl: intlShape.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      isDepositSuccess: false,
      begin: true,
      isShowedAccountNameAndBankNumber: false,
    };
    this.onSubmit = this.onSubmit.bind(this);
  }

  async componentDidMount() {
    const { actions } = this.props;
    await actions.getBankList();
    await actions.getWalletDetail('VND', true, 'BUY');
  }

  componentDidUpdate() {
    AuthHelper.getProfile((data, err) => {
      if (!err && data) {
        store.dispatch({
          type: LOGIN_SUCCESS,
          data: data,
        });
      }
    });
  }

  onBankSelectChangeCallback = value => {
    const { userData } = this.props;
    const isVerifiedBank = !!(userData && userData.is_verify_bank);
    if (
      value &&
      GLOBAL_VARIABLES.BANK_REQUIRE_ACCOUNT_NAME_AND_NUMBER ===
        value.toLowerCase() &&
      !isVerifiedBank
    ) {
      this.setState({
        isShowedAccountNameAndBankNumber: true,
      });
    } else {
      this.setState({
        isShowedAccountNameAndBankNumber: false,
      });
    }
  };

  handleClick() {
    const { actions } = this.props;
    this.setState({
      begin: true,
      isShowedAccountNameAndBankNumber: false,
    });
    actions.cashDepositHistory(GLOBAL_VARIABLES.BASE_CURRENCY);
    this.props.reset();
  }
  async onSubmit(value) {
    const { actions, wallet, amount } = this.props;
    var params = { ...value };
    params.amount = amount;
    if (params.amount < wallet.deposit_minimum) {
      throw new SubmissionError({
        _error: (
          <FormattedMessage
            id="v2.wallet.popup.send.minvalue.error"
            values={{
              value: `${formatNumber(
                wallet.deposit_minimum,
              )} ${wallet.coin_code}`,
            }}
          />
        ),
      });
    }
    if (wallet && wallet.coin_address) {
      params.destination = wallet.coin_address;
    } else {
      throw new SubmissionError({
        _error: <FormattedMessage id="error.wallet.cash.withdraw" />,
      });
    }
    const err = await actions.bankDeposit(params);
    if (err) {
      throw new SubmissionError({
        _error: err,
      });
    } else {
      this.setState({
        isDepositSuccess: true,
        begin: false,
      });
    }
  }
  renderConfirmationInfo(data) {
    return (
      <div className="row cash-transfer-info">
        <div className="col-md-12">
          <h5 className="text-center title">
            <FormattedMessage id="v2.app.cash.confirm.title" />
          </h5>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <tbody>
                <tr>
                  <th>
                    <FormattedMessage id="app.history.deposit.cash.bankname" />
                  </th>
                  <td>{data.bank_name}</td>
                </tr>
                <tr>
                  <th>
                    <FormattedMessage id="v2.app.history.deposit.cash.banknumber" />
                  </th>
                  <td>{data.bank_account_id}</td>
                </tr>
                <tr>
                  <th>
                    <FormattedMessage id="v2.app.history.deposit.cash.bankaccountname" />
                  </th>
                  <td>{data.bank_account_name}</td>
                </tr>
                <tr>
                  <th>
                    <FormattedMessage id="user.withdraw.bankaccount.amount" />
                  </th>
                  <td> {formatNumber(data.amount)}</td>
                </tr>
                <tr>
                  <th>
                    <FormattedMessage id="v2.app.history.deposit.cash.description" />
                  </th>
                  <td>{data.memo}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="footer">
          <button
            type="button"
            className="md-btn btn"
            onClick={this.handleClick.bind(this)}
          >
            <span className="icon-settings" />&nbsp;<FormattedMessage id="app.global.button.continue" />
          </button>
        </div>
      </div>
    );
  }
  render() {
    const {
      handleSubmit,
      submitting,
      error,
      submitSucceeded,
      depositResponse,
      bankList,
      intl,
      isCreatingWallet,
      wallet,
    } = this.props;
    const {
      isDepositSuccess,
      begin,
      isShowedAccountNameAndBankNumber,
    } = this.state;
    const bankName = intl.formatMessage({
      id: 'user.withdraw.bankaccount.bankname',
    });
    const senderName = intl.formatMessage({
      id: 'user.withdraw.bankaccount.sender',
    });
    const accountNumber = intl.formatMessage({
      id: 'user.withdraw.bankaccount.accountnumber',
    });
    const amount = intl.formatMessage({
      id: 'user.withdraw.bankaccount.amount',
    });
    let options = [];
    if (bankList && bankList.length > 0) {
      options = bankList.filter(item => !!item.allow_deposit);
    }

    return (
      <div>
        {wallet &&
        wallet.deposit_description && (
          <div className="note note-info wallet-description">
            {CHECK_IS_MOBILE() ? (
              <div className="content-collapse">
                <button className="btn btn-primary" type="button" data-toggle="collapse" data-target="#collapseDeposit" aria-expanded="false" aria-controls="collapseDeposit">
                  <FormattedMessage id="app.wallet.note.deposit.text" />
                </button>
                <div className="collapse" id="collapseDeposit">
                  <div className="well">
                    {renderHTML(wallet.deposit_description)}
                  </div>
                </div>
              </div>
            ) : (<span> {renderHTML(wallet.deposit_description)}</span>)}
          </div>
        )}
        {!(isDepositSuccess && depositResponse && depositResponse.data) ||
        begin ? (
          <form onSubmit={handleSubmit(this.onSubmit)}>
            <div className="row">
              <div className="col-lg-12 col-md-12">
                <Field
                  name="bank"
                  type="text"
                  component={RenderSelect2Field}
                  id="bank"
                  label={bankName}
                  options={options}
                  onChangeCallback={this.onBankSelectChangeCallback}
                  validate={[isRequired]}
                />
              </div>

              {isShowedAccountNameAndBankNumber && (
                <div className="col-lg-12 col-md-12">
                  <Field
                    name="bank_account_name"
                    type="text"
                    component={RenderSingleField}
                    id="bank_account_name"
                    label={senderName}
                    validate={[isRequired]}
                    icon="fa-user"
                  />
                </div>
              )}

              {isShowedAccountNameAndBankNumber && (
                <div className="col-lg-12 col-md-12">
                  <Field
                    name="account"
                    type="text"
                    component={RenderSingleField}
                    id="account"
                    label={accountNumber}
                    validate={[isRequired]}
                    icon="fa-user"
                  />
                </div>
              )}

              <div className="col-lg-12 col-md-12">
                <Field
                  name="amount"
                  type="text"
                  component={RenderSingleField}
                  id="amount"
                  label={amount}
                  options={{
                    numeral: true,
                    numeralThousandsGroupStyle: 'thousand',
                    numeralDecimalScale: 0,
                    numeralPositiveOnly: true,
                  }}
                  validate={[isRequired]}
                  icon="fa-user"
                />
              </div>
            </div>
            <div className="clearfix" />
            <div
              className="row"
              style={{ marginTop: '30px', marginBottom: '10px' }}
            >
              <div className="col-lg-12 col-md-12">
                {submitSucceeded && (
                  <div className="alert alert-success">
                    <FormattedHTMLMessage id="v2.app.history.deposit.cash.success" />
                  </div>
                )}
                {error && (
                  <div className="alert alert-danger">
                    <strong>
                      <FormattedMessage id="app.global.button.warning" />
                    </strong>{' '}
                    {error}.
                  </div>
                )}
                <div className="footer">
                  <button
                    type="submit"
                    className="md-btn btn blue"
                    disabled={submitting || isCreatingWallet}
                  >
                    <span className="icon-settings" />&nbsp;<FormattedMessage id="app.global.button.continue" />
                  </button>
                </div>
              </div>
            </div>
            <div className="clearfix" />
          </form>
        ) : (
          this.renderConfirmationInfo(depositResponse.data)
        )}
      </div>
    );
  }
}

const selector = formValueSelector('DepositCashForm'); // <-- same as form name
DepositCashForm = connect(state => {
  // can select values individually
  const amount = selector(state, 'amount') || 0;
  return {
    amount: accounting.unformat(amount),
  };
})(DepositCashForm);

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ cash, wallet, user }) {
  const detail = (wallet && wallet.detail) || null;
  const firstWallet =
    detail && detail.result && detail.result[0] ? detail.result[0] : null;
  const depositResponse = (cash && cash.depositResponse) || null;
  const bankList = (cash && cash.list) || [];
  const userData = (user && user.profile) || null;
  return {
    depositResponse: depositResponse,
    bankList: bankList,
    wallet: firstWallet,
    userData,
  };
}

// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      { bankDeposit, getBankList, getWalletDetail, cashDepositHistory },
      dispatch,
    ),
  };
}

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    reduxForm({
      form: 'DepositCashForm',
    })(DepositCashForm),
  ),
);
