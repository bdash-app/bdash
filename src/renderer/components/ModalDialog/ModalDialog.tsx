import * as React from 'react';
import * as Modal from 'react-modal';

export default class ModalDialog extends React.Component<any, any> {
  render() {
    let style = {
      overlay: { backgroundColor: 'transparent' },
    };

    return <Modal isOpen={true} style={style} className={`ModalDialog ${this.props.className || ''}`}>
      {this.props.children}
    </Modal>;
  }
}
