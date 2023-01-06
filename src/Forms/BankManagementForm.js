import React from 'react';
import { Field, reduxForm, formValueSelector, change, reset } from 'redux-form';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RenderSingleField, RenderSelect2Field } from './Renders';
import { isRequired } from './Validation';
import {
  getBankList,
  getUserBankList,
  addUserBank,
  updateUserBank,
  deleteUserBank,
} from '../Redux/actions/cash';
import ModalDialog from '../Processing/ModalDialog';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { BANK_MANAGEMENT_TYPE } from '../Helpers/constants/system';

class BankManagementForm extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      getBankList: PropTypes.func.isRequired,
      getUserBankList: PropTypes.func.isRequired,
      addUserBank: PropTypes.func.isRequired,
      updateUserBank: PropTypes.func.isRequired,
      deleteUserBank: PropTypes.func.isRequired,
    }).isRequired,
    handleSubmit: PropTypes.func.isRequired,
    error: PropTypes.any, // eslint-disable-line react/forbid-prop-types, react/require-default-props
    pristine: PropTypes.bool.isRequired,
    reset: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    submitSucceeded: PropTypes.bool.isRequired,
    change: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    userBankError: PropTypes.shape({
      any: PropTypes.any,
    }),
  };

  constructor(props) {
    super(props);
    this.state = {
      errMsg: '',
      type: BANK_MANAGEMENT_TYPE.NEW,
      bankAccount: null,
      showModal: false,
    };
    this.onAddUserBank = this.onAddUserBank.bind(this);
    this.onUpdateUserBank = this.onUpdateUserBank.bind(this);
    this.handleDeleteBankAccount = this.handleDeleteBankAccount.bind(this);
    this.renderTableButton = this.renderTableButton.bind(this);
    this.handleAddButton = this.handleAddButton.bind(this);
    this.handleCancelDialog = this.handleCancelDialog.bind(this);
    this.getError = this.getError.bind(this);
  }

  async componentDidMount() {
    const { actions } = this.props;
    await actions.getBankList();
    await actions.getUserBankList();
  }

  async onAddUserBank(value) {
    const data = {
      user_bank_account: value.account,
      user_account_name: value.bank_account_name,
      bank_code: value.bank_code,
    };
    const { actions, dispatch } = this.props;
    await actions.addUserBank(data);
    dispatch(reset('BankManagementForm'));
    this.setState({
      bankAccount: null,
      showModal: false,
    });
  }

  async onUpdateUserBank(value) {
    if (!this.state.bankAccount || !this.state.bankAccount.id) {
      this.setState({
        errMsg: 'Có lỗi xảy ra, vui lòng thử lại',
      });
      return;
    }
    const data = {
      account: value.saved_account,
      bank_account_name: value.saved_bank_account_name,
      bank_code: value.saved_bank_code,
      id: this.state.bankAccount.id,
    };
    const { actions, dispatch } = this.props;
    await actions.updateUserBank(data);
    dispatch(reset('BankManagementForm'));
    this.setState({
      bankAccount: null,
      showModal: false,
    });
  }

  async handleDeleteBankAccount(id) {
    if (!id) {
      this.setState({
        errMsg: 'Có lỗi xảy ra, vui lòng thử lại',
      });
      return;
    }
    const { actions, dispatch } = this.props;
    await actions.deleteUserBank(id);
    dispatch(reset('BankManagementForm'));
    this.setState({
      bankAccount: null,
    });
  }

  renderTableButton = id => {
    return (
      <span>
        <button
          className="update-account-button"
          onClick={() => {
            this.handleEditButton(id);
          }}
        >
          <FormattedMessage id="app.global.button.update" />
        </button>
        <button
          className="delete-account-button"
          onClick={() => {
            this.handleDeleteBankAccount(id);
          }}
        >
          <FormattedMessage id="app.global.button.delete" />
        </button>
      </span>
    );
  };

  handleAddButton = () => {
    this.setState({
      type: BANK_MANAGEMENT_TYPE.NEW,
      showModal: true,
    });
  };

  handleEditButton = id => {
    let account = this.props.userBankList.find(item => item.id === id);
    if (!account) {
      this.setState({
        errMsg: 'Có lỗi xảy ra, vui lòng thử lại',
      });
      return;
    }
    this.setState({
      type: BANK_MANAGEMENT_TYPE.EDIT,
      showModal: true,
      bankAccount: account,
    });
    this.props.change('saved_bank_account_name', account.bank_account_name);
    this.props.change('saved_account', account.account);
    this.props.change('saved_bank_code', account.bank_code);
    this.props.change('bank_code', account.bank_code);
  };

  handleCancelDialog = () => {
    this.setState({
      showModal: false,
      bankAccount: null,
    });
  };

  getError = error => {
    if (!error) return '';
    let errorStr = '';
    for (let key in error) {
      if (error.hasOwnProperty(key) && error[key]) {
        errorStr += `${error[key]}. `;
      }
    }
    return errorStr;
  };

  mobileFormatter = (cel, row) => {
    return (
      <div>
        <div className="col-xs-12">
          <p><b><FormattedMessage id="user.withdraw.bankaccount.accountnumber" /></b>: {row.account}</p>
          <p><b><FormattedMessage id="user.withdraw.bankaccount.bankname" /></b>: {row.bank_code}</p>
          <p><b><FormattedMessage id="user.withdraw.bankaccount.accountname" /></b>: {row.bank_account_name}</p>
        </div>
        <div className="col-xs-12">
          {this.renderTableButton(row.id)}
        </div>
      </div>
    );
  }

  renderUserBanksTable(userBankList) {
    return (
      <BootstrapTable
        data={userBankList}
        className="user-bank-table table-striped table-advance"
        hover
        pagination
        condensed
        multiColumnSort={3}
      >
        <TableHeaderColumn
          dataField="id"
          isKey
          dataFormat={this.mobileFormatter}
          columnClassName="visible-xs visible-sm mobile-col"
          className="visible-xs visible-sm mobile-col"
          dataAlign="center"
        >
        </TableHeaderColumn>

        <TableHeaderColumn
          dataFormat={(cell, row) => <div>{cell}</div>}
          dataField="account"
          className="account-col-header hidden-xs hidden-sm"
          columnClassName="account-col hidden-xs hidden-sm"
          dataAlign="left"
          dataSort
        >
          <FormattedMessage id="user.withdraw.bankaccount.accountnumber" />
        </TableHeaderColumn>
        <TableHeaderColumn
          dataFormat={(cell, row) => <div>{cell}</div>}
          dataAlign="center"
          dataField="bank_code"
          className="bank-code-col-header hidden-xs hidden-sm"
          columnClassName="bank-code-col hidden-xs hidden-sm"
          dataSort
        >
          <FormattedMessage id="user.withdraw.bankaccount.bankname" />
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="bank_account_name"
          dataFormat={(cell, row) => <div>{cell}</div>}
          dataSort
          dataAlign="left"
          className="bank-account-name-col-header hidden-xs hidden-sm"
          columnClassName="bank-account-name-col hidden-xs hidden-sm"
        >
          <FormattedMessage id="user.withdraw.bankaccount.accountname" />
        </TableHeaderColumn>
        <TableHeaderColumn
          dataField="id"
          dataFormat={this.renderTableButton}
          dataAlign="center"
          className="bank-account-action-col-header hidden-xs hidden-sm"
          columnClassName="bank-account-action-col hidden-xs hidden-sm"
        >
        </TableHeaderColumn>
      </BootstrapTable>
    );
  }

  render() {
    const {
      handleSubmit,
      submitting,
      intl,
      bankList,
      userBankList,
      userBankError,
      bank_code,
    } = this.props;
    const { type, showModal, errMsg } = this.state;
    const bankName = intl.formatMessage({
      id: 'user.withdraw.bankaccount.bankname',
    });
    const accountNumber = intl.formatMessage({
      id: 'user.withdraw.bankaccount.accountnumber',
    });
    const accountName = intl.formatMessage({
      id: 'user.withdraw.bankaccount.accountname',
    });
    let options = [],
      availableUserBankList = [];

    if (bankList && bankList.length > 0) {
      options = bankList.filter(item => !!item.allow_withdraw);
      if (userBankList && userBankList.length > 0) {
        availableUserBankList = userBankList.filter(
          account =>
            bankList.findIndex(item => account.bank_code === item.bank_code) >=
            0 && account,
        );
      }
    }
    return (
      <div className="user-bank-management">
        <button
          type="button"
          className="add-account-button md-btn btn blue"
          disabled={submitting}
          onClick={this.handleAddButton}
        >
          <i className="fa fa-plus" />{' '}
          <FormattedMessage id="app.global.button.addBankAccount" />
        </button>
        <div className="title">
          <FormattedMessage id="user.withdraw.bankaccount.accountlist" />
        </div>
        <div className="clearfix" />
        <div>{this.renderUserBanksTable(availableUserBankList)}</div>
        {errMsg && (
          <div className="alert alert-danger" style={{ marginTop: '20px' }}>
            <strong>
              <FormattedMessage id="app.global.button.warning" />
            </strong>{' '}
            {errMsg}.
          </div>
        )}
        {this.getError(userBankError) && (
          <div className="alert alert-danger" style={{ marginTop: '20px' }}>
            <strong>
              <FormattedMessage id="app.global.button.warning" />
            </strong>{' '}
            {this.getError(userBankError)}
          </div>
        )}
        <ModalDialog isOpen={showModal}>
          <div className="portlet light bordered modal-dialog-content bank-account-dialog clearfix">
            <div className="portlet-title">
              <div className="caption">
                <span className="caption-subject font-blue bold uppercase">
                  {type === BANK_MANAGEMENT_TYPE.NEW ? (
                    <FormattedMessage id="app.global.button.add" />
                  ) : (
                      <FormattedMessage id="app.global.button.edit" />
                    )}
                </span>
              </div>
            </div>
            <div className="portlet-body">
              {type === BANK_MANAGEMENT_TYPE.NEW ? (
                <form onSubmit={handleSubmit(this.onAddUserBank)}>
                  <div className="row">
                    <div className="col-lg-12 col-md-12">
                      <Field
                        name="bank_code"
                        type="text"
                        component={RenderSelect2Field}
                        id="bank_code"
                        label={bankName}
                        options={options}
                        validate={[isRequired]}
                        value={bank_code}
                      />
                    </div>
                    <div className="col-lg-12 col-md-12">
                      <Field
                        name="account"
                        type="text"
                        component={RenderSingleField}
                        id="account"
                        label={accountNumber}
                        validate={[isRequired]}
                      />
                    </div>
                    <div className="col-lg-12 col-md-12">
                      <Field
                        name="bank_account_name"
                        type="text"
                        component={RenderSingleField}
                        id="bank_account_name"
                        label={accountName}
                        validate={[isRequired]}
                      />
                    </div>
                  </div>
                  <div className="clearfix" />
                  <div
                    className="row"
                    style={{ marginTop: '30px', marginBottom: '10px' }}
                  >
                    <div className="col-lg-12 col-md-12">
                      <div className="footer" style={{ textAlign: 'center' }}>
                        <button
                          type="submit"
                          className="btn md-btn btn blue"
                          disabled={submitting}
                        >
                          <i className="fa fa-thumbs-o-up" />{' '}
                          <FormattedMessage id="app.global.button.add" />
                        </button>
                        <button
                          className="btn md-btn red-mint"
                          onClick={this.handleCancelDialog}
                        >
                          <i className="fa fa-times" />{' '}
                          <FormattedMessage id="app.global.button.cancel" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="clearfix" />
                </form>
              ) : (
                  <form onSubmit={handleSubmit(this.onUpdateUserBank)}>
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
                          custom={{
                            shouldReset: this.props.saved_bank_code === '',
                          }}
                        />
                      </div>
                      <div className="col-lg-12 col-md-12">
                        <Field
                          name="saved_account"
                          type="text"
                          component={RenderSingleField}
                          id="saved_account"
                          label={accountNumber}
                          validate={[isRequired]}
                        />
                      </div>
                      <div className="col-lg-12 col-md-12">
                        <Field
                          name="saved_bank_account_name"
                          type="text"
                          component={RenderSingleField}
                          id="saved_bank_account_name"
                          label={accountName}
                          validate={[isRequired]}
                        />
                      </div>
                    </div>
                    <div className="clearfix" />
                    <div
                      className="row"
                      style={{ marginTop: '30px', marginBottom: '10px' }}
                    >
                      <div className="col-lg-12 col-md-12">
                        <div className="footer" style={{ textAlign: 'center' }}>
                          <button
                            type="submit"
                            className="md-btn btn blue"
                            disabled={submitting}
                            style={{
                              display: 'inline-block',
                              margin: '0px 10px',
                            }}
                          >
                            <i className="fa fa-thumbs-o-up" />{' '}
                            <FormattedMessage id="app.global.button.update" />
                          </button>
                          <button
                            className="btn md-btn red-mint"
                            onClick={this.handleCancelDialog}
                          >
                            <i className="fa fa-times" />{' '}
                            <FormattedMessage id="app.global.button.cancel" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="clearfix" />
                  </form>
                )}
            </div>
          </div>
        </ModalDialog>
      </div>
    );
  }
}

const selector = formValueSelector('BankManagementForm'); // <-- same as form name
BankManagementForm = connect(state => {
  const saved_bank_code = selector(state, 'saved_bank_code') || '';
  const bank_code = selector(state, 'bank_code') || '';
  return {
    saved_bank_code: saved_bank_code,
    bank_code: bank_code,
  };
})(BankManagementForm);

// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        getBankList,
        getUserBankList,
        change,
        addUserBank,
        updateUserBank,
        deleteUserBank,
        reset,
      },
      dispatch,
    ),
  };
}

function mapStateToProps({ cash }) {
  const bankList = (cash && cash.list) || [];
  const userBankList = (cash && cash.userBankList) || [];
  const error = (cash && cash.error) || {};

  return {
    bankList: bankList,
    userBankList: userBankList,
    userBankError: error,
  };
}
export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    reduxForm({
      form: 'BankManagementForm',
    })(BankManagementForm),
  ),
);
