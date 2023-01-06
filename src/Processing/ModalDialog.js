import React from 'react';
import Modal from 'react-modal';
Modal.setAppElement('#root');
class ModalDialog extends React.Component {
  constructor() {
    super();
    var defaultStyles = {
      content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
      },
    };

    this.renderModal = props => {
      var { customStyles, isOpen, className, overlayClassName } = this.props;
      return (
        <Modal
          className={className}
          overlayClassName={overlayClassName}
          isOpen={isOpen}
          style={customStyles ? customStyles : defaultStyles}
        >
          {this.props.children}
        </Modal>
      );
    };
  }

  render() {
    return this.renderModal(this.props);
  }
}

export default ModalDialog;
