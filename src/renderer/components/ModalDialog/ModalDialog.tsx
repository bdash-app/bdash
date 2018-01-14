import React from 'react';
import Modal from 'react-modal';

export default class ModalDialog extends React.Component {
  render() {
    let style = {
      overlay: { backgroundColor: 'transparent' },
    };

    return <Modal isOpen={true} style={style} className={`ModalDialog ${this.props.className || ''}`}>
      {this.props.children}
    </Modal>;
  }
}
