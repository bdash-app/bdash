import React from "react";
import Select from "react-select";
import { selectStyles } from "../Select";
import { QueryType } from "../../../lib/Database/Query";
import { DataSourceType } from "../../pages/DataSource/DataSourceStore";
import QueryHeaderTitle from "../QueryHeaderTitle";

type Props = {
  readonly query: QueryType;
  readonly dataSources: DataSourceType[];
  readonly onChangeTitle: (title: string) => void;
  readonly onChangeDataSource: (dataSourceId: number) => void;
};

const QueryHeader: React.FC<Props> = ({ query, dataSources, onChangeTitle, onChangeDataSource }) => {
  const handleChangeDataSource = React.useCallback(
    (e: any): void => {
      onChangeDataSource(e.value);
    },
    [onChangeDataSource]
  );

  const options = dataSources.map((dataSource) => {
    return { value: dataSource.id, label: dataSource.name };
  });
  const currentOption = options.find((option) => option.value === query.dataSourceId);

  return (
    <div className="QueryHeader">
      <QueryHeaderTitle title={query.title} onChangeTitle={onChangeTitle} />
      <Select
        className="QueryHeader-selectDataSource"
        value={currentOption}
        options={options}
        onChange={handleChangeDataSource}
        placeholder={"Select data source..."}
        isClearable={false}
        isSearchable={false}
        styles={selectStyles}
      />
    </div>
  );
};

export default QueryHeader;
