import assert from "assert";
import Databricks from "../../../../src/lib/DataSourceDefinition/Databricks";

suite("DataSourceDefinition/Databricks", () => {
  const config = {
    serverHostname: "test-workspace.databricks.com",
    httpPath: "/sql/1.0/warehouses/abc123def456",
    personalAccessToken: "test-token",
    catalog: "main",
    schema: "default",
  };

  test("key", () => {
    assert.strictEqual(Databricks.key, "databricks");
  });

  test("label", () => {
    assert.strictEqual(Databricks.label, "Databricks");
  });

  test("formatType", () => {
    assert.strictEqual(Databricks.formatType, "sql");
  });

  test("configSchema", () => {
    const schema = Databricks.configSchema;
    assert.strictEqual(schema.length, 5);

    const serverHostnameField = schema.find((s) => s.name === "serverHostname");
    assert.ok(serverHostnameField);
    assert.strictEqual(serverHostnameField.required, true);
    assert.strictEqual(serverHostnameField.type, "string");

    const httpPathField = schema.find((s) => s.name === "httpPath");
    assert.ok(httpPathField);
    assert.strictEqual(httpPathField.required, true);
    assert.strictEqual(httpPathField.type, "string");

    const tokenField = schema.find((s) => s.name === "personalAccessToken");
    assert.ok(tokenField);
    assert.strictEqual(tokenField.required, true);
    assert.strictEqual(tokenField.type, "password");

    const catalogField = schema.find((s) => s.name === "catalog");
    assert.ok(catalogField);
    assert.strictEqual(catalogField.default, "main");

    const schemaField = schema.find((s) => s.name === "schema");
    assert.ok(schemaField);
    assert.strictEqual(schemaField.default, "default");
  });

  test("constructor", () => {
    const databricks = new Databricks(config);
    assert.strictEqual(databricks.config, config);
  });

  test("dataSourceInfo", () => {
    const databricks = new Databricks(config);
    const info = databricks.dataSourceInfo();

    assert.strictEqual(info.type, "Databricks");
    assert.strictEqual(info.serverHostname, "test-workspace.databricks.com");
    assert.strictEqual(info.httpPath, "/sql/1.0/warehouses/abc123def456");
    assert.strictEqual(info.catalog, "main");
    assert.strictEqual(info.schema, "default");
  });

  test("infoMdTable", () => {
    const databricks = new Databricks(config);
    const mdTable = databricks.infoMdTable();

    assert.ok(mdTable.includes("|type|Databricks|"));
    assert.ok(mdTable.includes("|serverHostname|test-workspace.databricks.com|"));
    assert.ok(mdTable.includes("|catalog|main|"));
  });

  test("extractWarehouseId from httpPath", () => {
    const databricks = new Databricks(config);
    // Private method test via reflection
    const extractWarehouseId = (databricks as any).extractWarehouseId.bind(databricks);

    assert.strictEqual(extractWarehouseId(), "abc123def456");
  });

  test("extractWarehouseId throws error for invalid httpPath", () => {
    const invalidConfig = { ...config, httpPath: "/invalid/path" };
    const databricks = new Databricks(invalidConfig);
    const extractWarehouseId = (databricks as any).extractWarehouseId.bind(databricks);

    assert.throws(() => {
      extractWarehouseId();
    }, /Could not extract warehouse ID from HTTP path/);
  });
});
