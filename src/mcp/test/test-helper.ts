import sqlite3 from "sqlite3";
import path from "path";
import os from "os";
import fs from "fs";
import { BdashDatabase } from "../src/database.js";

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS data_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config TEXT DEFAULT '{}',
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS queries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dataSourceId INTEGER REFERENCES data_sources(id),
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  runtime INTEGER,
  status TEXT CHECK(status IN ('success', 'failure')),
  fields JSON,
  rows JSON,
  errorMessage TEXT,
  runAt DATETIME,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  codeMirrorHistory JSON,
  bdashServerQueryId TEXT
);
`;

export function createTestDbPath(): string {
  const tmpDir = os.tmpdir();
  return path.join(tmpDir, `bdash-test-${Date.now()}-${Math.random().toString(36).slice(2)}.sqlite3`);
}

export async function setupTestDb(dbPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
      db.exec(SCHEMA_SQL, (execErr) => {
        if (execErr) {
          db.close();
          return reject(execErr);
        }
        db.close((closeErr) => {
          if (closeErr) return reject(closeErr);
          resolve();
        });
      });
    });
  });
}

export async function seedDataSource(
  dbPath: string,
  params: { name: string; type: string; config?: any }
): Promise<number> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
      const sql = `INSERT INTO data_sources (name, type, config, createdAt, updatedAt) VALUES (?, ?, ?, datetime('now'), datetime('now'))`;
      db.run(sql, [params.name, params.type, JSON.stringify(params.config || {})], function (runErr) {
        if (runErr) {
          db.close();
          return reject(runErr);
        }
        const id = this.lastID;
        db.close((closeErr) => {
          if (closeErr) return reject(closeErr);
          resolve(id);
        });
      });
    });
  });
}

export async function seedQuery(
  dbPath: string,
  params: { dataSourceId: number; title: string; body: string }
): Promise<number> {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) return reject(err);
      const sql = `INSERT INTO queries (dataSourceId, title, body, createdAt, updatedAt) VALUES (?, ?, ?, datetime('now'), datetime('now'))`;
      db.run(sql, [params.dataSourceId, params.title, params.body], function (runErr) {
        if (runErr) {
          db.close();
          return reject(runErr);
        }
        const id = this.lastID;
        db.close((closeErr) => {
          if (closeErr) return reject(closeErr);
          resolve(id);
        });
      });
    });
  });
}

export async function createTestDatabase(dbPath: string): Promise<BdashDatabase> {
  await setupTestDb(dbPath);
  const database = new BdashDatabase(dbPath);
  await database.initialize();
  return database;
}

export function cleanupTestDb(dbPath: string): void {
  try {
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
    if (fs.existsSync(dbPath + "-wal")) fs.unlinkSync(dbPath + "-wal");
    if (fs.existsSync(dbPath + "-shm")) fs.unlinkSync(dbPath + "-shm");
  } catch {
    // ignore cleanup errors
  }
}
