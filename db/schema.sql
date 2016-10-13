pragma foreign_keys = on;

create table data_source_types (
  type text primary key not null,
  seq integer not null unique
);

create table data_sources (
  id integer primary key autoincrement,
  title text not null,
  type text not null references data_source_types(type) on update cascade,
  config json not null,
  created_at datetime not null,
  updated_at datetime not null
);

create table queries (
  id integer primary key autoincrement,
  data_source_id integer not null references data_sources(id) on delete cascade,
  title text not null,
  sql text not null,
  created_at datetime not null,
  updated_at datetime not null
);

create table query_results (
  id integer primary key autoincrement,
  query_id integer not null references queries(id) on delete cascade,
  sql text not null,
  runtime integer not null,
  run_at datetime not null,
  status text not null check(status in ('success', 'failure')),
  fields json,
  rows json,
  error_message text
);

create table chart_types (
  type text primary key not null,
  seq integer not null unique
);

create table charts (
  id integer primary key autoincrement,
  query_id integer not null references queries(id) on delete cascade,
  type text not null references chart_types(type) on update cascade,
  x_column text not null,
  y_columns json not null,
  group_column text,
  stacking boolean not null default 0,
  created_at datetime not null,
  updated_at datetime not null
);
