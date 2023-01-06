import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import QRCode from 'qrcode.react';
import { bindActionCreators } from 'redux';
import { createWallet, getWalletDetail, clearWalletDetail } from '../Redux/actions/wallet';
import { FormattedMessage } from 'react-intl';
import renderHTML from 'react-render-html';
import { WALLET_NAME_MAPPING } from '../Helpers/constants/system'
class WalletForm extends React.Component {
  static propTypes = {
    actions: PropTypes.shape({
      createWallet: PropTypes.func.isRequired,
      getWalletDetail: PropTypes.func.isRequired,
    }).isRequired,
    coinName: PropTypes.string.isRequired,
    coinCode: PropTypes.string.isRequired,
    coinId: PropTypes.string.isRequired,
    requestID: PropTypes.number.isRequired,
    wallet: PropTypes.object,
  };

  static defaultProps = {
    wallet: null,
    requestID: 0,
  };
  constructor(props) {
    super(props);
    this.state = {
      interval: null,
      showAddress: false,
    };
  }
  async componentDidMount() {
    // send create coin request if it's the first time user open the coin
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

  collapseAddress = () => {
    this.setState(prevState => {
      prevState.showAddress = !prevState.showAddress;
      return prevState;
    })
  }

  renderCloseButton(customStyle) {
    const { closeModal } = this.props;
    return (
      <button
        type="button"
        className={customStyle ? customStyle : 'btn md-btn pull-right red'}
        onClick={closeModal}
      >
        <FormattedMessage id="app.global.button.close" />
      </button>
    );
  }
  render() {
    console.count(this.props.coinCode)
    const { wallet, coinCode, coinName, displayAsCoinName } = this.props;
    return (
      <div className="panel panel-warning">
        <div className="panel-heading">
          <h3 className="panel-title">
            <FormattedMessage
              id="v2.wallet.popup.sendtitle"
              values={{ coinCode: displayAsCoinName ?  WALLET_NAME_MAPPING[coinCode] :  coinCode }}
            />
          </h3>
        </div>
        <div className="panel-body">
          {wallet ? (
            <div>
              <div className="row static-info">
                <div className="col-md-3 name">
                  {' '}
                  <FormattedMessage
                    id="v2.wallet.popup.send.address"
                    values={{ coinName: displayAsCoinName ?  WALLET_NAME_MAPPING[coinCode] :  coinName }}
                  />
                </div>
                <div className="col-md-9 value value--address input-copy">
                  <input
                    id="coin-address"
                    type="text"
                    value={wallet.coin_address}
                    readOnly
                  />
                  <span className="tooltip-content">
                    <a className="btn btn-info has-tooltip" 
                    data-clipboard-text={wallet.coin_address}>
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
                      wallet.coin_address
                    }
                  </div>
                </div>
              </div>

              {wallet.coin_tag && (
                <div className="row static-info">
                  <div className="col-md-3 name">
                    {' '}
                    {wallet.additional_column_name}:{' '}
                  </div>
                  <div className="col-md-9 value value--tag">
                    <input
                      id="coin-tag"
                      type="text"
                      value={wallet.coin_tag}
                      readOnly
                    />
                    <span className="tooltip-content">
                      <a className="btn btn-info has-tooltip" data-clipboard-text={wallet.coin_tag}>
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
              )}

              <div className="row static-info">
                <div className="col-md-3 name">
                  {' '}
                  <FormattedMessage id="v2.wallet.popup.send.QR" />
                </div>
                <div className="col-md-9 value value--QR">
                  <QRCode value={wallet.coin_address} fgColor="#c27d0e" />
                </div>
              </div>
              {wallet.withdraw_description && (
                <div className="note note-info" style={{marginBottom: 10}}>
                  {renderHTML(wallet.deposit_description)}
                </div>
              )}
              {this.props.isHideCloseButton ? null: this.renderCloseButton('btn md-btn pull-right red btn-close--popup')}
            </div>
          ) : (
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
            )}
        </div>
      </div>
    );
  }
}

// LINK STATE FROM REDUCER TO THIS CLASS. NEED TO DO PROPS VALIDATION
function mapStateToProps({ wallet }) {
  const detail = (wallet && wallet.detail) || null;
  const firstWallet =
    detail && detail.result && detail.result[0] ? detail.result[0] : null;
  return {
    wallet: firstWallet,
    requestID: (detail && detail.request_id * 1) || 0,
  };
}
// LINK ACTIONS TO THE CLASS SO YOU CAN USE IT LIKE IF IT WAS A PROPS. NEED TO DO PROPS VALIDATION
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ createWallet, getWalletDetail, clearWalletDetail }, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(WalletForm);
