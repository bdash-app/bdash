import * as React from "react";
import { store } from "./DataSourceStore";
import Action from "./DataSourceAction";
import Container from "../../flux/Container";
import DataSourceList from "../../components/DataSourceList";
import TableList from "../../components/TableList";
import TableSummary from "../../components/TableSummary";
import DataSourceForm from "../../components/DataSourceForm";

class DataSource extends React.Component<any, any> {
  componentDidMount() {
    Action.initialize();
  }

  find(id) {
    return this.state.dataSources.find(d => d.id === id);
  }

  handleSave(dataSource) {
    if (dataSource.id) {
      Action.updateDataSource(dataSource);
    } else {
      Action.createDataSource(dataSource);
    }
  }

  renderDataSourceForm() {
    if (!this.state.showForm) return;

    return (
      <DataSourceForm
        dataSource={this.state.formValue}
        onSave={this.handleSave.bind(this)}
        onCancel={Action.hideForm}
      />
    );
  }

  render() {
    const dataSource = this.find(this.state.selectedDataSourceId);

    return (
      <div className="page-DataSource">
        <div className="page-DataSource-list">
          <DataSourceList
            {...this.state}
            onClickNew={() => Action.showForm()}
            onSelect={id => Action.selectDataSource(this.find(id))}
            onEdit={id => Action.showForm(this.find(id))}
            onDelete={id => Action.deleteDataSource(id)}
            onReload={id => Action.loadTables(this.find(id))}
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

export default Container.create(DataSource, store);
