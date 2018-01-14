declare module 'immup' {
  class Immup {
    constructor(state: any);
    set(path: string, value: any);
    merge(path: string, value: any);
    append(path: string, value: any);
    del(path: string);
    end();
  }

  function merge(state: any, path: string, value: any);
}
