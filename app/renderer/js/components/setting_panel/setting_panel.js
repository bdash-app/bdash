import React from 'react';
import Select from 'react-select';

export default class SettingPanel extends React.Component {
  handleChangeKeyBind(e) {
    this.props.dispatch('updateSetting', { keyBind: e.value });
  }

  render() {
    let keyBindOptions = ['default', 'vim'].map(v => ({ value: v, label: v }));
    return (
      <div className="SettingPanel">
        <div className="SettingPanel-item SettingPanel-keyBind">
          <label>Key bind</label>
          <Select
            value={this.props.setting.keyBind || 'default'}
            options={keyBindOptions}
            onChange={(o) => this.handleChangeKeyBind(o)}
            clearable={false}
            />
        </div>
      </div>
    );
  }
}
