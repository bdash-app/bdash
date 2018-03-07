import CodeMirror from "codemirror";

declare module "codemirror" {
  namespace Vim {
    function defineAction(action: string, handler: (any) => any): any;
    function _mapCommand(args: any): any;
  }
}
