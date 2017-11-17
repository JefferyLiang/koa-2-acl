declare namespace koa2acl {
  function config(configObj?: object, response?: object|string ): any
  module authorize {
    function unless(config?: object): any
  }
}

export = koa2acl
