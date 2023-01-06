import React from 'react';
import { Field, reduxForm, formValueSelector } from 'redux-form';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
  FormattedHTMLMessage,
} from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { updateDepositRequest } from '../Redux/actions/wallet';
import accounting from 'accounting';
import renderHTML from 'react-render-html';
import ModalDialog from '../Processing/ModalDialog';
import { setRuntimeVariable } from '../Redux/actions/runtime';
import ToastNotification from '../Processing/ToastNotification.js';
import '../assets/css/pages/coin_deposit.css';

const SingleInputComponent = (props) => {
  let err = '';
  if (props.meta.touched) {
    err = props.meta.error;
  }
  props.setError(err);
  return (
    <React.Fragment>
      <input
        {...props.input}
        id={props.id}
      />
    </React.Fragment>
  );
}
class CoinDepositTransferForm extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      updateDepositRequest: PropTypes.func.isRequired,
    }).isRequired,
    handleSubmit: PropTypes.func.isRequired,
    error: PropTypes.any, // eslint-disable-line react/forbid-prop-types, react/require-default-props
    pristine: PropTypes.bool.isRequired,
    reset: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    submitSucceeded: PropTypes.bool.isRequired,
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
      isConfirmationPopup: false,
      temporaryData: {},
      errTXID: '',
      showAddress: false
    };
    this.onSubmit = this.onSubmit.bind(this);
    this.onConfirmation = this.onConfirmation.bind(this);
  }

  async componentDidMount() {
    const { userDepositData } = this.props;
    if (userDepositData.tag) {
      this.setState({
        isConfirmationPopup: true,
      });
    }
  }

  setError = (error) => {
    this.setState({ errTXID: error });
  }

  collapseAddress = () => {
    this.setState(prevState => {
      prevState.showAddress = !prevState.showAddress;
      return prevState;
    })
  }

  onCloseHandler() {
    this.setState({
      isConfirmationPopup: false,
    });
  }
  async onSubmit(value) {
    const { actions, setStep, coinID, user, requested_amount } = this.props;
    value.user_id = user.id;
    value.coin_id = coinID;
    var params = { ...value };
    params.requested_amount = requested_amount;
    let err = await actions.updateDepositRequest(params);
    if (!err) {
      setStep(3);
    } else {
      this.setState({
        errMsg: err,
      });
    }
  }
  async onConfirmBuyCoinTransaction(param) {
    const { actions, setStep } = this.props;
    this.setState({
      isConfirmationPopup: false,
    });
    let err = await actions.updateDepositRequest(this.state.temporaryData);
    if (!err) {
      setStep(3);
    } else {
      this.setState({
        errMsg: err,
      });
    }
  }

  onClickHandler = () => {
    const { setStep } = this.props;
    setStep(1);
  };

  async onConfirmation() { }
  render() {
    const {
      handleSubmit,
      submitting,
      intl,
      coinID,
      wallet,
      to_address,
      tag,
      requested_amount,
      userDepositData,
    } = this.props;
    const { errMsg, isConfirmationPopup } = this.state;
    const tagNameWarning = intl.formatHTMLMessage(
      {
        id: 'app.deposit.request.3rdcolumn_name',
      },
      {
        column: wallet.additional_column_name,
      },
    );
    return (
      <div>
        <form
          onSubmit={handleSubmit(this.onSubmit)}
          className="clearfix coin-deposit"
        >
          <div className="col-xs-12 p-10">
            <div className="row static-info">
              <div className="col-md-3 name text-left">
                <strong>
                  <FormattedMessage id="app.leftnavigation.profile.wallet" />
                </strong>
              </div>
              <div className="col-md-9 value value--address input-copy">
                <input
                  id="to_address"
                  type="text"
                  value={to_address}
                  readOnly
                />
                <span className="tooltip-content">
                  <a className="btn btn-info has-tooltip" data-clipboard-text={to_address}>
                    <FormattedMessage id="app.global.copy" />
                  </a>
                  <div
                    className="tooltip fade bottom"
                    role="tooltip"
                  >
                    <div className="tooltip-arrow" />
                    <div className="tooltip-inner">
                      <FormattedMessage id="app.global.copied" />
                    </div>
                  </div>
                </span>
              </div>
            </div>

            {userDepositData &&
              !!userDepositData.tag && (
                <div className="row static-info">
                  <div className="col-md-3 name text-left">
                    <strong>
                      {tagNameWarning}
                    </strong>
                  </div>
                  <div className="col-md-9 value text-left">
                    {tag}
                  </div>
                </div>
              )}

            <div className="row static-info visible-xs visible-sm">
              <div className="col-md-3 name">
              </div>
              <div className="col-md-9 value">
                <a onClick={this.collapseAddress}>
                  {this.state.showAddress
                    ?
                    <FormattedMessage id="app.global.hide" />
                    :
                    <FormattedMessage id="app.global.show" />
                  }
                </a>
                <div className="address-coin">
                  {this.state.showAddress &&
                    to_address
                  }
                </div>
              </div>
            </div>

            <div className="row static-info">
              <div className="col-md-3 name text-left">
                <strong>
                  <FormattedMessage id="app.order.quantity" />
                </strong>
              </div>
              <div className="col-md-9 value">
                {requested_amount}
              </div>
            </div>

            <div className="row static-info">
              <div className="col-md-12">
                {wallet &&
                  wallet.deposit_description && (
                    <p>{renderHTML(wallet.deposit_description)}</p>
                  )}
              </div>
            </div>

            <div className="row static-info">
              <div className="col-md-3 name text-left">
                <strong>
                  <FormattedMessage id="v2.wallet.popup.send.txid" />
                </strong>
              </div>
              <div className="col-md-9 value value--address input-copy">
                <Field
                  component={SingleInputComponent}
                  name="txid"
                  id="txid"
                  readOnly
                  type="text"
                  setError={this.setError}
                />
              </div>
            </div>

            <div className="row static-info">
              <div className="col-md-12 has-error">
                <span className="help-block">
                  {this.state.errTXID}
                </span>
              </div>
            </div>

            <div className="row info-note p-10">
              <div className="alert alert-warning text-danger">
                <FormattedHTMLMessage id="v2.deposit.request.txid.warn" />
              </div>
              <button
                style={{ marginTop: '10px' }}
                type="button"
                className="btn md-btn pull-right red"
                onClick={this.onClickHandler}
              >
                <i className="fa fa-times" />&nbsp;<FormattedMessage id="app.global.button.cancel" />
              </button>
              <button
                style={{ marginTop: '10px', marginRight: '10px' }}
                type="submit"
                className="btn md-btn pull-right blue copy"
                disabled={submitting}
              >
                <i className="fa fa-upload" />&nbsp;<FormattedMessage id="app.global.button.continue" />
              </button>
            </div>
          </div>
        </form>
        {
          errMsg && (
            <div className="alert alert-danger" style={{ marginTop: '20px' }}>
              <strong>
                <FormattedMessage id="app.global.button.warning" />
              </strong>{' '}
              {errMsg}.
          </div>
          )
        }

        <ModalDialog isOpen={isConfirmationPopup}>
          <div className="modal-dialog order-confirmation-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-hidden="true"
                  onClick={this.onCloseHandler.bind(this)}
                />
                <h4 className="modal-title">
                  <i className="fa fa-upload" />&nbsp; Xác nhận giao dịch
                </h4>
              </div>
              <div className="modal-body">
                <div className="panel panel-warning">
                  <div className="panel-body">
                    <div>
                      <p className="order-info-detail">
                        <FormattedHTMLMessage
                          id="app.exchange.bittrext.tag.warning"
                          values={{
                            coin_id: coinID && coinID.toUpperCase(),
                            column: wallet.additional_column_name,
                          }}
                        />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  style={{ marginTop: '10px' }}
                  type="submit"
                  className="btn md-btn pull-right blue"
                  disabled={submitting}
                  onClick={this.onCloseHandler.bind(this)}
                >
                  <FormattedMessage id="app.global.button.confirm" />
                </button>
              </div>
            </div>
          </div>
        </ModalDialog>
        <ToastNotification />
      </div >
    );
  }
}

const selector = formValueSelector('CoinDepositTransferForm'); // <-- same as form name
CoinDepositTransferForm = connect(state => {
  // can select values individually
  const requested_amount = selector(state, 'requested_amount') || 0;
  const to_address = selector(state, 'to_address') || '';
  const tag = selector(state, 'tag') || 0;
  const txid = selector(state, 'txid') || '';
  return {
    requested_amount: accounting.unformat(requested_amount),
    to_address: to_address,
    tag: tag,
    txid: txid,
  };
})(CoinDepositTransferForm);

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ wallet, user: { profile } }) {
  let userDepositRequest =
    wallet && wallet.userDepositRequest ? wallet.userDepositRequest : null;
  const detail = (wallet && wallet.detail) || null;
  const firstWallet =
    detail && detail.result && detail.result[0] ? detail.result[0] : null;
  return {
    wallet: firstWallet,
    user: profile,
    userDepositData: userDepositRequest,
    initialValues: {
      ...userDepositRequest,
    },
    enableReinitialize: true, // re-install default value if any change
  };
}
// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      { updateDepositRequest, setRuntimeVariable },
      dispatch,
    ),
  };
}

function validate(values, props) {
  const { intl } = props;

  const errors = {};
  if (!values.txid) {
    errors.txid = intl.formatMessage({
      id: 'app.validation.require'
    });
  }
  return errors;
}

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    reduxForm({
      form: 'CoinDepositTransferForm',
      validate
    })(CoinDepositTransferForm),
  ),
);
