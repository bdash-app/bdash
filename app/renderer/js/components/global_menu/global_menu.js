import React from 'react';
import classNames from 'classnames';

export default class GlobalMenu extends React.Component {
  get menuList() {
    return [
      { name: 'query', icon: 'terminal' },
      { name: 'connection', icon: 'database' },
      { name: 'history', icon: 'history' },
      { name: 'setting', icon: 'cog' },
    ].map((item, idx) => {
      let selected = this.props.selectedGlobalMenu === item.name;
      let className = classNames('GlobalMenu-item', { 'is-selected': selected });

      return (
        <span className={className} onClick={() => this.handleClick(item.name)} key={idx}>
          <i className={`fa fa-${item.icon}`}></i>
        </span>
      );
    });
  }

  handleClick(name) {
    this.props.dispatch('selectGlobalMenu', name);
  }

  render() {
    return <div className="GlobalMenu">{this.menuList}</div>;
  }
}
