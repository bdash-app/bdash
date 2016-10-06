import React from 'react';
import classNames from 'classnames';
import { remote } from 'electron';

export default class ConnectionList extends React.Component {
  handleClickNew() {
    this.props.dispatch('addNewConnection');
  }

  handleClickItem(id) {
    this.props.dispatch('selectConnection', id);
  }

  handleContextMenu(id) {
    this.props.dispatch('selectConnection', id);
    setTimeout(() => {
      let menu = remote.Menu.buildFromTemplate([
        {
          label: 'Edit',
          click: () => { this.props.dispatch('openConnectionFormModal', { connectionId: id }); },
        },
        {
          label: 'Delete',
          click: () => { this.props.dispatch('deleteConnection', { connectionId: id }); },
        },
      ]);
      menu.popup(remote.getCurrentWindow());
    });
  }

  render() {
    let items = this.props.connections.map(connection => {
      let className = classNames({ 'is-selected': this.props.selectedConnectionId === connection.id });
      return <li
        key={connection.id}
        className={className}
        onContextMenu={() => this.handleContextMenu(connection.id)}
        onClick={() => this.handleClickItem(connection.id)}
      >{connection.name}</li>;
    });

    return (
      <div className="ConnectionList">
        <div className="ConnectionList-new">
          <i className="fa fa-plus" onClick={() => this.handleClickNew()}></i>
        </div>
        <ul className="ConnectionList-list">{items}</ul>
      </div>
    );
  }
}
