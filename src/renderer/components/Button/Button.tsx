import React from "react";

interface ButtonProps {
  readonly onClick: (event: React.MouseEvent<HTMLSpanElement>) => void;
  readonly className?: string;
}

const Button = React.memo<React.PropsWithChildren<ButtonProps>>(function Button({ onClick, className, children }) {
  return (
    <span className={`${className || ""} Button`.trim()} onClick={onClick}>
      {children}
    </span>
  );
});

export default Button;
