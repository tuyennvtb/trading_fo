/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

import React from 'react';
import Link from '../Link';
import { FormattedMessage } from 'react-intl';
import { GLOBAL_VARIABLES } from '../Helpers/constants/system';
import ModalDialog from '../Processing/ModalDialog';
import Timer from '../Processing/Timer';
import { CHECK_IS_MOBILE } from '../Helpers/constants/system';

class ExchangeOptionDialog extends React.Component {
  closeExchangeOptionDialog = () => {
    const { closeExchangeOptionDialog } = this.props;
    closeExchangeOptionDialog(false);
  };

  onCompletion = () => {
    const { onCompletion } = this.props;
    onCompletion();
  };

  render() {
    const exchangeOptionDialogStyles = {
      content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        marginTop: '40px',
      },
    };
    const { isShowExchangeOptions, selectedCoinId } = this.props;
    return (
      <div>
        <ModalDialog
          isOpen={isShowExchangeOptions}
          customStyles={exchangeOptionDialogStyles}
        >
          <div className="portlet light bordered modal-dialog-content exchange-option-content clearfix">
            <div className="portlet-title hidden-xs hidden-sm">
              <div className="caption text-center">
                <span className="caption-subject bold uppercase">
                  Với {selectedCoinId} chúng tôi hỗ trợ 2 hình thức mua bán, phí
                  giao dịch là như nhau, bạn có thể lựa chọn 1 trong 2 hình thức
                  phù hơp với yêu cầu của bạn
                </span>
              </div>
            </div>
            <div className="portlet-body">
              <div className="container-fluid">
                <div className="row">
                  <div className="col-md-6 col-xs-12">
                    <div className="list-footer fast-trading-list visible-xs-* visible-sm-*">
                        <p><Link
                          href={`/mua-ban-nhanh/${selectedCoinId}`}
                          className="btn btn-outline btn-circle red start-trading-btn btn-block btn-lg"
                        >
                          {CHECK_IS_MOBILE() ? (
                            <FormattedMessage id="app.exchange.textbuttonbuysellfast.mobile" />
                          ) : (
                            <FormattedMessage id="app.exchange.textbuttonbuysellfast.desktop" />
                          )}
                        </Link></p><br/>
                      </div>
                    <div className="mt-element-list exchange-type-list hidden-xs hidden-sm">
                      <div className="mt-list-head list-simple font-white bg-red-mint text-center uppercase bold">
                        <i className="fa fa-rocket" />{' '}
                        <span>Mua bán nhanh</span>
                      </div>
                      <div className="mt-list-container list-simple fast-trading-list">
                        <ul>
                          <li className="mt-list-item">
                            <div className="list-icon-container font-red-mint">
                              <i className="icon-check" />
                            </div>
                            <div className="list-item-content">
                              <span>
                                Việc mua bán, rút coin, tiền diễn ra nhanh chóng
                              </span>
                            </div>
                          </li>
                          <li className="mt-list-item">
                            <div className="list-icon-container font-red-mint">
                              <i className="icon-check" />
                            </div>
                            <div className="list-item-content">
                              <span>Thao tác mua bán đơn giản, tiện dụng</span>
                            </div>
                          </li>
                          <li className="mt-list-item">
                            <div className="list-icon-container font-red-mint">
                              <i className="icon-check" />
                            </div>
                            <div className="list-item-content">
                              <span>
                                Phù hợp với khách hàng mới và khách hàng yêu sự
                                đơn giản, tiện dụng
                              </span>
                            </div>
                          </li>
                        </ul>
                      </div>
                      <div className="list-footer fast-trading-list">
                        <Link
                          href={`/mua-ban-nhanh/${selectedCoinId}`}
                          className="btn btn-outline btn-circle red start-trading-btn"
                        >
                          Bấm vào đây để bắt đầu mua bán nhanh
                        </Link>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-xs-12">
                    <div className="list-footer normal-trading-list visible-xs-* visible-sm-*">
                        <p><Link
                          href={`/mua-ban/${selectedCoinId}`}
                          className="btn btn-outline btn-circle green-jungle start-trading-btn btn-block btn-lg"
                        >
                          {CHECK_IS_MOBILE() ? (
                            <FormattedMessage id="app.exchange.textbuttonbuysellnormal.mobile" />
                          ) : (
                            <FormattedMessage id="app.exchange.textbuttonbuysellnormal.desktop" />
                          )}
                        </Link></p><br/>
                      </div>
                    <div className="mt-element-list exchange-type-list hidden-xs hidden-sm">
                      <div className="mt-list-head list-simple font-white bg-green-jungle text-center uppercase bold">
                        <i className="fa fa fa-exchange" />{' '}
                        <span>Mua bán đặt giá</span>
                      </div>
                      <div className="mt-list-container list-simple normal-trading-list">
                        <ul>
                          <li className="mt-list-item">
                            <div className="list-icon-container done">
                              <i className="icon-check" />
                            </div>
                            <div className="list-item-content">
                              <span>Khách hàng có thể tự đặt giá mua bán</span>
                            </div>
                          </li>
                          <li className="mt-list-item">
                            <div className="list-icon-container done">
                              <i className="icon-check" />
                            </div>
                            <div className="list-item-content">
                              <span>
                                Hệ thống sẽ tự khớp lệnh của bạn khi giá thị
                                trường lên - xuống phù hợp với yêu cầu của bạn
                              </span>
                            </div>
                          </li>
                          <li className="mt-list-item">
                            <div className="list-icon-container done">
                              <i className="icon-check" />
                            </div>
                            <div className="list-item-content">
                              <span>
                                Hệ thống mua bán chuyên nghiệp, có biểu đồ để
                                giúp cho bạn có cái nhìn tổng quan hơn về giá
                              </span>
                            </div>
                          </li>
                        </ul>
                      </div>
                      <div className="list-footer normal-trading-list">
                        <Link
                          href={`/mua-ban/${selectedCoinId}`}
                          className="btn btn-outline btn-circle green-jungle start-trading-btn"
                        >
                          Bấm vào đây để bắt đầu đặt giá mua bán
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="exchange-option-note">
                <span>* Bạn còn</span>
                <span>
                  {' '}
                  <Timer
                    timeRemainingInSeconds={
                      GLOBAL_VARIABLES.EXCHANGE_OPTION_COUNTDOWN_TIME
                    }
                    onCompletion={this.onCompletion}
                  />
                </span>
                <span>
                  {' '}
                  giây để lựa chọn hình thức mua bán, nếu không lựa chọn, chúng
                  tôi sẽ tự chuyển tới trang mua bán đặt giá
                </span>
              </div>
              <div>
                <button
                  className="btn btn-secondary pull-right"
                  onClick={this.closeExchangeOptionDialog}
                >
                  <i className="fa fa-times" />{' '}
                  <FormattedMessage id="app.global.button.close" />
                </button>
              </div>
            </div>
          </div>
        </ModalDialog>
      </div>
    );
  }
}

export default ExchangeOptionDialog;
