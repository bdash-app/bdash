const sqlite3 = require('sqlite3');
let db = new sqlite3.Database(process.env.HOME + '/.bdash/bdash.sqlite3');

function values(obj) {
  return Object.keys(obj).map(k => obj[k]);
}

db.each('select id, fields, rows from queries', (err, row) => {
  if (err) throw err;
  if (!row.fields) return;

  let fields = JSON.parse(row.fields);
  let rows = JSON.parse(row.rows);
  if (fields.length === 0 || typeof fields[0] === 'string') return;

  let newFields = JSON.stringify(fields.map(field => field.name));
  let newRows = JSON.stringify(rows.map(row => values(row)));
  db.prepare('update queries set fields = ?, rows = ? where id = ?').run(newFields, newRows, row.id);
});
