import { shell } from "execa";
import DataSourceConfig from "../../helpers/DataSourceConfig";

const config = DataSourceConfig.postgres;

export default function initialize(): any {
  return shell(`
dropdb -U ${config.user} -h ${config.host} ${config.database};
createdb -U ${config.user} -h ${config.host} ${config.database};
psql -U ${config.user} -h ${config.host} ${config.database} <<EOF
create table test (id int, text varchar(255));
insert into test (id, text) values (1, 'foo'), (2, 'bar'), (3, 'baz');
EOF
  `);
}
