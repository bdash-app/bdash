import React from 'react';

export default class QueryTitle extends React.Component {
  render() {
    return <h1 className="QueryTitle">{this.props.query.title}</h1>;
  }
}
