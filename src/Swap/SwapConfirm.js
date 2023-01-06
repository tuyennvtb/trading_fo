import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { confirmSwap } from '../Redux/actions/swap';
import { toast } from 'react-toastify';
import { setRuntimeVariable } from '../Redux/actions/runtime';
import { formatNumber } from '../Helpers/utils';

class SwapConfirm extends React.Component {
  state = {
    timeout: 60
  }

  componentDidMount() {
    this.countDown();
  }

  countDown = () => {
    let seconds = 60;
    setInterval(() => {
      const timeout = seconds--;
      this.setState({
        timeout
      });
      if (timeout < 1) {
        this.props.closeDialog();
      }
    }, 1000);
  }

  onConfirm = async () => {
    const { dataConfirm, actions } = this.props;
    const dataForm = {
      transaction_id: dataConfirm.transaction_id
    };

    actions.loading({
      name: 'loading',
      value: true,
    })
    const err = await actions.confirmSwap(dataForm);
    if (err) {
      this.props.toast.error(err, {
        className: 'toast-notify-custom',
      });
    } else {
      this.props.closeDialog();
      this.props._getDetailWallet(dataConfirm.from_coin, 'BUY');
      this.props._getDetailWallet(dataConfirm.to_coin, 'SELL');
      this.props._getHistory();
      this.props._enableHistory();
      const successMsg = <FormattedMessage id="page.swap.confirm.successMsg"
        values={{
          id: dataConfirm.transaction_id
        }}
      />;
      toast.success(successMsg, {
        className: 'toast-notify-custom',
      });
    }
    actions.loading({
      name: 'loading',
      value: false,
    })
  }

  renderMinimunOutput = () => {
    const { dataConfirm } = this.props;
    return (
      <span>
        <FormattedMessage id="page.swap.confirm.minimunOutput"
          values={{
            from: formatNumber(dataConfirm.min_receive_amount, 5),
            to: formatNumber(dataConfirm.max_recieve_amount, 5)
          }}
        /> <b>{dataConfirm.to_coin_code}</b>
      </span>
    );
  }

  render() {
    const { dataConfirm } = this.props;
    return (
      <div className="modal-dialog order-confirmation-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-hidden="true"
              onClick={this.props.closeDialog}
            />
            <h4 className="modal-title">
              <i className="fa fa-upload" />
              &nbsp; <FormattedMessage id="app.exchange.simple.confirmtransaction" />
            </h4>
          </div>
          <div className="modal-body">
            <div className="panel panel-warning">
              <div className="panel-body">
                <p>
                  Swap {formatNumber(dataConfirm.from_amount, 5)} <b>{dataConfirm.from_coin_code}</b> -> {formatNumber(dataConfirm.to_amount, 5)} <b>{dataConfirm.to_coin_code}</b>
                </p>
                <p>{this.renderMinimunOutput()}</p>
                <p>
                  <FormattedMessage id="page.swap.confirm.countdown" /> <b>{this.state.timeout}s</b>
                </p>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className={'btn md-btn pull-right red btn-wallet'}
              style={{
                marginTop: '10px',
                marginLeft: '10px',
                marginBottom: '10px',
              }}
              onClick={this.props.closeDialog}
            >
              <FormattedMessage id="app.global.button.close" />
            </button>
            <button
              style={{ marginTop: '10px' }}
              type="submit"
              className="btn md-btn pull-right blue"
              onClick={this.onConfirm}
            >
              <FormattedMessage id="app.global.button.confirm" />
            </button>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({
      confirmSwap,
      loading: setRuntimeVariable
    }, dispatch),
  };
}


export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(SwapConfirm));