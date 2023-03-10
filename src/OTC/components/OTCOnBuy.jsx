import React, { Component } from 'react';
import { SubmissionError } from 'redux-form';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import accounting from 'accounting';
import openSocket from 'socket.io-client';
import {
  createTransaction,
  cancelTransaction,
  approveTransaction,
} from '../../Redux/actions/otc';
import OTCOnTradingForm from './OTCOnTradingForm';
import { SocketIOHost } from '../../Core/config';

class OTCOnBuy extends Component {
  state = {
    step: 1,
    data: {},
  };

  componentDidUpdate(prevProps) {
    if (
      prevProps.sellerApprovedData !== this.props.sellerApprovedData &&
      this.props.sellerApprovedData
    ) {
      this.setState({
        step: 4,
      });
    }
  }
  onSubmit = (value) => {
    const {
      actions,
      coinId,
      socket,
      orderId,
      closeModal,
      maxSellPrice,
    } = this.props;
    const createdData = {
      amount: accounting.unformat(value.amount),
      orderId: orderId,
    };
    actions.createTransaction(createdData, socket, this.callbackFn);
  };

  callbackFn = (data) => {
    console.log('data', data);
    this.setState({
      step: 2,
      data,
    });
  };

  callbackBuyerApprove = () => {
    this.setState({
      step: 3,
    });
  };

  cancelTransaction = async () => {
    const { actions, closeModal } = this.props;
    const {
      data: { transaction_id },
    } = this.state;
    await actions.cancelTransaction(
      {
        transactionId: transaction_id,
      },
      closeModal
    );
  };

  buyerApprove = () => {
    const { actions } = this.props;
    const {
      data: { transaction_id },
    } = this.state;
    console.log('this.props', this.props);
    actions.approveTransaction(
      {
        transactionId: transaction_id,
        userRole: 'buyer',
        approveStatus: 'APPROVED',
      },
      null,
      this.callbackBuyerApprove
    );
  };
  render() {
    const {
      coinId,
      closeModal,
      username,
      orderAmount,
      orderPrice,
    } = this.props;
    const {
      step,
      data: { amount, seller_banks_info = [], transaction_id },
    } = this.state;

    const defaultBankInfo = seller_banks_info[0];

    return (
      <div>
        {step === 1 && (
          <OTCOnTradingForm
            username={username}
            orderAmount={orderAmount}
            orderPrice={orderPrice}
            coinId={coinId}
            onSubmit={this.onSubmit}
            initialValues={null}
            form="otc-on-buy-form"
            type="BUY"
            closeModal={closeModal}
          />
        )}
        {step === 2 && (
          <div className="otc-form-section modal-dialog sending-dialog">
            <div className="modal-content">
              <div className="modal-body">
                <div className="container-fluid">
                  <div className="row">
                    <div className="col-md-12">
                      <p>
                        B???n ??ang giao d???ch mua USDT c???a user: <b>{username}</b>
                      </p>
                      <p>
                        S??? l?????ng: <b>{amount}</b>
                      </p>
                      <p>
                        Ph?? giao d???ch: <b>0%</b>
                      </p>
                      <p>
                        T???ng USDT nh???n th???c: <b>{amount}</b>{' '}
                      </p>
                    </div>
                    {defaultBankInfo ? (
                      <div className="col-md-12">
                        <p>
                          N???u b???n ?????ng ?? vui l??ng chuy???n kho???n cho ng?????i b??n
                          theo th??ng tin b??n d?????i
                        </p>
                        <p></p>
                        <p>
                          Ng??n h??ng: <b>{defaultBankInfo.bank_code}</b>
                        </p>
                        <p>
                          T??n ng?????i b??n:{' '}
                          <b>{defaultBankInfo.bank_account_name}</b>
                        </p>
                        <p>STK: {defaultBankInfo.account}</p>
                        <p>
                          S??? ti???n CK: <b>{amount * orderPrice} </b> VND
                        </p>
                        <p>
                          N???i dung chuy???n kho???n:{' '}
                          {`M?? giao d???ch ${transaction_id}`}{' '}
                        </p>
                      </div>
                    ) : (
                      <div className="col-md-12">
                        <p>
                          <b>
                            B???n ch??a c?? th??ng tin ng??n h??ng, vui l??ng c???p nh???t
                            tr?????c khi giao d???ch
                          </b>
                        </p>
                      </div>
                    )}
                    {defaultBankInfo && (
                      <div className="col-md-12">
                        <p>
                          Vui l??ng chuy???n kho???n ch??nh x??c th??ng tin tr??n n???u
                          kh??ng ????n h??ng s??? b??? h???y
                        </p>
                      </div>
                    )}
                    <div className="col-md-12 mb-15">
                      <button
                        className="btn bg-red md-btn"
                        onClick={this.cancelTransaction}
                      >
                        H???y GD
                      </button>
                      <button
                        onClick={this.buyerApprove}
                        className="btn bg-green-jungle md-btn pull-right"
                      >
                        T??i ???? chuy???n kho???n
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="otc-form-section modal-dialog sending-dialog">
            <div className="modal-content">
              <div className="modal-body">
                <div className="container-fluid">
                  <div className="row">
                    <div className="col-md-12">
                      <p>
                        Ch??ng t??i ??ang ?????i ng?????i b??n x??c nh???n ???? nh???n ti???n. Vui
                        l??ng ?????i trong gi??y l??t.
                      </p>
                    </div>
                    <div className="col-md-12 mb-15">
                      <button
                        className="btn md-btn"
                        onClick={this.cancelTransaction}
                      >
                        Nh??? site h??? tr???, hi???n t???i t??i ???? chuy???n kho???n l??u m??
                        ch??a nh???n ???????c USDT
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
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
                        onClick={closeModal}
                      >
                        ????ng
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

function mapStateToProps({ otc }) {
  return {
    sellerApprovedData: otc && otc.sellerApprovedData,
    sellerApproveSuccess: otc && otc.sellerApproveSuccess,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      { createTransaction, cancelTransaction, approveTransaction },
      dispatch
    ),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(OTCOnBuy);
