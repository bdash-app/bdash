import React from "react";

export default class LoadingIcon extends React.Component {
  override render(): React.ReactNode {
    return <i className="LoadingIcon fas fa-spin fa-sync" />;
  }
}
