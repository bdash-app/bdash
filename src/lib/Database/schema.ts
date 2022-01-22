export type Migration = {
  readonly version: number;
  readonly query: string;
};

export const migrations: Migration[] = [
  {
    version: 1,
    query: `
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
    `,
  },
  {
    version: 2,
    query: `alter table queries add column codeMirrorHistory json`,
  },
  {
    version: 3,
    query: `
      create table charts_backup (
        id integer primary key autoincrement,
        queryId integer not null references queries(id) on delete cascade,
        type text not null,
        xColumn text,
        yColumns json,
        groupColumns json,
        stacking boolean not null default 0,
        createdAt datetime not null,
        updatedAt datetime not null
      );

      insert into charts_backup select
        id, queryId, type, xColumn, yColumns, (case when groupColumn is null then null else json_array(groupColumn) end), stacking, createdAt, updatedAt
      from charts;

      drop table charts;
      alter table charts_backup rename to charts;
      create index if not exists idx_query_id_on_charts on charts(queryId);
    `,
  },
];
