create table data_sources (
  id integer primary key autoincrement,
  title text not null,
  type text not null,
  config json not null,
  created_at datetime not null,
  updated_at datetime not null
);

create table queries (
  id integer primary key autoincrement,
  data_source_id integer not null references data_sources(id),
  title text not null,
  query text not null,
  runtime integer,
  status text check(status in ('success', 'failure')),
  fields json,
  rows json,
  error_message text,
  run_at datetime not null,
  created_at datetime not null,
  updated_at datetime not null
);

create table charts (
  id integer primary key autoincrement,
  query_id integer not null references queries(id) on delete cascade,
  type text not null,
  x_column text not null,
  y_columns json not null,
  group_column text,
  stacking boolean not null default 0,
  created_at datetime not null,
  updated_at datetime not null
);
create index idx_query_id_on_charts on charts(query_id);
