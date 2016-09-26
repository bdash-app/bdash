import React from 'react';
import classNames from 'classnames';

export default class ConnectionList extends React.Component {
  handleClickNew() {
    this.props.dispatch('addNewConnection');
  }

  handleClickItem(id) {
    this.props.dispatch('selectConnection', id);
  }

  render() {
    let items = this.props.connections.map(connection => {
      let className = classNames({ 'is-selected': this.props.selectedConnectionId === connection.id });
      return <li
        key={connection.id}
        className={className}
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
