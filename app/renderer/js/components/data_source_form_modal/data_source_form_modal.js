import React from 'react';
import Modal from 'react-modal';

export default class DataSourceFormModal extends React.Component {
  handleChange(e) {
    let el = e.target;
    let name = el.getAttribute('name');
    let value = el.value;
    this.props.dispatch('changeDataSourceFormModalValue', name, value);
  }

  handleCancel() {
    this.props.dispatch('closeDataSourceFormModal');
  }

  handleSave() {
    this.props.dispatch('saveDataSourceFormModal');
  }

  onClickConnectionTest() {
    this.props.dispatch('executeConnectionTest', this.props.dataSourceFormValues);
  }

  render() {
    let dataSource = this.props.dataSourceFormValues;
    if (!dataSource) return null;

    dataSource.config = dataSource.config || {};

    let handleChange = this.handleChange.bind(this);
    let style = {
      overlay: {
        backgroundColor: '',
      },
      content: {
        top: 0,
        bottom: null,
        left: 0,
        right: 0,
        margin: '0 auto',
        width: '400px',
        borderRadius: 0,
        backgroundColor: '#EFEFEF',
        border: '1px solid #CCC',
        borderTop: 'none',
        boxShadow: '1px 1px 10px rgba(0,0,0,0.2), 0 6px 10px -6px rgba(0,0,0,0.2) inset',
        outline: 'none',
      },
    };

    return <Modal isOpen={true} style={style} className="DataSourceFormModal">
      <table>
        <tbody>
          <tr>
            <th>Name</th>
            <td><input type="text" value={dataSource.name} name="name" onChange={handleChange} /></td>
          </tr>
          <tr>
            <th>Type</th>
            <td>
              <select value={dataSource.type} name="type" onChange={handleChange}>
                <option></option>
                <option value="mysql">MySQL</option>
                <option value="postgres">PostgreSQL</option>
              </select>
            </td>
          </tr>
          <tr>
            <th>Host</th>
            <td><input type="text" value={dataSource.config.host} name="config.host" onChange={handleChange} /></td>
          </tr>
          <tr>
            <th>Port</th>
            <td><input type="text" value={dataSource.config.port} name="config.port" onChange={handleChange} /></td>
          </tr>
          <tr>
            <th>Username</th>
            <td><input type="text" value={dataSource.config.user} name="config.user" onChange={handleChange} /></td>
          </tr>
          <tr>
            <th>Password</th>
            <td><input type="password" value={dataSource.config.password} name="config.password" onChange={handleChange} /></td>
          </tr>
          <tr>
            <th>Database</th>
            <td><input type="text" value={dataSource.config.database} name="config.database" onChange={handleChange} /></td>
          </tr>
        </tbody>
      </table>

      <div className="DataSourceFormModal-connectionTest">
        <button onClick={() => this.onClickConnectionTest()}>Connection Test</button>
        <i hidden={this.props.connectionTest !== 'success'} className="fa fa-check"></i>
        <i hidden={this.props.connectionTest !== 'fail'} className="fa fa-close"></i>
        <i hidden={this.props.connectionTest !== 'working'} className="fa fa-spin fa-refresh"></i>
      </div>
      <div className="DataSourceFormModal-buttons">
        <button onClick={() => this.handleCancel()}>Cancel</button>
        <button onClick={() => this.handleSave()}>Save</button>
      </div>
    </Modal>;
  }
}
