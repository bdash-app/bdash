import React from "react";

interface SplashScreenProps {}

export default class SplashScreen extends React.Component<SplashScreenProps> {
  render() {
    return (
      <div className="SplashScreen">
        <div className="SplashScreen-text">Loading...</div>
      </div>
    );
  }
}
