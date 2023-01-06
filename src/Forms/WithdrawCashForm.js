import React from 'react';
import {
  Field,
  reduxForm,
  SubmissionError,
  formValueSelector,
  change,
} from 'redux-form';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RenderSingleField, RenderSelect2Field } from './Renders';
import { isRequired } from './Validation';
import accounting from 'accounting';
import {
  bankWithdraw,
  getBankList,
  cashWithdrawHistory,
  getUserBankList,
  addUserBank,
  updateUserBank,
} from '../Redux/actions/cash';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { getWalletDetail } from '../Redux/actions/wallet';
import Link from '../Link';
import { formatNumber } from '../Helpers/utils';
import renderHTML from 'react-render-html';
import {
  GLOBAL_VARIABLES,
  WITHDRAW_CASH_FORM_ACCOUNT_TYPE,
  CHECK_IS_MOBILE
} from '../Helpers/constants/system';

class WithdrawCashForm extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      bankWithdraw: PropTypes.func.isRequired,
    }).isRequired,
    handleSubmit: PropTypes.func.isRequired,
    error: PropTypes.any, // eslint-disable-line react/forbid-prop-types, react/require-default-props
    pristine: PropTypes.bool.isRequired,
    reset: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    submitSucceeded: PropTypes.bool.isRequired,
    change: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      errMsg: '',
      bankAccount: null,
      isWithdrawSuccess: false,
      bankFee: 0,
      accountType: WITHDRAW_CASH_FORM_ACCOUNT_TYPE.NEW,
      savedBankId: null,
      isNeedToApprove: false,
      showOtherBank: false,
      otherBank: {
        name: '',
        branch: ''
      }
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.onConfirmation = this.onConfirmation.bind(this);
    this.getSelectedAccount = this.getSelectedAccount.bind(this);
    this.onSubmitSavedAccount = this.onSubmitSavedAccount.bind(this);
  }

  async componentDidMount() {
    const { actions } = this.props;
    await actions.getBankList();
    await actions.getUserBankList();
  }

  async onSubmitSavedAccount(value) {
    const data = {
      bank_code: value.saved_bank_code,
      user_account_name: value.saved_user_account_name,
      user_bank_account: value.user_bank_account,
      user_bank_id: null,
    };
    if (this.state.accountType === WITHDRAW_CASH_FORM_ACCOUNT_TYPE.SAVED) {
      data.user_bank_account = value.saved_user_bank_account;
      data.user_bank_id = this.state.savedBankId;
    }
    data.note = '';
    if (this.state.showOtherBank) {
      this.setState({
        otherBank: {
          name: value.name_bank,
          branch: value.branch_bank
        }
      });
      data.note = `${value.name_bank} - ${value.branch_bank}`;
    }

    this.onSubmit(data);
  }

  async onSubmit(value) {
    const { wallet, amount } = this.props;
    const { bankFee } = this.state;
    var params = { ...value };
    params.amount = amount;
    params.fee = bankFee;
    if (params.amount > wallet.available_to_use) {
      throw new SubmissionError({
        _error: (
          <FormattedMessage
            id="v2.wallet.popup.send.maxvalue.error"
            values={{
              value: `${formatNumber(
                (wallet.available_to_use || 0) * 1,
              )} ${wallet.coin_code}`,
            }}
          />
        ),
      });
    } else if (params.amount < wallet.withdraw_minimum) {
      throw new SubmissionError({
        _error: (
          <FormattedMessage
            id="v2.wallet.popup.send.minvalue.error"
            values={{
              value: `${formatNumber(
                (wallet.withdraw_minimum || 0) * 1,
              )} ${wallet.coin_code}`,
            }}
          />
        ),
      });
    }

    this.setState({
      step: 2,
      bankAccount: params,
      errMsg: '',
    });
  }
  handleClick() {
    const { actions } = this.props;
    this.setState({
      step: 1,
      errMsg: '',
      bankAccount: null,
      isWithdrawSuccess: false,
      accountType: WITHDRAW_CASH_FORM_ACCOUNT_TYPE.NEW,
      savedBankId: null,
    });
    actions.cashWithdrawHistory(GLOBAL_VARIABLES.BASE_CURRENCY);
    this.props.reset();
  }

  getSelectedObject = value => {
    const otherBank = 'OTHER_BANK';
    if (value.bank_code === otherBank) {
      this.setState({
        showOtherBank: true
      });
    } else {
      this.setState({
        showOtherBank: false
      });
    }

    if (value) {
      this.setState({
        bankFee: value.bank_fee || 10000,
      });
    }
    if (this.state.accountType === WITHDRAW_CASH_FORM_ACCOUNT_TYPE.SAVED) {
      this.props.change('saved_user_account_name', '');
    }
  };

  getSelectedAccount = value => {
    this.props.change('saved_user_account_name', value.bank_account_name);
    this.setState({
      savedBankId: value.id,
    });
  };

  async onConfirmation() {
    const { actions, wallet, isEnable2FA, userBankList } = this.props;
    const { bankAccount } = this.state;
    const value = bankAccount;
    if (isEnable2FA) {
      const google2FA = this.google2FA.value;
      if (!google2FA) {
        this.setState({
          step: 2,
          errMsg: 'Please input your google verification code',
        });
        return false;
      }
      value.google_2fa = google2FA;
    }
    // withdraw cash
    if (wallet && wallet.coin_address) {
      value.from_coin_address = wallet.coin_address;
    } else {
      this.setState({
        errMsg: <FormattedMessage id="error.wallet.cash.withdraw" />,
      });
    }
    let existAccount = userBankList.find(
      item => item.account === bankAccount.user_bank_account,
    );
    if (existAccount) {
      let data = {
        bank_code: bankAccount.bank_code,
        account: bankAccount.user_bank_account,
        bank_account_name: bankAccount.user_account_name,
        id: existAccount.id,
      };
      await actions.updateUserBank(data);
    } else {
      await actions.addUserBank(bankAccount);
    }
    const err = await actions.bankWithdraw(value);
    if (err) {
      if (err === 'RESERVE') {
        this.setState({
          step: 3,
          isNeedToApprove: true,
        });
      } else {
        this.setState({
          errMsg: err,
        });
      }
    } else {
      this.setState({
        step: 3,
      });
    }
  }

  renderConfirmationPage(bankAccount, isEnable2FA) {
    let remainingAmount = bankAccount.amount;
    if (bankAccount.fee > 0) {
      remainingAmount = bankAccount.amount - bankAccount.fee;
    }
    return (
      <div style={{ marginTop: '30px', marginBottom: '30px' }}>
        <h4 className="text-center">
          <FormattedMessage id="info.wallet.cash.confirmation" />
        </h4>
        <div className="summarize">
          <div className="row static-info">
            <div className="col-md-3 name text-left">
              <strong>
                <FormattedMessage id="user.withdraw.bankaccount.bankname" />
              </strong>
            </div>
            <div className="col-md-9 value text-right">
              {bankAccount.bank_code}
            </div>
          </div>
          {
            this.state.showOtherBank &&
            <React.Fragment>
              <div className="row static-info">
                <div className="col-md-3 name text-left">
                  <strong>
                    <FormattedMessage id="user.withdraw.bankaccount.banknameother" />
                  </strong>
                </div>
                <div className="col-md-9 value text-right">
                  {this.state.otherBank.name}
                </div>
              </div>
              <div className="row static-info">
                <div className="col-md-3 name text-left">
                  <strong>
                    <FormattedMessage id="user.withdraw.bankaccount.branchname" />
                  </strong>
                </div>
                <div className="col-md-9 value text-right">
                  {this.state.otherBank.branch}
                </div>
              </div>
            </React.Fragment>
          }
          <div className="row static-info">
            <div className="col-md-3 name text-left">
              <strong>
                <FormattedMessage id="user.withdraw.bankaccount.amountafterfee" />
              </strong>
            </div>
            <div className="col-md-9 value text-right">
              {formatNumber(remainingAmount * 1)}
            </div>
          </div>
          <div className="row static-info">
            <div className="col-md-3 name text-left">
              <strong>
                <FormattedMessage id="user.withdraw.bankaccount.fee" />
              </strong>
            </div>
            <div className="col-md-9 value text-right">
              {formatNumber(bankAccount.fee * 1)}
            </div>
          </div>
          <div className="row static-info">
            <div className="col-md-3 name text-left">
              <strong>
                {' '}
                <FormattedMessage id="user.withdraw.bankaccount.accountnumber" />
              </strong>
            </div>
            <div className="col-md-9 value text-right">
              {bankAccount.user_bank_account}
            </div>
          </div>
          <div className="row static-info">
            <div className="col-md-3 name text-left">
              <strong>
                {' '}
                <FormattedMessage id="user.withdraw.bankaccount.accountname" />
              </strong>
            </div>
            <div className="col-md-9 value text-right">
              <strong className="color-green">
                {' '}
                {bankAccount.user_account_name}
              </strong>
            </div>
          </div>
        </div>
        {isEnable2FA && (
          <div
            style={{ marginBottom: '30px' }}
            className="form-group form-md-line-input form-md-floating-label bitmoon-input"
          >
            <div className="input-group">
              <span className="input-group-addon">
                <i className="fa fa-unlock-alt" />
              </span>
              <input
                ref={c => {
                  this.google2FA = c;
                }}
                className="form-control"
                id="google_2fa"
                type="text"
                placeholder="Google verification code"
              />
              <div className="form-control-focus" />
            </div>
          </div>
        )}
        <div className="footer" style={{ marginTop: '30px' }}>
          <button
            onClick={() => this.setState({ step: 1 })}
            type="submit"
            className="btn pull-left"
          >
            <i className="fa fa-arrow-circle-left" />{' '}
            <FormattedMessage id="app.global.button.back" />
          </button>
          <button
            onClick={this.onConfirmation}
            type="submit"
            className="md-btn btn pull-right"
          >
            <i className="fa fa-thumbs-o-up" />{' '}
            <FormattedMessage id="app.global.button.confirm" />
          </button>
          <div className="clearfix" />
        </div>
      </div>
    );
  }
  render() {
    const {
      handleSubmit,
      submitting,
      error,
      bankList,
      isEnable2FA,
      intl,
      isCreatingWallet,
      wallet,
      userBankList,
      saved_bank_code,
    } = this.props;
    const { step, bankAccount, errMsg, bankFee, accountType } = this.state;
    const bankName = intl.formatMessage({
      id: 'user.withdraw.bankaccount.bankname',
    });
    const amount = intl.formatMessage({
      id: 'user.withdraw.bankaccount.amount',
    });
    const accountNumber = intl.formatMessage({
      id: 'user.withdraw.bankaccount.accountnumber',
    });
    const chooseAccountNumber = intl.formatMessage({
      id: 'user.withdraw.bankaccount.chooseaccountnumber',
    });
    const accountName = intl.formatMessage({
      id: 'user.withdraw.bankaccount.accountname',
    });
    const bankNameOther = intl.formatMessage({
      id: 'user.withdraw.bankaccount.banknameother',
    });
    const branchName = intl.formatMessage({
      id: 'user.withdraw.bankaccount.branchname',
    });
    let options = [],
      userBankListSelected = [];
    if (bankList && bankList.length > 0) {
      options = bankList.filter(item => !!item.allow_withdraw);
    }

    if (saved_bank_code) {
      userBankListSelected = userBankList.filter(
        item => item.bank_code === saved_bank_code,
      );
    }

    return (
      <div>
        {wallet &&
          wallet.withdraw_description && (
            <div className="note note-info wallet-description">
              {CHECK_IS_MOBILE() ? (
                <div className="content-collapse">
                  <button className="btn btn-primary" type="button" data-toggle="collapse" data-target="#collapseWithdraw" aria-expanded="false" aria-controls="collapseWithdraw">
                    <FormattedMessage id="app.wallet.note.withdraw.text" />
                  </button>
                  <div className="collapse" id="collapseWithdraw">
                    <div className="well">
                      {renderHTML(wallet.withdraw_description)}
                    </div>
                  </div>
                </div>
              ) : (<span> {renderHTML(wallet.withdraw_description)}</span>)}
            </div>
          )}
        {step === 1 ? (
          <form onSubmit={handleSubmit(this.onSubmitSavedAccount)}>
            <div className="row">
              <div className="col-lg-12 col-md-12">
                <Field
                  name="saved_bank_code"
                  type="text"
                  component={RenderSelect2Field}
                  id="saved_bank_code"
                  label={bankName}
                  options={options}
                  validate={[isRequired]}
                  getSelectedObject={this.getSelectedObject}
                />
              </div>

              {
                this.state.showOtherBank &&
                <div className="col-lg-12 col-md-12">
                  <Field
                    name="name_bank"
                    type="text"
                    component={RenderSingleField}
                    label={bankNameOther}
                    validate={[isRequired]}
                  />
                  <Field
                    name="branch_bank"
                    type="text"
                    component={RenderSingleField}
                    label={branchName}
                  />
                </div>
              }

              <div className="col-lg-12 col-md-12">
                <Field
                  name="amount"
                  type="text"
                  component={RenderSingleField}
                  id="amount"
                  options={{
                    numeral: true,
                    numeralThousandsGroupStyle: 'thousand',
                    numeralDecimalScale: 0,
                    numeralPositiveOnly: true,
                  }}
                  label={amount}
                  validate={[isRequired]}
                />
              </div>
              {bankFee > 0 && (
                <div className="col-lg-12 col-md-12">
                  <div
                    className="note note-info"
                    style={{ marginTop: '10px', marginBottom: '0' }}
                  >
                    <p>
                      <strong>
                        <FormattedMessage
                          id="user.withdraw.bankaccount.fee.description"
                          values={{
                            fee: formatNumber(bankFee),
                          }}
                        />
                      </strong>
                    </p>
                  </div>
                </div>
              )}
              <div className="col-lg-12 col-md-12">
                <div className="account-choosen">
                  <Field
                    onClick={() => {
                      this.setState({
                        accountType: WITHDRAW_CASH_FORM_ACCOUNT_TYPE.NEW,
                      });
                    }}
                    id="new_account"
                    name="new_account"
                    component="input"
                    type="radio"
                    checked={
                      accountType === WITHDRAW_CASH_FORM_ACCOUNT_TYPE.NEW
                    }
                    value="new_account"
                  />
                  <label htmlFor="new_account">
                    <FormattedMessage id="user.withdraw.bankaccount.button.inputaccount" />
                  </label>
                </div>
                <div className="account-choosen">
                  <Field
                    onClick={() => {
                      this.setState({
                        accountType: WITHDRAW_CASH_FORM_ACCOUNT_TYPE.SAVED,
                      });
                    }}
                    id="saved_account"
                    name="saved_account"
                    component="input"
                    type="radio"
                    checked={
                      accountType === WITHDRAW_CASH_FORM_ACCOUNT_TYPE.SAVED
                    }
                    value="saved_account"
                  />
                  <label htmlFor="saved_account">
                    <FormattedMessage id="user.withdraw.bankaccount.button.chooseaccount" />
                  </label>
                </div>
              </div>
              <div className="col-lg-12 col-md-12">
                {accountType === WITHDRAW_CASH_FORM_ACCOUNT_TYPE.SAVED && (
                  <Field
                    name="saved_user_bank_account"
                    type="text"
                    component={RenderSelect2Field}
                    id="saved_user_bank_account"
                    label={chooseAccountNumber}
                    options={userBankListSelected}
                    validate={[isRequired]}
                    getSelectedObject={this.getSelectedAccount}
                    valueKey="account"
                    labelKey="account"
                    placeholder={accountNumber}
                    readOnly={saved_bank_code === ''}
                  />
                )}
              </div>
              <div className="col-lg-12 col-md-12">
                {accountType === WITHDRAW_CASH_FORM_ACCOUNT_TYPE.NEW && (
                  <Field
                    name="user_bank_account"
                    type="text"
                    component={RenderSingleField}
                    id="user_bank_account"
                    label={accountNumber}
                    validate={[isRequired]}
                  />
                )}
              </div>
              <div className="col-lg-12 col-md-12">
                <Field
                  name="saved_user_account_name"
                  type="text"
                  component={RenderSingleField}
                  id="saved_user_account_name"
                  label={accountName}
                  validate={[isRequired]}
                />
              </div>
            </div>
            {!isEnable2FA ? (
              <div
                className="alert alert-warning"
                style={{ marginTop: '25px', marginBottom: '0px' }}
              >
                <FormattedMessage id="v2.wallet.popup.send.warning.gg2fa1" />

                <Link
                  style={{
                    color: '#c27d0e',
                    textDecoration: 'underline',
                  }}
                  href="/security/google_auth"
                >
                  <b>
                    <FormattedMessage id="v2.wallet.popup.send.warning.gg2fa2" />
                  </b>
                </Link>
              </div>
            ) : null}
            <div className="clearfix" />
            <div
              className="row"
              style={{ marginTop: '30px', marginBottom: '10px' }}
            >
              <div className="col-lg-12 col-md-12">
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
                    className="md-btn btn red"
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
            <div>
              {step === 3 ? (
                <div>
                  {this.state.isNeedToApprove ? (
                    <div className="row">
                      <div className="col-md-3 col-sm-3 col-centered image-cash">
                        <img
                          alt="Success notification"
                          src="/assets/global/img/bitmoon/success.svg"
                          className="img-responsive lazy"
                        />
                      </div>
                      <h4 className="col-md-12 col-centered text-center">
                        <FormattedMessage id="v2.cash.deposit.success" />
                      </h4>
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
                  ) : (
                      <div className="row">
                        <div className="col-md-3 col-sm-3 col-centered image-cash">
                          <img
                            alt="Success notification"
                            src="/assets/global/img/bitmoon/email.svg"
                            className="img-responsive lazy"
                          />
                        </div>
                        <h4 className="col-md-12 col-centered text-center">
                          <FormattedMessage id="v2.wallet.popup.send.create.withdraw.request.confirm-email" />
                        </h4>
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
                    )}
                </div>
              ) : null}
            </div>
          )}
        {step === 2 ? (
          this. renderConfirmationPage(bankAccount, isEnable2FA)
        ) : null}
        {errMsg &&
          step === 2 && (
            <div className="alert alert-danger" style={{ marginTop: '20px' }}>
              <strong>
                <FormattedMessage id="app.global.button.warning" />
              </strong>{' '}
              {errMsg}.
          </div>
          )}
      </div>
    );
  }
}

const selector = formValueSelector('WithdrawCashForm'); // <-- same as form name
WithdrawCashForm = connect(state => {
  // can select values individually
  const amount = selector(state, 'amount') || 0;
  const saved_bank_code = selector(state, 'saved_bank_code') || '';
  return {
    amount: accounting.unformat(amount),
    saved_bank_code: saved_bank_code,
  };
})(WithdrawCashForm);

// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        bankWithdraw,
        getBankList,
        getWalletDetail,
        cashWithdrawHistory,
        getUserBankList,
        change,
        addUserBank,
        updateUserBank,
      },
      dispatch,
    ),
  };
}

function mapStateToProps({ cash, wallet }) {
  const bankList = (cash && cash.list) || [];
  const userBankList = (cash && cash.userBankList) || [];
  const error = (cash && cash.error) || {};
  const detail = (wallet && wallet.detail) || null;
  const firstWallet =
    detail && detail.result && detail.result[0] ? detail.result[0] : null;
  return {
    bankList: bankList,
    wallet: firstWallet,
    userBankList: userBankList,
    userBankError: error,
  };
}
export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    reduxForm({
      form: 'WithdrawCashForm',
    })(WithdrawCashForm),
  ),
);
