import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import accounting from 'accounting';
import openSocket from 'socket.io-client';
import {
  createTransaction,
  cancelTransaction,
  approveTransaction,
} from '../../Redux/actions/otc';
import OTCOnTradingFormSell from './OTCOnTradingFormSell';

class OTCOnSell extends Component {
  state = {
    step: 1,
    data: {},
    dataForCreateTransaction: {},
  };
  onSubmit = (value) => {
    // const { actions, coinId, socket, orderId, closeModal } = this.props;
    // console.log('value', value);
    // console.log(this.props);
    // const createdData = {
    //   amount: accounting.unformat(value.amount),
    //   orderId: orderId,
    // };
    // actions.createTransaction(createdData, socket, this.callbackFn);
    this.setState({
      step: 2,
      dataForCreateTransaction: value,
    });
  };

  callbackFn = (data) => {
    console.log('data', data);
    this.setState({
      step: 3,
      data,
    });
  };

  callbackSellerApprove = () => {
    this.setState({
      step: 4,
    });
  };

  cancelTransaction = () => {
    this.setState({
      step: 1,
    });
  };

  createTransaction = () => {
    const { dataForCreateTransaction } = this.state;
    const { actions, coinId, socket, orderId, closeModal } = this.props;
    console.log('value', dataForCreateTransaction);
    console.log(this.props);
    const createdData = {
      amount: accounting.unformat(dataForCreateTransaction.amount),
      orderId: orderId,
    };
    actions.createTransaction(createdData, socket, this.callbackFn);
  };
  sellerApprove = () => {
    const { actions } = this.props;
    const {
      data: { transaction_id },
    } = this.state;
    console.log('this.props', this.props);
    actions.approveTransaction(
      {
        transactionId: transaction_id,
        userRole: 'seller',
        approveStatus: 'APPROVED',
      },
      null,
      this.callbackSellerApprove
    );
  };
  render() {
    const {
      coinId,
      closeModal,
      username,
      orderAmount,
      orderPrice,
      secondWallet,
      bankInfo,
    } = this.props;
    const {
      step,
      dataForCreateTransaction: { amount, total },
    } = this.state;
    const defaultBank = bankInfo[0] || {};
    console.log('defaultBank', defaultBank);
    return (
      <div>
        {step === 1 && (
          <OTCOnTradingFormSell
            username={username}
            orderAmount={orderAmount}
            orderPrice={orderPrice}
            coinId={coinId}
            onSubmit={this.onSubmit}
            initialValues={null}
            form="otc-on-buy-form"
            type="BUY"
            closeModal={closeModal}
            secondWallet={secondWallet}
            bankInfo={bankInfo}
          />
        )}
        {step === 2 && (
          <div className="otc-form-section modal-dialog sending-dialog">
            <div className="modal-content">
              <div className="modal-body">
                <div className="container-fluid">
                  {true ? (
                    <div className="row">
                      <div className="col-md-12">
                        <p>Vui lòng kiểm tra lại đơn hàng</p>
                        <p>
                          Tổng tiền:{' '}
                          {/* <b>{parseFloat(amount) * orderPrice} VND</b> */}
                          <b>{total} VND</b>
                        </p>
                        <p>
                          Ngân hàng:{' '}
                          <b>{defaultBank.bank_code || 'VCB ( Dummy data )'}</b>
                        </p>
                        <p>
                          STK ngân hàng:{' '}
                          <b>{defaultBank.account || 'John Due'} </b>
                        </p>
                        <p>
                          Tên tài khoản:{' '}
                          <b>{defaultBank.bank_account_name || '123124324'}</b>
                        </p>
                      </div>
                      <div className="col-md-12 mb-15">
                        <button
                          onClick={this.createTransaction}
                          className="btn bg-green-jungle md-btn pull-right"
                        >
                          Tiếp tục
                        </button>
                        <button
                          className="btn bg-red md-btn"
                          onClick={this.cancelTransaction}
                        >
                          Quay lại
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="col-md-12">
                      <p>Bạn chưa có thông tin ngân hàng. Vui lòng cập nhật</p>
                    </div>
                  )}
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
                        Vui lòng chờ trong giây lát chúng tôi đang chuyển đơn
                        hàng tới cho người mua chuyển khoản cho bạn
                      </p>
                    </div>
                    <div className="col-md-12 mb-15">
                      <button
                        className="btn md-btn"
                        onClick={this.cancelTransaction}
                      >
                        Tôi đã đợi quá lâu vui lòng hủy đơn hàng
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

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      { createTransaction, cancelTransaction, approveTransaction },
      dispatch
    ),
  };
}

export default connect(null, mapDispatchToProps)(OTCOnSell);
