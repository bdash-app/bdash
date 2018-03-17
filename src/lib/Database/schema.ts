const schema = `
create table if not exists data_sources (
  id integer primary key autoincrement,
  name text not null,
  type text not null,
  config json not null,
  createdAt datetime not null,
  updatedAt datetime not null
);

create table if not exists queries (
  id integer primary key autoincrement,
  dataSourceId integer not null references data_sources(id),
  title text not null,
  body text not null default '',
  runtime integer,
  status text check(status in ('success', 'failure')),
  fields json,
  rows json,
  errorMessage text,
  runAt datetime,
  createdAt datetime not null,
  updatedAt datetime not null
);

create table if not exists charts (
  id integer primary key autoincrement,
  queryId integer not null references queries(id) on delete cascade,
  type text not null,
  xColumn text,
  yColumns json,
  groupColumn text,
  stacking boolean not null default 0,
  createdAt datetime not null,
  updatedAt datetime not null
);
create index if not exists idx_query_id_on_charts on charts(queryId);
`;

export default schema;
