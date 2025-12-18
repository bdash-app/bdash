import React from "react";
import ModalDialog from "../ModalDialog";
import Button from "../Button";
import DataSource, { DataSourceClasses } from "../../../lib/DataSource";
import ProgressIcon from "../ProgressIcon";
import { ConfigSchemaType } from "../../../lib/DataSourceDefinition/Base";
import { DataSourceKeys, DataSourceType } from "../../pages/DataSource/DataSourceStore";
import DataSourceAction from "../../pages/DataSource/DataSourceAction";

type Props = {
  readonly dataSource: DataSourceType | null;
  readonly onCancel: () => void;
  readonly onSave: (dataSource: { id: number | null } & Pick<DataSourceType, "name" | "type" | "config">) => void;
  readonly validationError?: string | null;
};

const DataSourceForm: React.FC<Props> = ({ dataSource, onCancel, onSave, validationError }) => {
  const [selectedType, setSelectedType] = React.useState<DataSourceKeys | null>(dataSource?.type ?? null);
  const [connectionTestStatus, setConnectionTestStatus] = React.useState<string | null>(null);
  const [connectionTestMessage, setConnectionTestMessage] = React.useState<string | null>(null);
  const formTableElementRef = React.useRef<HTMLTableElement>(null);
  const inputNameElementRef = React.useRef<HTMLInputElement>(null);

  const getConfigValues = React.useCallback((): { [name: string]: any } => {
    const formTableElement = formTableElementRef.current;
    if (!formTableElement) {
      return {};
    }

    // TODO: validation
    const inputs: NodeListOf<HTMLInputElement> = formTableElement.querySelectorAll(
      [
        ".DataSourceForm-configInput",
        ".DataSourceForm-configCheckbox:checked",
        ".DataSourceForm-configRadio:checked",
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
  }, []);

  const validateRequiredFields = React.useCallback((): string | null => {
    const inputNameElement = inputNameElementRef.current;
    if (!inputNameElement?.value.trim()) {
      return "Name is required";
    }
    if (!selectedType) {
      return "Type is required";
    }

    const ds = DataSource.get(selectedType);
    const config = getConfigValues();
    const requiredFields = ds.configSchema.filter((schema) => schema.required);

    for (const field of requiredFields) {
      const value = config[field.name];
      if (value === undefined || value === null || (typeof value === "string" && !value.trim())) {
        return `${field.label} is required`;
      }
    }

    return null;
  }, [getConfigValues, selectedType]);

  const handleSave = React.useCallback((): void => {
    const inputNameElement = inputNameElementRef.current;
    if (inputNameElement === null || selectedType === null) {
      return;
    }

    const validationError = validateRequiredFields();
    if (validationError) {
      // Dispatch validation error to store
      DataSourceAction.setValidationError(validationError);
      return;
    }

    const id = dataSource ? dataSource.id : null;
    const name = inputNameElement.value;
    const type = selectedType;
    const config = getConfigValues();
    onSave({ id, name, type, config });
  }, [dataSource, getConfigValues, onSave, selectedType, validateRequiredFields]);

  const handleCancel = onCancel;

  const handleChangeType = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedType(e.target.value as DataSourceKeys);
  }, []);

  const handleConnectionTest = React.useCallback(async (): Promise<void> => {
    const type = selectedType;
    if (!type) {
      return;
    }
    const config = getConfigValues();
    setConnectionTestStatus("working");
    setConnectionTestMessage(null);

    try {
      await DataSource.create({ type, config }).connectionTest();
    } catch (err) {
      setConnectionTestStatus("failure");
      setConnectionTestMessage(err.message);
      return;
    }

    setConnectionTestStatus("success");
  }, [getConfigValues, selectedType]);

  const renderConfigCheckbox = (i: number, value: boolean, schema: ConfigSchemaType): React.ReactNode => {
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
  };

  const renderConfigRadio = (i: number, value: string, schema: ConfigSchemaType): React.ReactNode => {
    const radios = schema.values!.map((v) => {
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
  };

  const renderConfigInput = (i: number, value: string, schema: ConfigSchemaType): React.ReactNode => {
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
  };

  const renderConfig = (): React.ReactNode[] | null => {
    const ds = selectedType ? DataSource.get(selectedType) : undefined;
    if (!ds || ds.configSchema.length === 0) return null;

    return ds.configSchema.map((schema: ConfigSchemaType, i: number) => {
      const config = dataSource?.config || {};
      const value = config[schema.name];
      switch (schema.type) {
        case "radio":
          return renderConfigRadio(i, value, schema);
        case "checkbox":
          return renderConfigCheckbox(i, value, schema);
        default:
          return renderConfigInput(i, value, schema);
      }
    });
  };

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
      <table ref={formTableElementRef}>
        <tbody>
          <tr className="is-required">
            <th>Name</th>
            <td>
              <input
                ref={inputNameElementRef}
                type="text"
                defaultValue={dataSource?.name}
                name="name"
                placeholder="My Database"
              />
            </td>
          </tr>
          <tr className="is-required">
            <th>Type</th>
            <td>
              <select value={selectedType || ""} name="type" onChange={handleChangeType}>
                {options}
              </select>
            </td>
          </tr>
          {renderConfig()}
        </tbody>
      </table>

      <div className="DataSourceForm-bottom">
        <div className="DataSourceForm-connectionTest">
          <Button onClick={handleConnectionTest}>Connection Test</Button>
          {connectionTestStatus ? <ProgressIcon status={connectionTestStatus} /> : null}
          {connectionTestMessage ? (
            <div className="DataSourceForm-connectionTestMessage">{connectionTestMessage}</div>
          ) : null}
        </div>
        {validationError ? <div className="DataSourceForm-validationError">{validationError}</div> : null}
        <div className="DataSourceForm-buttons">
          <Button className="DataSourceForm-cancelBtn" onClick={handleCancel}>
            Cancel
          </Button>
          <Button className="DataSourceForm-saveBtn" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </ModalDialog>
  );
};

export default DataSourceForm;
