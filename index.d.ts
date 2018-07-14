interface configOption {
  baseUrl: string;
  filename?: string;
  path?: string;
  rules?: any;
  defaultRole?: string;
  decodedObjectName?: string;
  roleSearchPath?: string;
}

interface unlessOption {
  path?: Array<string | RegExp>;
}

declare module "koa-2-acl" {
  export function config(config: configOption, response?: object | string): void;

  export function authorize(ctx: any, next: any): void;

  namespace authorize {
    function unless(config: unlessOption);
  }
}
