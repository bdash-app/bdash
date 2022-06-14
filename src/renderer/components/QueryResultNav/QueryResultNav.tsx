import React from "react";
import Flyout from "react-micro-flyout";
import classNames from "classnames";
import { QueryType } from "../../../lib/Database/Query";

type Props = {
  readonly query: QueryType;
  readonly onClickCopyAsJson: () => void;
  readonly onClickCopyAsTsv: () => void;
  readonly onClickCopyAsCsv: () => void;
  readonly onClickCopyAsMarkdown: () => void;
  readonly onClickShareOnGist: () => void;
  readonly onClickShareOnBdashServer: () => void;
  readonly onSelectTab: (tabName: "table" | "chart") => void;
};

const QueryResultNav = React.memo<Props>(function QueryResultNav({
  query,
  onClickCopyAsJson,
  onClickCopyAsTsv,
  onClickCopyAsCsv,
  onClickCopyAsMarkdown,
  onClickShareOnGist,
  onClickShareOnBdashServer,
  onSelectTab,
}) {
  const [openShareFlyout, setOpenShareFlyout] = React.useState(false);

  const selectedTab = (name: string): boolean => {
    return (query.selectedTab || "table") === name;
  };

  const handleClickCopyAsJson = (): void => {
    setOpenShareFlyout(false);
    onClickCopyAsJson();
  };

  const handleClickCopyAsTsv = (): void => {
    setOpenShareFlyout(false);
    onClickCopyAsTsv();
  };

  const handleClickCopyAsCsv = (): void => {
    setOpenShareFlyout(false);
    onClickCopyAsCsv();
  };

  const handleClickCopyAsMarkdown = (): void => {
    setOpenShareFlyout(false);
    onClickCopyAsMarkdown();
  };

  const handleClickShareOnGist = (): void => {
    setOpenShareFlyout(false);
    onClickShareOnGist();
  };

  const handleClickShareOnBdashServer = (): void => {
    setOpenShareFlyout(false);
    onClickShareOnBdashServer();
  };

  return (
    <div className="QueryResultNav">
      <span
        className={classNames("QueryResultNav-tabMenu", {
          "is-selected": selectedTab("table"),
        })}
        onClick={(): void => onSelectTab("table")}
      >
        <i className="fas fa-table" />
      </span>
      <span
        className={classNames("QueryResultNav-tabMenu", {
          "is-selected": selectedTab("chart"),
        })}
        onClick={(): void => onSelectTab("chart")}
      >
        <i className="fas fa-chart-bar" />
      </span>
      <div className="QueryResultNav-share">
        <span className="QueryResultNav-shareBtn" onClick={(): void => setOpenShareFlyout(true)}>
          <i className="fas fa-share-alt" />
        </span>
        <Flyout
          open={openShareFlyout}
          className="QueryResultNav-shareFlyout"
          onRequestClose={(): void => setOpenShareFlyout(false)}
        >
          <ul>
            <li onClick={handleClickCopyAsJson}>Copy table as JSON</li>
            <li onClick={handleClickCopyAsTsv}>Copy table as TSV</li>
            <li onClick={handleClickCopyAsCsv}>Copy table as CSV</li>
            <li onClick={handleClickCopyAsMarkdown}>Copy table as Markdown</li>
            <li onClick={handleClickShareOnGist}>Share on gist</li>
            <li onClick={handleClickShareOnBdashServer}>Share on Bdash Server</li>
          </ul>
        </Flyout>
      </div>
    </div>
  );
});

export default QueryResultNav;
