import React from 'react';
import ReactDOM from 'react-dom';

export default class QueryTitle extends React.Component {
  constructor(props) {
    super(props);
    this.state = { edit: false };
  }

  handleClick() {
    this.setState({ edit: true }, () => {
      ReactDOM.findDOMNode(this.refs.input).focus();
    });
  }

  handleChange(e) {
    this.props.dispatch('changeTitle', this.props.query, e.target.value);
  }

  handleBlur() {
    this.setState({ edit: false });
  }

  handleKeyDown(e) {
    if (e.keyCode === 13) {
      this.setState({ edit: false });
    }
  }

  render() {
    return (
      <div className="QueryTitle">
        <input
          type="text"
          ref="input"
          value={this.props.query.title}
          onChange={(e) => this.handleChange(e)}
          onBlur={() => this.handleBlur()}
          onKeyDown={(e) => this.handleKeyDown(e)}
          hidden={!this.state.edit}
          />
        <h1
          onClick={() => this.handleClick()}
          hidden={this.state.edit}
          >
          {this.props.query.title}
        </h1>
      </div>
    );
  }
}
