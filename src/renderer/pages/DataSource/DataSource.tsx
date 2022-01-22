import React from "react";
import { store, DataSourceState, DataSourceType } from "./DataSourceStore";
import Action from "./DataSourceAction";
import Container from "../../flux/Container";
import DataSourceList from "../../components/DataSourceList";
import TableList from "../../components/TableList";
import TableSummary from "../../components/TableSummary";
import DataSourceForm from "../../components/DataSourceForm";

class DataSource extends React.Component<unknown, DataSourceState> {
  override componentDidMount(): void {
    Action.initialize();
  }

  find(id: number): DataSourceType | undefined {
    return this.state.dataSources.find((d) => d.id === id);
  }

  handleSave(dataSource: { id: number | null } & Pick<DataSourceType, "name" | "type" | "config">): void {
    if (dataSource.id !== null) {
      Action.updateDataSource({ ...dataSource, id: dataSource.id });
    } else {
      Action.createDataSource(dataSource);
    }
  }

  renderDataSourceForm(): React.ReactNode {
    if (!this.state.showForm) return;

    return (
      <DataSourceForm
        dataSource={this.state.formValue}
        onSave={this.handleSave.bind(this)}
        onCancel={Action.hideForm}
      />
    );
  }

  override render(): React.ReactNode {
    const dataSource = this.find(this.state.selectedDataSourceId ?? -1);
    const defaultDataSourceId = this.state.setting.defaultDataSourceId ?? this.state.dataSources[0]?.id;

    return (
      <div className="page-DataSource">
        <div className="page-DataSource-list">
          <DataSourceList
            {...this.state}
            defaultDataSourceId={defaultDataSourceId}
            onClickNew={(): void => Action.showForm()}
            onSelect={(dataSource: DataSourceType): void => {
              Action.selectDataSource(dataSource);
            }}
            onEdit={(dataSource: DataSourceType): void => Action.showForm(dataSource)}
            onDelete={(id): void => {
              Action.deleteDataSource(id);
            }}
            onReload={(dataSource: DataSourceType): void => Action.reloadTables(dataSource)}
            changeDefaultDataSourceId={(defaultDataSourceId: number): void => {
              Action.updateDefaultDataSourceId(defaultDataSourceId);
            }}
          />
        </div>
        <div className="page-DataSource-tableList">
          <TableList
            dataSource={dataSource}
            {...this.state}
            onSelectTable={Action.selectTable}
            onChangeTableFilter={Action.changeTableFilter}
          />
        </div>
        <div className="page-DataSource-tableSummary">
          <TableSummary dataSource={dataSource} {...this.state} />
        </div>
        {this.renderDataSourceForm()}
      </div>
    );
  }
}

export default Container.create<DataSourceState>(DataSource, store);
