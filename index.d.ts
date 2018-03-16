declare namespace koa2acl {
  
  function config (configObj: configObject, response: string | object) : any
  module authorize {
    function unless(config ?: object) : any
  }
}

export = koa2acl

declare class configObject {
  baseUrl ?: string
  decodedObjectName ?: string
  defaultRole ?: string
  searchPath ?: string
  rules ?: Array
  yml ?: Boolean
  filename ?: string
  path ?: string
}