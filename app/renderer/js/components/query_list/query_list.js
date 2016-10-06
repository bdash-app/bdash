import React from 'react';
import classNames from 'classnames';
import { remote } from 'electron';

export default class QueryList extends React.Component {
  handleClickNew() {
    this.props.dispatch('addNewQuery');
  }

  handleClickItem(id) {
    this.props.dispatch('selectQuery', id);
  }

  handleContextMenu(id) {
    this.props.dispatch('selectQuery', id);
    setTimeout(() => {
      let menu = remote.Menu.buildFromTemplate([
        {
          label: 'Delete',
          click: () => {
            if (window.confirm('Are you sure?')) {
              this.props.dispatch('deleteQuery', id);
            }
          },
        },
      ]);
      menu.popup(remote.getCurrentWindow());
    });
  }

  render() {
    let items = this.props.queries.map(query => {
      let className = classNames({ 'is-selected': this.props.selectedQueryId === query.id });
      return <li
        key={query.id}
        className={className}
        onClick={() => this.handleClickItem(query.id)}
        onContextMenu={() => this.handleContextMenu(query.id)}
      >{query.title}</li>;
    });

    return (
      <div className="QueryList">
        <div className="QueryList-new">
          <i className="fa fa-plus" onClick={() => this.handleClickNew()}></i>
        </div>
        <ul className="QueryList-list">{items}</ul>
      </div>
    );
  }
}
