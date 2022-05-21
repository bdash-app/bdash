import React from "react";
import Modal from "react-modal";

type Props = {
  className?: string;
};

const ModalDialog: React.FC<React.PropsWithChildren<Props>> = ({ className, children }) => {
  const style = {
    overlay: { backgroundColor: "transparent" },
  };

  return (
    <Modal isOpen={true} style={style} className={`ModalDialog ${className ?? ""}`} ariaHideApp={false}>
      {children}
    </Modal>
  );
};

export default ModalDialog;
