import React from "react";
import ModalDialog from "../ModalDialog";
import Button from "../Button";
import DataSource, { DataSourceClasses } from "../../../lib/DataSource";
import ProgressIcon from "../ProgressIcon";
import { ConfigSchemaType } from "../../../lib/DataSourceDefinition/Base";
import { DataSourceType } from "../../pages/DataSource/DataSourceStore";

type Props = {
  readonly dataSource: DataSourceType | null;
  readonly onCancel: () => void;
  readonly onSave: (dataSource: { id: number | null } & Pick<DataSourceType, "name" | "type" | "config">) => void;
};

type State = {
  readonly selectedType: string | null;
  readonly connectionTestStatus: string | null;
  readonly connectionTestMessage: string | null;
};

export default class DataSourceForm extends React.Component<Props, State> {
  formTableElement: HTMLTableElement | null;
  inputNameElement: HTMLInputElement | null;

  constructor(props: Props) {
    super(props);

    this.state = {
      selectedType: props.dataSource?.type ?? null,
      connectionTestStatus: null,
      connectionTestMessage: null
    };
    this.handleCancel = this.handleCancel.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleChangeType = this.handleChangeType.bind(this);
    this.handleConnectionTest = this.handleConnectionTest.bind(this);
  }

  getConfigValues(): { [name: string]: any } {
    if (this.formTableElement === null) {
      return {};
    }

    // TODO: validation
    const inputs: NodeListOf<HTMLInputElement> = this.formTableElement.querySelectorAll(
      [
        ".DataSourceForm-configInput",
        ".DataSourceForm-configCheckbox:checked",
        ".DataSourceForm-configRadio:checked"
      ].join(",")
    );

    return Array.from(inputs).reduce((acc: { [name: string]: any }, el: HTMLInputElement) => {
      const type: string = el.dataset.type ?? "";
      if (type === "checkbox") {
        return Object.assign(acc, { [el.name]: true });
      } else if (type === "string" || type === "password" || type === "radio") {
        return Object.assign(acc, { [el.name]: el.value });
      } else if (type === "number") {
        return Object.assign(acc, { [el.name]: Number(el.value) });
      } else {
        throw new Error(`type ${type} is not supported for config`);
      }
    }, {});
  }

  handleSave(): void {
    if (this.inputNameElement === null || this.state.selectedType === null) {
      return;
    }

    const id = this.props.dataSource ? this.props.dataSource.id : null;
    const name = this.inputNameElement.value;
    const type = this.state.selectedType;
    const config = this.getConfigValues();
    this.props.onSave({ id, name, type, config });
  }

  handleCancel(): void {
    this.props.onCancel();
  }

  handleChangeType(e: React.ChangeEvent<HTMLSelectElement>): void {
    this.setState({ selectedType: e.target.value });
  }

  async handleConnectionTest(): Promise<void> {
    const type = this.state.selectedType;
    if (!type) {
      return;
    }
    const config = this.getConfigValues();
    this.setState({
      connectionTestStatus: "working",
      connectionTestMessage: null
    });

    try {
      await DataSource.create({ type, config }).connectionTest();
    } catch (err) {
      this.setState({
        connectionTestStatus: "failure",
        connectionTestMessage: err.message
      });
      return;
    }

    this.setState({ connectionTestStatus: "success" });
  }

  renderConfigCheckbox(i: number, value: boolean, schema: ConfigSchemaType): React.ReactNode {
    return (
      <tr key={i} className={schema.required ? "is-required" : ""}>
        <th>{schema.label}</th>
        <td>
          <input
            className="DataSourceForm-configCheckbox"
            type="checkbox"
            value={"true"}
            name={schema.name}
            defaultChecked={!!value}
            data-type={schema.type}
          />
        </td>
      </tr>
    );
  }

  renderConfigRadio(i: number, value: string, schema: ConfigSchemaType): JSX.Element {
    const radios = schema.values?.map(v => {
      return (
        <label key={v} className="DataSourceForm-configRadioLabel">
          <input
            className="DataSourceForm-configRadio"
            type="radio"
            value={v}
            name={schema.name}
            defaultChecked={value ? value === v : schema.default === v}
            data-type={schema.type}
          />
          {v}
        </label>
      );
    });
    return (
      <tr key={i} className={schema.required ? "is-required" : ""}>
        <th>{schema.label}</th>
        <td>{radios}</td>
      </tr>
    );
  }

  renderConfigInput(i: number, value: string, schema: ConfigSchemaType): JSX.Element {
    const type = schema.type === "password" ? "password" : "text";
    return (
      <tr key={i} className={schema.required ? "is-required" : ""}>
        <th>{schema.label}</th>
        <td>
          <input
            className="DataSourceForm-configInput"
            type={type}
            defaultValue={value}
            name={schema.name}
            placeholder={schema.placeholder?.toString()}
            data-type={schema.type}
          />
        </td>
      </tr>
    );
  }

  renderConfig(): React.ReactNode[] | null {
    const ds = this.state.selectedType ? DataSource.get(this.state.selectedType) : undefined;
    if (!ds || ds.configSchema.length === 0) return null;

    return ds.configSchema.map((schema: ConfigSchemaType, i: number) => {
      const config = this.props.dataSource?.config || {};
      const value = config[schema.name];
      switch (schema.type) {
        case "radio":
          return this.renderConfigRadio(i, value, schema);
        case "checkbox":
          return this.renderConfigCheckbox(i, value, schema);
        default:
          return this.renderConfigInput(i, value, schema);
      }
    });
  }

  render(): React.ReactNode {
    const list: DataSourceClasses[] = DataSource.list;
    const options = [{ key: "", label: "" }].concat(list).map(({ key, label }) => {
      return (
        <option key={key} value={key}>
          {label}
        </option>
      );
    });

    return (
      <ModalDialog className="DataSourceForm">
        <table ref={node => (this.formTableElement = node)}>
          <tbody>
            <tr className="is-required">
              <th>Name</th>
              <td>
                <input
                  ref={node => (this.inputNameElement = node)}
                  type="text"
                  defaultValue={this.props.dataSource?.name}
                  name="name"
                  placeholder="My Database"
                />
              </td>
            </tr>
            <tr className="is-required">
              <th>Type</th>
              <td>
                <select value={this.state.selectedType || ""} name="type" onChange={this.handleChangeType}>
                  {options}
                </select>
              </td>
            </tr>
            {this.renderConfig()}
          </tbody>
        </table>

        <div className="DataSourceForm-bottom">
          <div className="DataSourceForm-connectionTest">
            <Button onClick={this.handleConnectionTest}>Connection Test</Button>
            {this.state.connectionTestStatus ? <ProgressIcon status={this.state.connectionTestStatus} /> : null}
            {this.state.connectionTestMessage ? (
              <div className="DataSourceForm-connectionTestMessage">{this.state.connectionTestMessage}</div>
            ) : null}
          </div>
          <div className="DataSourceForm-buttons">
            <Button className="DataSourceForm-cancelBtn" onClick={this.handleCancel}>
              Cancel
            </Button>
            <Button className="DataSourceForm-saveBtn" onClick={this.handleSave}>
              Save
            </Button>
          </div>
        </div>
      </ModalDialog>
    );
  }
}
