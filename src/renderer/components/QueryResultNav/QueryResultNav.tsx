import React from "react";
import Flyout from "react-micro-flyout";
import classNames from "classnames";

export default class QueryResultNav extends React.Component<any, any> {
  constructor(...args) {
    // @ts-ignore
    super(...args);
    this.state = { openShareFlyout: false };
  }

  selectedTab(name) {
    return (this.props.query.selectedTab || "table") === name;
  }

  handleClickCopyAsTsv() {
    this.setState({ openShareFlyout: false });
    this.props.onClickCopyAsTsv();
  }

  handleClickCopyAsCsv() {
    this.setState({ openShareFlyout: false });
    this.props.onClickCopyAsCsv();
  }

  handleClickCopyAsMarkdown() {
    this.setState({ openShareFlyout: false });
    this.props.onClickCopyAsMarkdown();
  }

  handleClickShareOnGist() {
    this.setState({ openShareFlyout: false });
    this.props.onClickShareOnGist();
  }

  render() {
    return (
      <div className="QueryResultNav">
        <span
          className={classNames("QueryResultNav-tabMenu", {
            "is-selected": this.selectedTab("table")
          })}
          onClick={() => this.props.onSelectTab("table")}
        >
          <i className="fas fa-table" />
        </span>
        <span
          className={classNames("QueryResultNav-tabMenu", {
            "is-selected": this.selectedTab("chart")
          })}
          onClick={() => this.props.onSelectTab("chart")}
        >
          <i className="fas fa-chart-bar" />
        </span>
        <div className="QueryResultNav-share">
          <span className="QueryResultNav-shareBtn" onClick={() => this.setState({ openShareFlyout: true })}>
            <i className="fas fa-share-alt" />
          </span>
          <Flyout
            open={this.state.openShareFlyout}
            className="QueryResultNav-shareFlyout"
            onRequestClose={() => this.setState({ openShareFlyout: false })}
          >
            <ul>
              <li onClick={() => this.handleClickCopyAsTsv()}>Copy table as TSV</li>
              <li onClick={() => this.handleClickCopyAsCsv()}>Copy table as CSV</li>
              <li onClick={() => this.handleClickCopyAsMarkdown()}>Copy table as Markdown</li>
              <li onClick={() => this.handleClickShareOnGist()}>Share on gist</li>
            </ul>
          </Flyout>
        </div>
      </div>
    );
  }
}
