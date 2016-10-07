import React from 'react';
import classNames from 'classnames';
import { remote } from 'electron';

export default class DataSourceList extends React.Component {
  handleClickNew() {
    this.props.dispatch('addNewDataSource');
  }

  handleClickItem(id) {
    this.props.dispatch('selectDataSource', id);
  }

  handleContextMenu(id) {
    this.props.dispatch('selectDataSource', id);
    setTimeout(() => {
      let menu = remote.Menu.buildFromTemplate([
        {
          label: 'Edit',
          click: () => {
            this.props.dispatch('openDataSourceFormModal', { dataSourceId: id });
          },
        },
        {
          label: 'Delete',
          click: () => {
            if (window.confirm('Are you sure?')) {
              this.props.dispatch('deleteDataSource', { dataSourceId: id });
            }
          },
        },
      ]);
      menu.popup(remote.getCurrentWindow());
    });
  }

  render() {
    let items = this.props.dataSources.map(dataSource => {
      let className = classNames({ 'is-selected': this.props.selectedDataSourceId === dataSource.id });
      return <li
        key={dataSource.id}
        className={className}
        onContextMenu={() => this.handleContextMenu(dataSource.id)}
        onClick={() => this.handleClickItem(dataSource.id)}
      >{dataSource.name}</li>;
    });

    return (
      <div className="DataSourceList">
        <div className="DataSourceList-new">
          <i className="fa fa-plus" onClick={() => this.handleClickNew()}></i>
        </div>
        <ul className="DataSourceList-list">{items}</ul>
      </div>
    );
  }
}
