declare module "immup" {
  class Immup<State extends { [key: string]: any } | Array<any>> {
    constructor(state: State);
    set(path: string, value: any): this;
    merge(path: string, value: any): this;
    append(path: string, value: any): this;
    del(path: string): this;
    prepend(path: string, value: any): this;
    end(): State;
  }

  function merge(state: any, path: string | null, value: any);
}
