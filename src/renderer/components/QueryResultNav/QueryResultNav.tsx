import React from "react";
import Flyout from "react-micro-flyout";
import classNames from "classnames";
import { QueryType } from "../../../lib/Database/Query";

type Props = {
  readonly query: QueryType;
  readonly onClickCopyAsTsv: () => void;
  readonly onClickCopyAsCsv: () => void;
  readonly onClickCopyAsMarkdown: () => void;
  readonly onClickShareOnGist: () => void;
  readonly onClickShareOnBdashServer: () => void;
  readonly onSelectTab: (tabName: "table" | "chart") => void;
};

type State = {
  readonly openShareFlyout: boolean;
};

export default class QueryResultNav extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { openShareFlyout: false };
    this.handleClickCopyAsTsv = this.handleClickCopyAsTsv.bind(this);
    this.handleClickCopyAsCsv = this.handleClickCopyAsCsv.bind(this);
    this.handleClickCopyAsMarkdown = this.handleClickCopyAsMarkdown.bind(this);
    this.handleClickShareOnGist = this.handleClickShareOnGist.bind(this);
    this.handleClickShareOnBdashServer = this.handleClickShareOnBdashServer.bind(this);
  }

  selectedTab(name: string): boolean {
    return (this.props.query.selectedTab || "table") === name;
  }

  handleClickCopyAsTsv(): void {
    this.setState({ openShareFlyout: false });
    this.props.onClickCopyAsTsv();
  }

  handleClickCopyAsCsv(): void {
    this.setState({ openShareFlyout: false });
    this.props.onClickCopyAsCsv();
  }

  handleClickCopyAsMarkdown(): void {
    this.setState({ openShareFlyout: false });
    this.props.onClickCopyAsMarkdown();
  }

  handleClickShareOnGist(): void {
    this.setState({ openShareFlyout: false });
    this.props.onClickShareOnGist();
  }

  handleClickShareOnBdashServer(): void {
    this.setState({ openShareFlyout: false });
    this.props.onClickShareOnBdashServer();
  }

  override render(): React.ReactNode {
    return (
      <div className="QueryResultNav">
        <span
          className={classNames("QueryResultNav-tabMenu", {
            "is-selected": this.selectedTab("table"),
          })}
          onClick={(): void => this.props.onSelectTab("table")}
        >
          <i className="fas fa-table" />
        </span>
        <span
          className={classNames("QueryResultNav-tabMenu", {
            "is-selected": this.selectedTab("chart"),
          })}
          onClick={(): void => this.props.onSelectTab("chart")}
        >
          <i className="fas fa-chart-bar" />
        </span>
        <div className="QueryResultNav-share">
          <span className="QueryResultNav-shareBtn" onClick={(): void => this.setState({ openShareFlyout: true })}>
            <i className="fas fa-share-alt" />
          </span>
          <Flyout
            open={this.state.openShareFlyout}
            className="QueryResultNav-shareFlyout"
            onRequestClose={(): void => this.setState({ openShareFlyout: false })}
          >
            <ul>
              <li onClick={this.handleClickCopyAsTsv}>Copy table as TSV</li>
              <li onClick={this.handleClickCopyAsCsv}>Copy table as CSV</li>
              <li onClick={this.handleClickCopyAsMarkdown}>Copy table as Markdown</li>
              <li onClick={this.handleClickShareOnGist}>Share on gist</li>
              <li onClick={this.handleClickShareOnBdashServer}>Share on Bdash Server</li>
            </ul>
          </Flyout>
        </div>
      </div>
    );
  }
}
