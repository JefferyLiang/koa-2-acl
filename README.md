# koa-2-acl

Koa 2 Access Control Lists (koa-2-acl) enable you to manage the requests made to your koa server. It makes use of ACL rules to protect your server from unauthorized access. ACLs defines which user groups are granted access and the type of access they have against a specified resource. When a request is received against a resource. `koa-2-acl` checks the corresponding ACL policy to verify if the requester has the necessary access permissions.

[![NPM version](http://img.shields.io/npm/v/koa-2-acl.svg?style=flat)](https://www.npmjs.com/package/koa-2-acl)
[![NPM Downloads](https://img.shields.io/npm/dm/koa-2-acl.svg?style=flat)](https://www.npmjs.com/package/koa-2-acl)

This project refers to [express-acl](https://github.com/nyambati/express-acl) project

I just make the `express-acl` can run in koa 2.

If this middleware is useful to you and you want, you can star it.

## README LANGUAGE

[中文文档](https://github.com/JefferyLiang/koa-2-acl/blob/master/doc/README.zh.md)

## What are ACL rules
ACL is a set of rules that tell `koa-2-acl` how to handle the request made to your server a specific resource. Think of like road signs or traffic lights that control how your traffic flows in your app. ACL rules are defined in JSON or yaml syntax.

### Important

Resource property has been changed from using string to routes, this change was made to support `subrouting` functionality, this means if your resource was `users` which gave access to all routes starting with `users`, it should be changed to `users/*`. The asterisk informs the package to match all the routes that start with `users`.

The Resource property also can include params i.e `/users/:id` this will match routes such as `users/45`, `users/42`, where 42 and 45 are considered `:id` section on the resource.

**Example**
```json
[{  
  "group": "admin",
  "permissions": [{
    "resource": "users/*",
    "methods": [ "POST", "GET", "PUT" ],
    "action": "allow"
  }]
}]
```

YAML syntax

```yaml
- group: user
  permissions:
    - resource: users/*
      methods:
        - GET
        - POST
        - DELETE
      action: allow
```

The contents of this file will be discussed in the usage section

## Installation

You can download `koa-2-acl` from NPM
```bash

$ npm i koa-2-acl -S

```

then in your project require `koa-2-acl`

```js

const acl = require('koa-2-acl')

// ES6

import acl from 'koa-2-acl'

```

or GitHub

```

$ git clone https://github.com/JefferyLiang/koa-2-acl.git

```

copy the lib folder to your project and then require `acl.js`

```js

const acl = require('./lib')

// ES6

import acl from './lib/acl'

```

## Usage

Koa acl uses the configuration approach to define access levels.

## Configuration

The first step is to create a file called `nacl.json` and place this in the root folder. This is the file where we will define the roles that can access our application and the policies that restrict or give access to a certain resource. Take a look at the example below.

```json
[{
  "group": "admin",
  "permissions": [{
    "resource": "*",
    "methods": "*"
  }],
  "action": "allow"
}, {
  "group": "user",
  "permissions": [{
    "resource": "users/*",
    "methods": [ "POST", "GET", "PUT" ],
    "action": "deny"
  }]
}]
```

In the example above we have defined an ACL with two policies with roles, `user` and `admin`. A valid ACL should be an Array of objects(policies). The properties of the policies are explained below.

Property | Type | Description
| --- | --- | --- |
**group** | `string` | This property defines the access group to which a user can belong to e.g `user`,`guest`,`admin`,`tranier`. This may vary depending on the architecture of your application.
**permissions** | `Array` | This property contains an array of objects that define the resource exposed to a group and the methods allowed/denied.
*resource* | `String` | This is the route the permissions will be applied against. This property can be either `*` which applies to all routes, `api/users` which will apply permissions to routes `api/users` or `api/users/*` which applies permission to all routes that prefix `api/users`
**methods** | `string or Array` | This are http methods that a user is allowed or denied from executing. `[ "POST", "GET", "PUT" ]`. Use  glob `*` if you want to include all http methods.
**action**  | `string`  | This property tell koa-2-acl what action to perform on the permission given. Using the above example, the user policy specifies a deny action, meaning all traffic on route `/api/users` for methods `GET, PUT, POST` is denied, but the rest allowed. And for the admin, all traffic for all resource is allowed.
subRoutes | `Array` | This is permissions that should be used on subroutes of a specified prefix. It is helpful when certain routes under a prefix require different access definitions.

## How to define effective ACL rules
ACLs define the way requests will be handled by koa-2-acl, therefore its important to ensure that they are well designed to maximise efficiency. For more details follow this [link](https://github.com/andela-thomas/express-acl/wiki/How-to-write-effective-ACL-rules)

## Authentication
koa-2-acl depends on the role of each authenticated user to pick the corresponding ACL policy for each defined user groups. Therefore, you should always place the acl middleware after the authenticate middleware. Example using jsonwebtoken middleware.

```js
  // jsonwebtoken powered middleware
  const acl = require('koa-2-acl')
  const jwt = require('jsonwebtoken')
  ROUTER.use((ctx, next) => {
    // token like this 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhMzljYTZkNzliOWZkYmJjZjM1OGI5MiIsIm5pY2tuYW1lIjoieXBhZG1pbiIsInJvbGUiOiJhZG1pbiIsImNvbXBhbnkiOiI1YTM5YzM5MmE1ZmYyMGI2YWI0MmE1NTkiLCJpYXQiOjE1MTc1NTIyMTYsImV4cCI6MTUxNzU5NTQxNn0.M6IqUvKAmnSMJ0Kb-2UIeUmLrv69Kuhf-zibsWt_uYk'
    const token = ctx.request.headers['authorization']
    if (token) {
      let codeStr = token.split(" ")[1]
      jwt.verify(codeStr, key, (err, decoded) => {
        if (err) ctx.throw(err)
        ctx.request.decoded = decoded
      })
    }
    next()
  })

  // koa-2-acl middleware depends on the role
  // the role can either be in ctx.request.decoded (jsonwebtoken) or ctx.request.session (koa-session)

  ROUTER.use(acl.authorize)
```

## API
There are two API methods for koa-2-acl.

### config[type: function, params: config { filename<string>, path<string>, yml<boolean>, encoding, baseUrl, rules }, response {}]

This method loads the configuration json file. When this method it looks for `nacl.json` the root folder if path parameter is not specified.

**config**
- **filename**: Name of the ACL rule file e.g nacl.json
- **path**: Location of the ACL rule file
- **yml**: when set to true means use yaml parser else JSON parser
- **baseUrl**: The base url of your API e.g /developer/v1
- **rules**: Allows you to set rules directly without using config file
- **defaultRole**: The  default role to be assigned to users if they have no role defined
- **decodedObjectName**: The name of the object in the ctx.request where the role resides.
- **searchPath**: The path in which to look for the role within the ctx.request object

```js

  const acl = require('koa-2-acl')

  // path not speificed
  // looks for config.json in the root folder
  // if your backend routes have base url prefix e.g /api/<resource>, v1/<resource>, developer/v1/<resource>
  // specify it in the config property baseUrl { baseUrl: 'api' }, { baseUrl: 'v1' }, { baseUrl: 'developer/v1' } respectively
  // else you can specify { baseUrl: '/' } or ignore it entirely

  acl.config({
    baseUrl: 'api'
  })

  // path specified
  // looks for acl.json in the root folder

  acl.config({
    filename: 'acl.json',
    path: 'config'
  })

  // When specifying path you can also rename the json file e.g
  // The above file can be acl.json or nacl.json or any_file_name.json

  acl.config({
    rules: rulesArray
  })

  // When you use rules api, nacl will **not** to find the json/yaml file, so you can save your acl-rules with any Database
  // The default role allows you to specify which role users will assume if they are not assigned any

  acl.config({
    defaultRole: 'anonymous'
  })

  // By default this module will look for role in decoded object, if you would like to change the name of the object, you can specify this with decodedObjectName property.
  
  // As per the example below, this module will look for ctx.request.user.role as compared to default ctx.request.decoded.role.

  acl.config({
    decodedObjectName: 'user'
  })

  // You can also specify a deep path in which to look for the role, in case it's not inside the usual locations

  acl.config({
    searchPath: 'user.Role.name' // will search for role in ctx.request.user.Role.name
  })

```

### authorize [type: middleware]
This is the middleware that manages your application requests based on the role and acl rules.

```js

app.use(acl.authorize)

```

### unless [type: function, params: function or object]
By default any route that has no defined policy against it is blocked, this means you cannot access this route until you specify a policy. This method enables you to exclude unprotected routes. This method users koa-2-acl package to achieve this functionality. For more details on its usage follow this link [koa-unless](https://github.com/Foxandxss/koa-unless)

```js

  // assuming we want to hide /auth/google from koa-2-acl

  app.use(acl.authorize.unless({ path: ['/auth/google'] }))

```

Anytime that this route is visited, unless method will exclude it from being passed though our middleware.

**N/B** You don't have to install `koa-unless` it has already been included into the project.

## Response
This is the custom error you would like returned when a user is defined access to a resource. This error will be bound to the status code of `403`

```js

  const acl = require('koa-2-acl')

  let configObject = {
    filename: 'acl.json',
    path: 'config'
  }

  let responseObject = {
    status: 'Access Denied',
    message: 'You are not authorized to access this resource'
  }

  acl.config(configObject, responseObject)

```

## Example

Install koa-2-acl

```bash

$ npm i koa-2-acl -S

```

Create `nacl.json` in your root folder

```json
[{
  "group": "user",
  "permissions": [{
    "resource": "users",
    "methods": [
      "POST",
      "GET",
      "PUT"
    ],
  "action": "allow"
  }]
}]
```

Require koa-2-acl in your project router file.

```js

  const acl = require('koa-2-acl')

  // ES6
  import acl from 'koa-2-acl'

```

Call the config method

```js

  acl.config({
    //specify your own baseUrl
    baseUrl: 'api'
  })

```

Add the acl middleware

```js

  app.use(acl.authorize)

```

## Contributions
Pull requests are welcome. If you are adding a new feature or fixing an as-yet-untested use case, please consider writing unit test to cover your change(s).
