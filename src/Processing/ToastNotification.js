import React from 'react';
import { connect } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import { injectIntl } from 'react-intl';

class ToastNotification extends React.Component {
  handleToast() {
    const { toastNotified, type, message, intl } = this.props;
    if (message) {
      const messageString = intl.formatMessage(
        {
          id: message.id,
        },
        message.value,
      );

      if (toastNotified) {
        switch (type) {
          case 'success':
            toast.success(messageString, {
              className: 'toast-notify-custom',
            });
            break;
          case 'error':
            toast.error(messageString, {
              className: 'toast-notify-custom',
            });
            break;
          case 'warning':
            toast.warn(messageString, {
              className: 'toast-notify-custom',
            });
            break;
          default:
            toast(messageString, {
              className: 'toast-notify-custom',
            });
            break;
        }
      }
    }
  }

  render() {
    return (
      <div>
        <ToastContainer />
        {this.handleToast()}
      </div>
    );
  }
}
function mapStateToProps({ runtime }) {
  if (runtime.toast) {
    const { toastNotified, message, type } = runtime.toast;
    return {
      toastNotified: toastNotified || false,
      message: message,
      type: type,
    };
  } else {
    return {
      toastNotified: false,
      message: null,
      type: '',
    };
  }
}
export default injectIntl(connect(mapStateToProps, null)(ToastNotification));
