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
                        Bạn đang giao dịch mua USDT của user: <b>{username}</b>
                      </p>
                      <p>
                        Số lượng: <b>{amount}</b>
                      </p>
                      <p>
                        Phí giao dịch: <b>0%</b>
                      </p>
                      <p>
                        Tổng USDT nhận thực: <b>{amount}</b>{' '}
                      </p>
                    </div>
                    {defaultBankInfo ? (
                      <div className="col-md-12">
                        <p>
                          Nếu bạn đồng ý vui lòng chuyển khoản cho người bán
                          theo thông tin bên dưới
                        </p>
                        <p></p>
                        <p>
                          Ngân hàng: <b>{defaultBankInfo.bank_code}</b>
                        </p>
                        <p>
                          Tên người bán:{' '}
                          <b>{defaultBankInfo.bank_account_name}</b>
                        </p>
                        <p>STK: {defaultBankInfo.account}</p>
                        <p>
                          Số tiền CK: <b>{amount * orderPrice} </b> VND
                        </p>
                        <p>
                          Nội dung chuyển khoản:{' '}
                          {`Mã giao dịch ${transaction_id}`}{' '}
                        </p>
                      </div>
                    ) : (
                      <div className="col-md-12">
                        <p>
                          <b>
                            Bạn chưa có thông tin ngân hàng, vui lòng cập nhật
                            trước khi giao dịch
                          </b>
                        </p>
                      </div>
                    )}
                    {defaultBankInfo && (
                      <div className="col-md-12">
                        <p>
                          Vui lòng chuyển khoản chính xác thông tin trên nếu
                          không đơn hàng sẽ bị hủy
                        </p>
                      </div>
                    )}
                    <div className="col-md-12 mb-15">
                      <button
                        className="btn bg-red md-btn"
                        onClick={this.cancelTransaction}
                      >
                        Hủy GD
                      </button>
                      <button
                        onClick={this.buyerApprove}
                        className="btn bg-green-jungle md-btn pull-right"
                      >
                        Tôi đã chuyển khoản
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
                        Chúng tôi đang đợi người bán xác nhận đã nhận tiền. Vui
                        lòng đợi trong giây lát.
                      </p>
                    </div>
                    <div className="col-md-12 mb-15">
                      <button
                        className="btn md-btn"
                        onClick={this.cancelTransaction}
                      >
                        Nhờ site hỗ trợ, hiện tại tôi đã chuyển khoản lâu mà
                        chưa nhận được USDT
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
                        Đơn hàng đã được hoàn thành. Bạn đã nhận được USDT trong
                        tài khoản. Bây giờ bạn đã có thể mua coins bằng USDT
                        hoặc rút ra.
                      </p>
                      <p>Xin cảm ơn bạn</p>
                    </div>
                    <div className="col-md-12 mb-15 pull-right">
                      <button
                        className="btn bg-red md-btn"
                        onClick={closeModal}
                      >
                        Đóng
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
