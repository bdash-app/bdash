import { shell } from "execa";

export default function initialize() {
  return shell(`
dropdb bdash_test;
createdb bdash_test;
psql bdash_test <<EOF
create table test (id int, text varchar(255));
insert into test (id, text) values (1, 'foo'), (2, 'bar'), (3, 'baz');
EOF
  `);
}
