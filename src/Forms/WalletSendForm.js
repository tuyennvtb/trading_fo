import React from 'react';
import {
  Field,
  reduxForm,
  SubmissionError,
  formValueSelector,
} from 'redux-form';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
  FormattedHTMLMessage,
} from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RenderIconSingleField } from './Renders';
import {
  isRequired,
  isNumber,
  isMaxLength10,
  isIntegerAfterFee,
} from './Validation';
import { sendCoin, createWallet, getWalletDetail, clearWalletDetail } from '../Redux/actions/wallet';
import Link from '../Link';
import { formatNumber } from '../Helpers/utils';
import renderHTML from 'react-render-html';
import _ from 'lodash';
import { BigNumber } from 'bignumber.js';
import accounting from 'accounting';
import { setRuntimeVariable } from '../Redux/actions/runtime';
import { isValidWalletAddress } from '../Helpers/utils'
import { WALLET_NAME_MAPPING } from '../Helpers/constants/system'
BigNumber.config({ DECIMAL_PLACES: 5 });
class WalletSendForm extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      sendCoin: PropTypes.func.isRequired,
      createWallet: PropTypes.func.isRequired,
      getWalletDetail: PropTypes.func.isRequired,
    }).isRequired,
    handleSubmit: PropTypes.func.isRequired,
    error: PropTypes.any, // eslint-disable-line react/forbid-prop-types, react/require-default-props
    pristine: PropTypes.bool.isRequired,
    reset: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    submitSucceeded: PropTypes.bool.isRequired,
    coinName: PropTypes.string.isRequired,
    coinCode: PropTypes.string.isRequired,
    coinId: PropTypes.string.isRequired,
    isEnable2FA: PropTypes.bool.isRequired,
    wallet: PropTypes.object,
    intl: intlShape.isRequired,
    requestID: PropTypes.number.isRequired,
  };

  static defaultProps = {
    wallet: null,
    requestID: 0,
  };

  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      sendTo: null,
      errMsg: '',
      isNeedToApprove: false,
      showAddress: false
    };
    this.handleMaxAmount = this.handleMaxAmount.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onConfirmation = this.onConfirmation.bind(this);
  }

  async componentDidMount() {
    
    // create coin request if it's the first time user open the coin
    const { actions, wallet, requestID, coinId, coinCode, isGroup } = this.props;
    if (
      (wallet === null && requestID === 0) ||
      (wallet &&
        wallet.coin_id.toLowerCase() !== (coinId && coinId.toLowerCase()))
    ) {
      await actions.createWallet(coinId, coinCode);
    }
    if (
      !wallet ||
      wallet.coin_id.toLowerCase() !== (coinId && coinId.toLowerCase())
    ) {
      this.intervalId = setInterval(() => {
        actions.getWalletDetail(coinId, true, 'BUY', null, coinCode);
        clearInterval(this.intervalId);
      }, 10000);
    }

    if ( wallet && isGroup && coinCode !== wallet.coin_code) {
      clearInterval(this.intervalId);
      actions.clearWalletDetail();
      await actions.getWalletDetail(coinId, true, 'BUY', null, coinCode);
    }
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  componentDidUpdate(prevProps) {
    const { updateLoadedWalletStatus, wallet, isLoadedWallet } = this.props;
    if (updateLoadedWalletStatus && wallet && !isLoadedWallet) {
      updateLoadedWalletStatus(true)
    }
  }
  collapseAddress = () => {
    this.setState(prevState => {
      prevState.showAddress = !prevState.showAddress;
      return prevState;
    })
  }

  handleMaxAmount() {
    const { wallet } = this.props;
    this.props.change('amount_to_send', (wallet.available_to_use || 0) * 1);
  }

  renderCloseButton(customStyle) {
    const { depositCloseModal } = this.props;
    return (
      <button
        type="button"
        className={customStyle ? customStyle : 'btn md-btn pull-right red'}
        onClick={depositCloseModal}
      >
        <FormattedMessage id="app.global.button.close" />
      </button>
    );
  }

  async onSubmit(value) {
    const {
      wallet,
      coinCode,
      coinId,
      amountToSend,
      coinsInfo,
      coinsInfoUptoDate,
      displayAsCoinName
    } = this.props;

    let min_withdrawl = 0;
    let currentCoinsInfo = coinsInfoUptoDate ? coinsInfoUptoDate : coinsInfo;
    if (currentCoinsInfo && currentCoinsInfo.length > 0) {
      let currentCoin = currentCoinsInfo.find(coin => coin.coin_id === coinId);
      if (currentCoin) {
        min_withdrawl = new BigNumber(
          formatNumber(wallet.withdraw_minimum / currentCoin.ask_price_vnd),
        );
      }
    }
    min_withdrawl = parseFloat(min_withdrawl);
    var params = { ...value };
    params.amount_to_send = amountToSend;
    params.additional_column_name = wallet.additional_column_name;

    const fromCoinAddress = value.from_coin_address || wallet.coin_address
    params.from_coin_address = fromCoinAddress
    min_withdrawl = parseFloat(min_withdrawl);

    const _isValidAddress = isValidWalletAddress(coinCode, value.to_coin_address);
    const _isValidFromAddress = isValidWalletAddress(coinCode, fromCoinAddress);
    if (!_isValidAddress) {
      throw new SubmissionError({
        _error: (
          <FormattedMessage
            id="v2.wallet.invalid.address"
            values={{
              coinCode: `${displayAsCoinName ? WALLET_NAME_MAPPING[coinCode] : coinCode}`,
            }}
          />
        ),
      });
    }
    
    if (!_isValidFromAddress) {
      throw new SubmissionError({
        _error: (
          <FormattedMessage
            id="v2.wallet.invalid.from.address"
            values={{
              coinCode: `${displayAsCoinName ? WALLET_NAME_MAPPING[coinCode] : coinCode}`,
            }}
          />
        ),
      });
    }

    if (amountToSend > wallet.available_to_use) {
      throw new SubmissionError({
        _error: (
          <FormattedMessage
            id="v2.wallet.popup.send.maxvalue.error"
            values={{
              value: `${formatNumber(
                (wallet.available_to_use || 0) * 1,
              )} ${coinCode}`,
            }}
          />
        ),
      });
    } else if (new BigNumber(amountToSend).isLessThan(min_withdrawl)) {
      throw new SubmissionError({
        _error: (
          <FormattedMessage
            id="v2.wallet.popup.send.minvalue.coin.error"
            values={{
              value: `${min_withdrawl} ${coinCode}`,
            }}
          />
        ),
      });
    } else if (amountToSend <= wallet.fee) {
      throw new SubmissionError({
        _error: (
          <FormattedMessage
            id="v2.wallet.popup.send.minvalue.fee.error"
            values={{
              value: `${wallet.fee} ${coinCode}`,
            }}
          />
        ),
      });
    }

    this.setState({
      step: 2,
      sendTo: params,
    });
  }

  async onConfirmation() {
    const { actions, isEnable2FA, coinCode, coinId } = this.props;
    const { sendTo } = this.state;
    // check password is not null
    if (isEnable2FA) {
      const google2FA = this.google2FA.value;
      if (!google2FA) {
        this.setState({
          step: 2,
          errMsg: <FormattedMessage id="error.account.missing_gg2fa_code" />,
        });
        return false;
      }

      // send coin
      sendTo.google_2fa = google2FA;
    }
    sendTo.coin_code = coinCode;
    sendTo.coin_id = coinId;

    this.setState({
      step: 3,
      errMsg: '',
      isSending: true,
    });

    const err = await actions.sendCoin(sendTo);
    // handle error case
    if (err) {
      console.log(err);
      if (err === 'RESERVE') {
        this.setState({
          step: 3,
          errMsg: '',
          isNeedToApprove: true,
          isSending: false,
        });
        return false;
      } else {
        this.setState({
          step: 1,
          errMsg: err,
        });
        return false;
      }
    }

    // handle success case
    this.setState({
      step: 3,
      errMsg: '',
      isSending: false,
    });
  }

  render() {
    const {
      handleSubmit,
      submitting,
      error,
      wallet,
      coinCode,
      coinName,
      isEnable2FA,
      intl,
      coinId,
      actions,
      displayAsCoinName
    } = this.props;
    const { step, sendTo, errMsg, isSending } = this.state;
    const coinAddress = intl.formatMessage(
      {
        id: 'v2.wallet.popup.send.coinaddress',
      },
      {
        coinName: coinName,
      },
    );
    const coinAmount = intl.formatMessage(
      {
        id: 'v2.wallet.popup.send.coinamount',
      },
      {
        coinCode: coinCode,
      },
    );
    const gg2faCode = intl.formatMessage({
      id: 'v2.wallet.popup.send.confirm.gg2fa',
    });
    return (
      <div className="panel panel-warning">
        <div className="panel-heading">
          <h3 className="panel-title">
            <FormattedMessage
              id="v2.wallet.popup.send.transfer"
              values={{ coinCode: displayAsCoinName ? WALLET_NAME_MAPPING[coinCode] : coinCode }}
            />
          </h3>
        </div>

        {wallet && !wallet.is_wallet_active ? (
          <div className="panel-body">
            {errMsg && (
              <div className="alert alert-danger" style={{ marginTop: '20px' }}>
                <strong>
                  <FormattedMessage id="app.global.button.warning" />
                </strong>{' '}
                {errMsg}.
              </div>
            )}
            {step === 3 ? (
              <div>
                {isSending ? (
                  <div className="note note-warning">
                    <h4 className="block spin-loading">
                      <FormattedMessage
                        id="v2.app.withdraw.transfer.sending"
                        values={{
                          coinCode: coinCode,
                        }}
                      />
                    </h4>
                    <p>
                      <FormattedMessage id="app.sendcoin.walletaddr.description" />
                    </p>
                  </div>
                ) : !this.state.isNeedToApprove ? (
                  <div>
                    <div className="note note-warning">
                      <h4 className="block">
                        <i
                          style={{ color: '#0bba0b' }}
                          className="fa fa-check-circle"
                        />
                        &nbsp;<FormattedMessage id="v2.wallet.popup.send.create.withdraw.request" />
                      </h4>
                      <p>
                        <FormattedMessage
                          id="v2.wallet.popup.send.create.withdraw.waiting"
                          values={{
                            link: (
                              <Link
                                style={{
                                  color: '#c27d0e',
                                  textDecoration: 'underline',
                                }}
                                href="/transactions"
                                onClick={() => this.closeButton.click()}
                              >
                                <FormattedMessage id="v2.wallet.popup.send.create.withdraw.sendinghistory" />
                              </Link>
                            ),
                          }}
                        />
                      </p>
                    </div>
                    {this.renderCloseButton('btn md-btn pull-right red')}
                  </div>
                ) : (
                      <div>
                        <div className="note note-warning">
                          <h4 className="block">
                            <i
                              style={{ color: '#c27d0e' }}
                              className="fa fa-envelope"
                            />
                            <FormattedHTMLMessage id="v2.wallet.popup.send.create.withdraw.request.confirm-email" />
                          </h4>
                          <p>
                            <FormattedMessage
                              id="v2.wallet.popup.send.create.withdraw.waiting"
                              values={{
                                link: (
                                  <Link
                                    style={{
                                      color: '#c27d0e',
                                      textDecoration: 'underline',
                                    }}
                                    href="/transactions"
                                    onClick={() => this.closeButton.click()}
                                  >
                                    <FormattedMessage id="v2.wallet.popup.send.create.withdraw.sendinghistory" />
                                  </Link>
                                ),
                              }}
                            />
                          </p>
                        </div>
                        {this.renderCloseButton('btn md-btn pull-right red')}
                      </div>
                    )}
              </div>
            ) : (
                <div>
                  <ul className="nav nav-tabs">
                    <li className={step === 1 ? 'active' : 'disabled-tab'}>
                      <a href="#sendTo" data-toggle="tab">
                        <span className="badge">1</span>{' '}
                        <FormattedMessage id="app.sendcoin.withdraw.tab.send" />
                      </a>
                    </li>
                    <li className={step === 2 ? 'active' : 'disabled-tab'}>
                      <a href="#confirmation" data-toggle="tab">
                        <span className="badge">2</span>{' '}
                        <FormattedMessage id="app.sendcoin.withdraw.confirm.send" />
                      </a>
                    </li>
                  </ul>
                  <div className="tab-content">
                    <div
                      className={
                        step === 1 ? 'tab-pane fade active in' : 'tab-pane fade'
                      }
                      id="sendTo"
                    >
                      <form onSubmit={handleSubmit(this.onSubmit)}>
                        {!isEnable2FA && (
                          <div
                            className="note note-info"
                            style={{ marginTop: '25px', marginBottom: '0px' }}
                          >
                            <FormattedMessage id="v2.wallet.popup.send.warning.gg2fa1" />
                            <Link
                              style={{
                                color: '#c27d0e',
                                textDecoration: 'underline',
                              }}
                              href="/security/google_auth"
                              onClick={() => this.closeButton.click()}
                            >
                              <b>
                                <FormattedMessage id="v2.wallet.popup.send.warning.gg2fa2" />
                              </b>
                            </Link>
                          </div>
                        )}
                        {error && (
                          <div
                            className="alert alert-danger"
                            style={{ marginTop: '25px', marginBottom: '0px' }}
                          >
                            <strong>
                              <FormattedMessage id="app.global.button.warning" />
                            </strong>{' '}
                            {error}.
                        </div>
                        )}
                        <div className="clearfix" />
                        <div className="row">
                          <div className="col-md-12">
                            <Field
                              name="to_coin_address"
                              type="text"
                              component={RenderIconSingleField}
                              id="to_coin_address"
                              placeholder={coinAddress}
                              validate={[isRequired]}
                              icon="fa-book"
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-12">
                            {coinId !== 'neo' && coinId !== 'ontology' ? (
                              <Field
                                name="amount_to_send"
                                type="text"
                                component={RenderIconSingleField}
                                id="amount_to_send"
                                placeholder={coinAmount}
                                options={{
                                  numeral: true,
                                  numeralThousandsGroupStyle: 'thousand',
                                  numeralDecimalScale: 4,
                                  numeralPositiveOnly: true,
                                }}
                                validate={[isRequired, isIntegerAfterFee]}
                                icon="fa-balance-scale"
                                handleClick={this.handleMaxAmount}
                              />
                            ) : (
                                <Field
                                  name="amount_to_send"
                                  type="text"
                                  component={RenderIconSingleField}
                                  id="amount_to_send"
                                  placeholder={coinAmount}
                                  validate={[isRequired, isIntegerAfterFee]}
                                  icon="fa-balance-scale"
                                  handleClick={this.handleMaxAmount}
                                />
                              )}
                          </div>
                          {!!wallet.allow_3rd_column ? (
                            <div className="col-md-12">
                              {wallet.additional_column_name
                                && wallet.additional_column_name
                                  .toLowerCase()
                                  .indexOf('tag') !== -1
                                && coinId !== 'monero'
                                ? (
                                  <Field
                                    name="tag"
                                    type="text"
                                    validate={[isNumber, isMaxLength10]}
                                    component={RenderIconSingleField}
                                    id="tag"
                                    placeholder={
                                      wallet.additional_column_name || 'Tag'
                                    }
                                    icon="fa-tag"
                                  />
                                )
                                : (
                                  <Field
                                    name="tag"
                                    type="text"
                                    component={RenderIconSingleField}
                                    id="tag"
                                    placeholder={
                                      wallet.additional_column_name || 'Tag'
                                    }
                                    icon="fa-tag"
                                  />
                                )}
                            </div>
                          ) : null}
                        </div>
                        <div
                          className="row"
                          style={{ marginTop: '10px', color: '#c27d0e' }}
                        >
                          <div className="col-md-9 col-md-push-3">
                            <div className="col-md-12">
                              <div className="row static-info">
                                <div className="col-md-7 name text-right">
                                  <strong>
                                    <FormattedMessage id="v2.wallet.popup.send.current.balance" />
                                  </strong>
                                </div>
                                <div className="col-md-5 value">
                                  {formatNumber(
                                    wallet.available_to_use * 1,
                                  )}&nbsp;{displayAsCoinName ? coinName : coinCode}
                                </div>
                              </div>
                            </div>
                            <div className="col-md-12">
                              <div className="row static-info">
                                <div className="col-md-7 name text-right">
                                  <strong>
                                    <FormattedMessage id="v2.wallet.popup.send.transferfee" />
                                  </strong>
                                </div>
                                <div className="col-md-5 value">
                                  {(wallet.fee || 0) * 1}&nbsp;{displayAsCoinName ? WALLET_NAME_MAPPING[coinCode] : coinCode}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {wallet.withdraw_description &&
                          step === 1 && (
                            <div className="note note-info">
                              {renderHTML(wallet.withdraw_description)}
                            </div>
                          )}
                        {this.renderCloseButton(
                          'btn md-btn pull-right red btn-wallet',
                        )}
                        <button
                          style={{ marginTop: '10px' }}
                          type="submit"
                          className="btn md-btn pull-right blue"
                          disabled={submitting || !wallet}
                        >
                          <i className="fa fa-upload" />&nbsp;<FormattedMessage id="app.global.button.withdraw" />
                        </button>
                      </form>
                    </div>
                    <div
                      className={
                        step === 2 ? 'tab-pane fade active in' : 'tab-pane fade'
                      }
                      id="confirmation"
                    >
                      {sendTo && (
                        <div>
                          <div className="summarize">
                            <div className="row static-info">
                              <div className="col-md-3 name text-left">
                                <strong>
                                  <FormattedMessage id="app.leftnavigation.profile.wallet" />
                                </strong>
                              </div>
                              <div className="col-md-9 value value--address input-copy">
                                <input
                                  id="to_coin_address"
                                  type="text"
                                  value={sendTo.to_coin_address}
                                  readOnly
                                />
                                <span className="tooltip-content">
                                  <a className="btn btn-info has-tooltip" data-clipboard-text={sendTo.to_coin_address}>
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
                                    wallet.to_coin_address
                                  }
                                </div>
                              </div>
                            </div>

                            {sendTo.tag && (
                              <div className="row static-info">
                                <div className="col-md-3 name text-left">
                                  <strong>
                                    {_.upperFirst(
                                      _.toLower(sendTo.additional_column_name),
                                    )}
                                  </strong>
                                </div>
                                <div className="col-md-9 value text-right">
                                  {sendTo.tag}
                                </div>
                              </div>
                            )}
                            <div className="row static-info">
                              <div className="col-md-3 name text-left">
                                <strong>
                                  <FormattedMessage id="app.global.button.withdraw" />
                                </strong>
                              </div>
                              <div className="col-md-9 value text-right">
                                {formatNumber(sendTo.amount_to_send * 1)}&nbsp;{coinCode.toUpperCase()}
                              </div>
                            </div>
                            <div className="row static-info">
                              <div className="col-md-3 name text-left">
                                <strong>
                                  <FormattedMessage id="v2.wallet.popup.send.transferfee" />
                                </strong>
                              </div>
                              <div className="col-md-9 value text-right">
                                {(wallet.fee || 0) * 1}&nbsp;{coinCode.toUpperCase()}
                              </div>
                            </div>
                            <div className="row static-info">
                              <div className="col-md-3 name text-left">
                                <strong style={{ fontSize: '18px' }}>
                                  <FormattedMessage id="v2.wallet.popup.send.confirm.receive" />
                                </strong>
                              </div>
                              <div
                                style={{ fontSize: '18px' }}
                                className="col-md-9 value text-right"
                              >
                                <strong className="color-green">
                                  {formatNumber(
                                    new BigNumber(
                                      sendTo.amount_to_send * 1,
                                    ).minus((wallet.fee || 0) * 1),
                                  )}&nbsp;{coinCode.toUpperCase()}
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
                                  placeholder={gg2faCode}
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
                            {this.renderCloseButton(
                              'btn md-btn pull-right red btn-wallet-confirm',
                            )}
                            <button
                              onClick={this.onConfirmation}
                              type="submit"
                              className="md-btn btn pull-right blue"
                            >
                              <i className="fa fa-thumbs-o-up" />{' '}
                              <FormattedMessage id="app.global.button.confirm" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
          </div>
        ) : (
            <div className="panel-body">
              <div className="note note-warning">
                <h4 className="block spin-loading">
                  <FormattedMessage
                    id="v2.wallet.popup.send.creating"
                    values={{ coinCode: displayAsCoinName ? WALLET_NAME_MAPPING[coinCode] : coinCode }}
                  />
                </h4>
                <p>
                  <FormattedMessage id="app.sendcoin.walletaddr.description" />
                </p>
              </div>
            </div>
          )}
      </div>
    );
  }
}

const selector = formValueSelector('WalletSendForm'); // <-- same as form name
WalletSendForm = connect(state => {
  // can select values individually
  const amountToSend = selector(state, 'amount_to_send') || 0;
  return {
    amountToSend: accounting.unformat(amountToSend),
  };
})(WalletSendForm);

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ wallet, settings, coinsInfo }) {
  const detail = (wallet && wallet.detail) || null;
  const firstWallet =
    detail && detail.result && detail.result[0] ? detail.result[0] : null;
  const settingData = settings && settings.value;
  const min_withdraw = settingData && settingData.min_withdrawal;
  const coins = (coinsInfo && coinsInfo.coinsList) || null;
  const coinsInfoUptoDate = (coinsInfo && coinsInfo.coinsListUptoDate) || null;
  return {
    wallet: firstWallet,
    initialValues: {
      from_coin_address: firstWallet ? firstWallet.coin_address : '',
      to_coin: firstWallet ? firstWallet.coin_code : '',
    },
    coinsInfo: coins,
    coinsInfoUptoDate,
    min_withdraw: min_withdraw,
    enableReinitialize: true, // re-install default value if any change
    requestID: (detail && detail.request_id * 1) || 0
  };
}
// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ sendCoin, setRuntimeVariable, createWallet, getWalletDetail, clearWalletDetail }, dispatch),
  };
}

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(
    reduxForm({
      form: 'WalletSendForm',
    })(WalletSendForm),
  ),
);
