import React from "react";
import Modal from "react-modal";

export default class ModalDialog extends React.Component<any, any> {
  render() {
    const style = {
      overlay: { backgroundColor: "transparent" }
    };

    return (
      <Modal isOpen={true} style={style} className={`ModalDialog ${this.props.className || ""}`} ariaHideApp={false}>
        {this.props.children}
      </Modal>
    );
  }
}
