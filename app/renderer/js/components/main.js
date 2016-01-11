import React from 'react';
import mysql from 'mysql';

export default class Main extends React.Component {
  constructor() {
    super();
    this.state = {
      sql: '',
      rows: [],
      fields: [],
    };
    this.connectino = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
    });
  }

  handleInput(e) {
    this.setState({ sql: e.target.value });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.connectino.query(this.state.sql, (err, rows, fields) => {
      this.setState({ rows, fields });
    });
  }

  render() {
    let result = this.state.rows.constructor.name === 'OkPacket'
      ? <div>OK</div> : this.renderTable();

    return (
      <div>
        <textarea className="Editor"
          value={this.state.sql}
          onInput={this.handleInput.bind(this)}
        ></textarea>
        <button className="Btn" onClick={this.handleSubmit.bind(this)}>Send</button>
        {result}
      </div>
    );
  }

  renderTable() {
    let heads = this.state.fields.map((field, i) => <th key={`head-${i}`}>{field.name}</th>);
    let rows = this.state.rows.map((row, i) => {
      let cols = Object.values(row).map((value, j) => <td key={`${i}-${j}`}>{`${value}`}</td>);
      return <tr key={`cols-${i}`}>{cols}</tr>;
    });

    return (
      <table>
        <thead><tr>{heads}</tr></thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }
}
