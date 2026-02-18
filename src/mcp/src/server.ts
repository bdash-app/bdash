#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { BdashDatabase } from "./database.js";
import { SchemaFetcher } from "./schema-fetcher.js";
import { listDatasources } from "./tools/list-datasources.js";
import { listQueries } from "./tools/list-queries.js";
import { getQuery } from "./tools/get-query.js";
import { writeQuery } from "./tools/write-query.js";
import { createQuery } from "./tools/create-query.js";
import { listTables } from "./tools/list-tables.js";
import { getTableSchema } from "./tools/get-table-schema.js";

const server = new Server(
  {
    name: "bdash-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

const db = new BdashDatabase();

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "list_datasources",
        description: "List all configured data sources in Bdash",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "list_queries",
        description: "List all saved queries in Bdash",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_query",
        description: "Get details of a specific query by ID",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "number", description: "Query ID" },
          },
          required: ["id"],
        },
      },
      {
        name: "write_query",
        description: "Write SQL to a query's editor (replaces the entire body)",
        inputSchema: {
          type: "object",
          properties: {
            id: { type: "number", description: "Query ID" },
            body: { type: "string", description: "New SQL body" },
          },
          required: ["id", "body"],
        },
      },
      {
        name: "create_query",
        description: "Create a new query",
        inputSchema: {
          type: "object",
          properties: {
            dataSourceId: { type: "number", description: "Data source ID" },
            title: { type: "string", description: "Query title (default: 'New Query')" },
            body: { type: "string", description: "Initial SQL body (default: empty)" },
          },
          required: ["dataSourceId"],
        },
      },
      {
        name: "list_tables",
        description: "List tables for a specific data source",
        inputSchema: {
          type: "object",
          properties: {
            dataSourceId: { type: "number", description: "Data source ID" },
          },
          required: ["dataSourceId"],
        },
      },
      {
        name: "get_table_schema",
        description: "Get column definitions for a specific table",
        inputSchema: {
          type: "object",
          properties: {
            dataSourceId: { type: "number", description: "Data source ID" },
            table: { type: "string", description: "Table name (use 'schema.table' for PostgreSQL)" },
          },
          required: ["dataSourceId", "table"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const toolArgs = args || {};

  switch (name) {
    case "list_datasources":
      return await listDatasources(db);
    case "list_queries":
      return await listQueries(db);
    case "get_query":
      return await getQuery(db, toolArgs);
    case "write_query":
      return await writeQuery(db, toolArgs);
    case "create_query":
      return await createQuery(db, toolArgs);
    case "list_tables":
      return await listTables(db, toolArgs);
    case "get_table_schema":
      return await getTableSchema(db, toolArgs);
    default:
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }
});

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  try {
    const dataSources = await db.getAllDataSources();

    const resources = [
      {
        uri: "bdash://datasources",
        name: "Data Sources",
        description: "List of all configured data sources in Bdash",
        mimeType: "application/json",
      },
    ];

    for (const ds of dataSources) {
      resources.push({
        uri: `bdash://datasource/${ds.id}/tables`,
        name: `${ds.name} - Tables`,
        description: `List of tables in ${ds.name} (${ds.type})`,
        mimeType: "application/json",
      });
    }

    return { resources };
  } catch (error) {
    console.error("Error listing resources:", error);
    return { resources: [] };
  }
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  try {
    // Data sources list
    if (uri === "bdash://datasources") {
      const dataSources = await db.getAllDataSources();
      const summary = dataSources.map((ds) => ({
        id: ds.id,
        name: ds.name,
        type: ds.type,
      }));

      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(summary, null, 2),
          },
        ],
      };
    }

    // Tables for a specific data source
    const tablesMatch = uri.match(/^bdash:\/\/datasource\/(\d+)\/tables$/);
    if (tablesMatch) {
      const dataSourceId = parseInt(tablesMatch[1], 10);
      const dataSource = await db.getDataSource(dataSourceId);

      if (!dataSource) {
        throw new Error(`Data source ${dataSourceId} not found`);
      }

      const fetcher = SchemaFetcher.create(dataSource);
      const tables = await fetcher.fetchTables();

      return {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: JSON.stringify(tables, null, 2),
          },
        ],
      };
    }

    // Schema for a specific table
    const schemaMatch = uri.match(/^bdash:\/\/datasource\/(\d+)\/table\/(.+)\/schema$/);
    if (schemaMatch) {
      const dataSourceId = parseInt(schemaMatch[1], 10);
      const tableIdentifier = decodeURIComponent(schemaMatch[2]);

      const dataSource = await db.getDataSource(dataSourceId);
      if (!dataSource) {
        throw new Error(`Data source ${dataSourceId} not found`);
      }

      const fetcher = SchemaFetcher.create(dataSource);

      const parts = tableIdentifier.split(".");
      const tableInfo = parts.length === 2 ? { schema: parts[0], name: parts[1] } : { name: tableIdentifier };

      const summary = await fetcher.fetchTableSummary(tableInfo);

      let schemaText = `Table: ${summary.schema ? summary.schema + "." : ""}${summary.name}\n\n`;
      schemaText += "Columns:\n";

      if (summary.defs.rows.length > 0) {
        const header = summary.defs.fields.join(" | ");
        const separator = summary.defs.fields.map(() => "---").join(" | ");
        schemaText += header + "\n";
        schemaText += separator + "\n";

        summary.defs.rows.forEach((row) => {
          schemaText += row.map((cell) => cell ?? "NULL").join(" | ") + "\n";
        });
      } else {
        schemaText += "No schema information available\n";
      }

      return {
        contents: [
          {
            uri,
            mimeType: "text/plain",
            text: schemaText,
          },
        ],
      };
    }

    throw new Error(`Unknown resource: ${uri}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read resource ${uri}: ${errorMessage}`);
  }
});

async function main() {
  try {
    await db.initialize();
    console.error("Bdash MCP Server initialized successfully");

    const transport = new StdioServerTransport();
    await server.connect(transport);

    console.error("Bdash MCP Server running on stdio");
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();
