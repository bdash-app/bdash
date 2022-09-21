import React from "react";

type Props = Readonly<unknown>;

interface State {
  hasError: boolean;
}

export default class AppErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(error);
    console.error(info);
    window.alert("An unexpected error has occurred 🥲");
  }

  override render(): React.ReactNode {
    if (this.state.hasError) {
      return <h1>An unexpected error has occurred 🥲</h1>;
    }

    return this.props.children;
  }
}
