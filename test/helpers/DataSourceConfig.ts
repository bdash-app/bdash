export default {
  mysql: {
    host: process.env["MYSQL_HOST"] || "127.0.0.1",
    user: process.env["MYSQL_USER"] || "root",
    database: "bdash_test",
  },
  postgres: {
    host: process.env["POSTGRES_HOST"] || "127.0.0.1",
    user: process.env["POSTGRES_USER"] || process.env["USER"],
    database: "bdash_test",
  },
};
