import React, { Component } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import accounting from 'accounting';
import { bindActionCreators } from 'redux';
import {
  ERRORS,
  GLOBAL_VARIABLES,
  TOAST_TYPE,
} from '../Helpers/constants/system';
import { toast } from 'react-toastify';

import {
  createOrder,
  getOTCOrderBook,
  approveTransaction,
  cancelTransaction,
  getBankInfoList,
} from '../Redux/actions/otc';
import store from '../store';
import { getWalletDetail } from '../Redux/actions/wallet';
import { getCoinsInfoById } from '../Redux/actions/coin';
import { OTC_BUYER_APPROVE_TRANSACTION_RESET } from '../Redux/constants';
import { FormattedMessage } from 'react-intl';
import HighlightablePrice from '../Processing/HighlightablePrice.js';
import ReactBootstrapTable from '../ReactBootstrapTable/ReactBootstrapTable';
import OTCBuy from './components/OTCBuy';
import OTCSell from './components/OTCSell';
import OTCOnBuy from './components/OTCOnBuy';
import OTCOnSell from './components/OTCOnSell';
import ToastNotification from '../Processing/ToastNotification.js';
import openSocket from 'socket.io-client';
import { SocketIOHost } from '../Core/config';
import ModalDialog from '../Processing/ModalDialog';
import {
  formatNumber,
  formatNumberWithoutThousandSeparator,
  replaceSubstring,
} from '../Helpers/utils';

const customStyles = {
  content: {
    top: '55%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

const coin_id = 'TETHER';
class OTC extends Component {
  constructor(props) {
    super(props);
    this.socket = openSocket(SocketIOHost);
    this.state = {
      isOpenOTCBuyForm: false,
      isOpenOTCSellForm: false,
      isOpenOnBuyForm: false,
      isOpenOnSellForm: false,

      // Info for buyer
      selectedOrder: null,
      selectedAmount: 0,
      selectedPrice: 0,
      selectedUsername: null,

      // Info for seller
      sellerOrder: null,
      sellerAmount: 0,
      sellerPrice: 0,
      sellerUsername: null,
      isBuyerApproveModal: false,
      isCreateTransactionForSellerModal: false,
      sellerApproveForBuyOrderDataModal: false,
      step: 1,
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.buyerApproveSuccess !== this.props.buyerApproveSuccess) {
      this.setState({
        isBuyerApproveModal: this.props.buyerApproveSuccess,
      });
    }
    if (
      prevProps.createTransactionForSellerSuccess !==
      this.props.createTransactionForSellerSuccess
    ) {
      this.setState({
        isCreateTransactionForSellerModal: this.props
          .createTransactionForSellerSuccess,
      });
    }

    if (
      prevProps.sellerApproveForBuyOrderSuccess !==
      this.props.sellerApproveForBuyOrderSuccess
    ) {
      this.setState({
        sellerApproveForBuyOrderDataModal: this.props
          .sellerApproveForBuyOrderSuccess,
      });
    }
  }

  buyOrderColumns = [
    {
      Header: () => <span>Ng?????i b??n</span>,
      accessor: 'username',
      Cell: (props) => replaceSubstring(props.value),
    },
    {
      Header: () => (
        <span>
          Gi?? (VND)
        </span>
      ),
      accessor: 'price',
      className: 'text-center',
      Cell: (props) => (
        <span className="sell-color">
          {formatNumber(props.value)}
        </span>
      ),
    },
    {
      Header: () => (
        <span>
          S??? l?????ng (USDT)
        </span>
      ),
      accessor: 'quantity',
      className: 'text-center',
      Cell: (props) => (
        <HighlightablePrice
          isBlinkOnly={true}
          price={formatNumber(props.value)}
        />
      ),
    },
    {
      Header: () => (
        <span>
          T???ng (VND)
        </span>
      ),
      accessor: 'total',
      className: 'text-center',
      Cell: (props) => (
        <HighlightablePrice
          isBlinkOnly={true}
          price={formatNumber(props.value)}
        />
      ),
    },
    {
      accessor: 'order_id',
      className: 'text-center',
      Cell: (props) => {
        if (props.row.userId == this.props.userId) return null;
        return (
          <button
            onClick={() =>
              this.setState({
                isOpenOnSellForm: true,
                sellerOrder: props.value,
                sellerPrice: props.row.price,
                sellerUsername: props.row.username,
                sellerAmount: props.row.quantity,
              })
            }
            className="btn sell-outline-btn"
          >
            B??n
          </button>
        );
      },
    }
  ];

  buyOrderTableProps = {
    sorted: [{
      id: 'price',
      desc: true
    }],
    data: [],
    columns: this.buyOrderColumns
  };

  sellOrderColumns = [
    {
      Header: () => <span>Ng?????i b??n</span>,
      accessor: 'username',
      Cell: (props) => replaceSubstring(props.value),
    },
    {
      Header: () => (
        <span>
          Gi?? (VND)
        </span>
      ),
      accessor: 'price',
      className: 'text-center',
      Cell: (props) => (
        <span className="buy-color">
          {formatNumber(props.value)}
        </span>
      ),
    },
    {
      Header: () => (
        <span>
          S??? l?????ng (USDT)
        </span>
      ),
      accessor: 'quantity',
      className: 'text-center',
      Cell: (props) => (
        <HighlightablePrice
          isBlinkOnly={true}
          price={formatNumberWithoutThousandSeparator(
            formatNumber(props.value)
          )}
        />
      ),
    },
    {
      Header: () => (
        <span>
          T???ng (VND)
        </span>
      ),
      accessor: 'total',
      className: 'text-center',
      Cell: (props) => (
        <HighlightablePrice
          isBlinkOnly={true}
          price={formatNumber(props.value)}
        />
      ),
    },
    {
      accessor: 'order_id',
      className: 'text-center',
      Cell: (props) => {
        if (props.row.userId == this.props.userId) {
          return null;
        }
        return (
          <button
            onClick={() =>
              this.setState({
                isOpenOnBuyForm: true,
                selectedOrder: props.value,
                selectedPrice: props.row.price,
                selectedUsername: props.row.username,
                selectedAmount: props.row.quantity,
              })
            }
            className="btn buy-outline-btn"
          >
            Mua
          </button>
        );
      },
    }
  ];

  sellOrderTableProps = {
    sorted: [{
      id: 'price',
      desc: false
    }],
    data: [],
    columns: this.sellOrderColumns
  };

  sellerApprove = () => {
    const { actions, buyerApprovedData = {} } = this.props;
    const { transaction_id } = buyerApprovedData;

    console.log('buyerApprovedData', buyerApprovedData);
    actions.approveTransaction(
      {
        transactionId: transaction_id,
        userRole: 'seller',
        approveStatus: 'APPROVED',
      },
      null,
      () => {
        store.dispatch({
          type: OTC_BUYER_APPROVE_TRANSACTION_RESET,
        });
        this.setState({
          isBuyerApproveModal: false,
        });
      }
    );
  };

  sellerReject = () => {
    const { actions, buyerApprovedData } = this.props;
    const { transaction_id } = buyerApprovedData;
    actions.approveTransaction(
      {
        transactionId: transaction_id,
        userRole: 'seller',
        approveStatus: 'REJECT',
      },
      null,
      () => {
        this.setState({
          isBuyerApproveModal: false,
        });
      }
    );
  };

  buyerAppproveForSell = () => {
    const { actions, createTransactionForSellerData } = this.props;
    const { transaction_id } = createTransactionForSellerData;
    actions.approveTransaction(
      {
        transactionId: transaction_id,
        userRole: 'buyer',
        approveStatus: 'APPROVED',
      },
      null,
      () => {
        this.setState({
          isCreateTransactionForSellerModal: false,
        });
      }
    );
  };

  cancelTransaction = () => {
    const { actions, createTransactionForSellerData } = this.props;
    const { transaction_id } = createTransactionForSellerData;
    actions.cancelTransaction(
      {
        transactionId: transaction_id,
      },
      () => {
        this.setState({
          isCreateTransactionForSellerModal: false,
        });
      }
    );
  };

  async componentDidMount() {
    const { actions } = this.props;
    actions.getOTCOrderBook(this.socket);
    actions.getBankInfoList();
    const err2 = await actions.getWalletDetail(coin_id, false, 'SELL');
  }

  render() {
    const {
      orderList = [],
      buyerApprovedData,
      createTransactionForSellerData = {},
      bankInfo,
      secondWallet,
    } = this.props;
    const {
      selectedOrder,
      selectedAmount,
      selectedPrice,
      selectedUsername,
      sellerOrder,
      sellerAmount,
      sellerPrice,
      sellerUsername,
    } = this.state;
    const { amount, name, transaction_id } = buyerApprovedData;

    const {
      amount: sAmount,
      name: sName,
      transaction_id: sTransactionId,
      price: sPrice,
      seller_banks_info = [],
    } = createTransactionForSellerData;

    const defaultBankInfoForSeller = seller_banks_info[0] || {};
    const buyList = (orderList || []).filter((item) => item.type === 'BUY');
    const sellList = (orderList || []).filter((item) => item.type === 'SELL');
    const maxBuyPrice = _.get(
      _.maxBy(buyList, 'price'),
      'price',
      Number.MIN_SAFE_INTEGER4
    );
    const minSellPrice = _.get(
      _.minBy(sellList, 'price'),
      'price',
      Number.MAX_SAFE_INTEGER4
    );

    this.buyOrderTableProps.data = buyList;
    this.sellOrderTableProps.data = sellList;
    return (
      <div>
        <div>
          <div className="row">
            <div className="col-md-12">
              <div
                className="row"
                style={{
                  background: 'white',
                  margin: '15px 0',
                  padding: '10px 0',
                }}
              >
                <div className="col-md-12 clearfix info-chart">
                  <div className="col-md-6 col-sm-6 col-xs-12 text-center">
                    <h4 style={{ marginBottom: 0 }}>
                      <b>GI?? B??N R??? NH???T</b>
                    </h4>
                    <span className="text-info" style={{ fontSize: 30 }}>
                      <b className="sell-color">
                        {formatNumber(maxBuyPrice)}
                      </b>{' '}
                    </span>{' '}
                    <span>
                      <b>VND/USDT</b>
                    </span>
                  </div>
                  <div className="col-md-6 col-sm-6 col-xs-12 text-center">
                    <h4 style={{ marginBottom: 0 }}>
                      <b>GI?? MUA CAO NH???T</b>
                    </h4>
                    <span className="text-info" style={{ fontSize: 30 }}>
                      <b className="buy-color">
                        {formatNumber(minSellPrice)}
                      </b>{' '}
                    </span>{' '}
                    <span>
                      <b>VND/USDT</b>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 otc-list-data">
              <ReactBootstrapTable {...this.sellOrderTableProps} />{' '}
              <button
                className="btn bg-red  md-btn uppercase pull-right mt-10 margin-bottom-10"
                onClick={() => {
                  this.setState({ isOpenOTCSellForm: true });
                }}
              >
                ?????t b??n
              </button>
            </div>
            <div className="col-md-6 otc-list-data">
              <ReactBootstrapTable {...this.buyOrderTableProps} />{' '}
              <button
                className="btn bg-green-jungle md-btn uppercase pull-right mt-10 margin-bottom-10"
                onClick={() => {
                  this.setState({ isOpenOTCBuyForm: true });
                }}
              >
                ?????t mua
              </button>
            </div>
          </div>
        </div>
        <ModalDialog
          isOpen={this.state.isOpenOTCSellForm}
          customStyles={customStyles}
        >
          <div className="otc-form-section modal-dialog sending-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">?????t b??n USDT</h4>
              </div>
              <div className="modal-body">
                <OTCSell
                  secondWallet={secondWallet}
                  bankInfo={bankInfo}
                  maxBuyPrice={maxBuyPrice}
                  coinId="USDT"
                  closeModal={() => {
                    this.setState({ isOpenOTCSellForm: false });
                  }}
                />
              </div>
            </div>
          </div>
        </ModalDialog>

        <ModalDialog
          isOpen={this.state.isOpenOTCBuyForm}
          customStyles={customStyles}
        >
          <div className="otc-form-section modal-dialog sending-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">?????t mua USDT</h4>
              </div>
              <div className="modal-body">
                <OTCBuy
                  minSellPrice={minSellPrice}
                  coinId="USDT"
                  closeModal={() => {
                    this.setState({ isOpenOTCBuyForm: false });
                  }}
                />
              </div>
            </div>
          </div>
        </ModalDialog>

        <ModalDialog
          isOpen={this.state.isOpenOnBuyForm}
          customStyles={customStyles}
        >
          <div className="otc-form-section modal-dialog sending-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Giao d???ch</h4>
              </div>
              <div className="modal-body">
                <OTCOnBuy
                  minSellPrice={minSellPrice}
                  orderId={selectedOrder}
                  username={selectedUsername}
                  orderAmount={selectedAmount}
                  orderPrice={selectedPrice}
                  coinId="USDT"
                  closeModal={() => {
                    this.setState({ isOpenOnBuyForm: false });
                  }}
                />
              </div>
            </div>
          </div>
        </ModalDialog>

        <ModalDialog
          isOpen={this.state.isOpenOnSellForm}
          customStyles={customStyles}
        >
          <div className="otc-form-section modal-dialog sending-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Giao d???ch</h4>
              </div>
              <div className="modal-body">
                <OTCOnSell
                  bankInfo={bankInfo}
                  secondWallet={secondWallet}
                  maxBuyPrice={maxBuyPrice}
                  orderId={sellerOrder}
                  username={sellerUsername}
                  orderAmount={sellerAmount}
                  orderPrice={sellerPrice}
                  coinId="USDT"
                  closeModal={() => {
                    this.setState({ isOpenOnSellForm: false });
                  }}
                />
              </div>
            </div>
          </div>
        </ModalDialog>

        <ModalDialog
          isOpen={this.state.isBuyerApproveModal}
          customStyles={customStyles}
        >
          <div className="otc-form-section modal-dialog sending-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Giao d???ch</h4>
              </div>
              <div className="modal-body">
                <div className="container-fluid">
                  <div className="row">
                    <div className="col-md-12">
                      <p>
                        Ng?????i mua b??o ???? chuy???n ti???n cho b???n. Vui l??ng x??c nh???n
                        l???i t??nh tr???ng ????n h??ng th???t c???n th???n:
                      </p>
                      <p>
                        - Bank chuy???n ????ng t??n ng?????i mua l?? <b>{name}</b>
                      </p>
                      <p>
                        - S??? l?????ng ti???n: <b> {parseFloat(amount)}</b>
                      </p>
                      <p>
                        - N???i dung: <b> {`M?? giao d???ch ${transaction_id}`} </b>
                      </p>
                    </div>
                    <div className="col-md-12 mb-15">
                      <button
                        className="btn bg-green-jungle md-btn"
                        onClick={this.sellerApprove}
                      >
                        ???? nh???n ti???n
                      </button>
                      <button
                        onClick={this.buyerApprove}
                        className="btn bg-green-jungle md-btn ml-15 pull-right"
                      >
                        Tr??? l???i ti???n
                      </button>
                      <button
                        onClick={this.buyerApprove}
                        className="btn bg-red md-btn pull-right"
                      >
                        T??i ch??a nh???n ti???n
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalDialog>

        <ModalDialog
          isOpen={this.state.isCreateTransactionForSellerModal}
          customStyles={customStyles}
        >
          <div className="otc-form-section modal-dialog sending-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Giao d???ch</h4>
              </div>
              <div className="modal-body">
                <div className="container-fluid">
                  <div className="row">
                    <div className="col-md-12">
                      <p>
                        B???n ??ang mua <b>${parseFloat(sPrice)} </b>USDT v???i gi??{' '}
                        <b>{parseFloat(sAmount)}</b> VND
                      </p>
                      <p>Ph?? giao d???ch 0</p>
                      <p>
                        T???ng ti???n:{' '}
                        <b>{parseFloat(sPrice) * parseFloat(sAmount)}</b>
                      </p>
                    </div>

                    <div className="col-md-12">
                      <p>Vui l??ng chuy???n kho???n ????ng v???i th??ng tin d?????i ????y</p>
                      <p>
                        Ng??n h??ng: <b>{defaultBankInfoForSeller.bank_code}</b>
                      </p>
                      <p>
                        STK: <b>{defaultBankInfoForSeller.account}</b>
                      </p>
                      <p>
                        S??? ti???n:{' '}
                        <b>{parseFloat(sPrice) * parseFloat(sAmount)}</b>
                      </p>
                      <p>
                        N???i dung chuy???n kho???n:{' '}
                        <b>{`Chuy???n ti???n cho ????n ${sTransactionId}`}</b>
                      </p>
                    </div>

                    <div className="col-md-12 mb-15">
                      <button
                        className="btn bg-green-jungle md-btn"
                        onClick={this.buyerAppproveForSell}
                      >
                        T??i ???? chuy???n kho???n xong
                      </button>
                      <button
                        onClick={this.cancelTransaction}
                        className="btn bg-red md-btn pull-right"
                      >
                        H???y giao d???ch
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalDialog>
        <ModalDialog
          isOpen={this.state.sellerApproveForBuyOrderDataModal}
          customStyles={customStyles}
        >
          <div className="otc-form-section modal-dialog sending-dialog">
            <div className="modal-content">
              <div className="modal-body">
                <div className="container-fluid">
                  <div className="row">
                    <div className="col-md-12">
                      <p>
                        ????n h??ng ???? ???????c ho??n th??nh. B???n ???? nh???n ???????c USDT trong
                        t??i kho???n. B??y gi??? b???n ???? c?? th??? mua coins b???ng USDT
                        ho???c r??t ra.
                      </p>
                      <p>Xin c???m ??n b???n</p>
                    </div>
                    <div className="col-md-12 mb-15 pull-right">
                      <button
                        className="btn bg-red md-btn"
                        onClick={() =>
                          this.setState({
                            sellerApproveForBuyOrderDataModal: false,
                          })
                        }
                      >
                        ????ng
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ModalDialog>
        <ToastNotification />
      </div>
    );
  }
}

function mapStateToProps({ otc, wallet, user }) {
  const userId = user && user.profile && user.profile.id;
  const detailForCoin = (wallet && wallet.detail_for_coin) || null;
  const secondWallet =
    detailForCoin && detailForCoin.result && detailForCoin.result[0]
      ? detailForCoin.result[0]
      : null;
  return {
    orderList: otc && otc.orderList,
    bankInfo: otc && otc.bankInfo,
    buyerApprovedData: otc && otc.buyerApprovedData,
    buyerApproveSuccess: otc && otc.buyerApproveSuccess,

    createTransactionForSellerSuccess:
      otc && otc.createTransactionForSellerSuccess,
    createTransactionForSellerData: otc && otc.createTransactionForSellerData,
    sellerApproveForBuyOrderData: otc && otc.sellerApproveForBuyOrderData,
    sellerApproveForBuyOrderSuccess: otc && otc.sellerApproveForBuyOrderSuccess,
    secondWallet,
    userId,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        createOrder,
        getOTCOrderBook,
        getWalletDetail,
        getCoinsInfoById,
        approveTransaction,
        cancelTransaction,
        getBankInfoList,
      },
      dispatch
    ),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(OTC);
