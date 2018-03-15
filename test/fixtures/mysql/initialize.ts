import { shell } from "execa";
import DataSourceConfig from "../../helpers/DataSourceConfig";

const config = DataSourceConfig.mysql;

export default function initialize() {
  return shell(`
mysql -u ${config.user} -h ${config.host} -e 'create database if not exists ${config.database}';
mysql -u ${config.user} -h ${config.host}  ${config.database} <<EOF
drop table if exists test;
create table test (id int, text varchar(255));
insert into test (id, text) values (1, 'foo'), (2, 'bar'), (3, 'baz');
EOF
  `);
}
