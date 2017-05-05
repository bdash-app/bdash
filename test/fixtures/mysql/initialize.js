import { shell } from 'execa';

export default function initialize() {
  return shell(`
mysql -u root -e 'create database if not exists bdash_test';
mysql -u root bdash_test <<EOF
drop table if exists test;
create table test (id int, text varchar(255));
insert into test (id, text) values (1, 'foo'), (2, 'bar'), (3, 'baz');
EOF
  `);
}
