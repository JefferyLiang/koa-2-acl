# Koa-2-acl

`koa-2-acl`是一个用于控制你koa服务器的访问控制列表中间件。它利用ACL的规则保护你的服务器免受无授权的访问。通过ACL可以控制不同的用户组的访问权限与访问类型。当我们的的资源受到请求的时候，`koa-2-acl`会根据相对应的ACL规则去验证请求者，是否有资格请求对应的资源。

[![NPM version](http://img.shields.io/npm/v/koa-2-acl.svg?style=flat)](https://www.npmjs.com/package/koa-2-acl)
[![NPM Downloads](https://img.shields.io/npm/dm/koa-2-acl.svg?style=flat)](https://www.npmjs.com/package/koa-2-acl)

本中间件是参考[express-acl](https://github.com/nyambati/express-acl)的acl中间件。

我做的只是让`express-acl`能够在 Koa 2 下运行(顺便乱翻译了一个中文版的文档) 。

如果你觉得这个中间件有用，希望能够点个星星。

我会在之后补上测试代码(如果我这个周末有空的话)。

## README LANGUAGE

[English](https://github.com/JefferyLiang/koa-2-acl/blob/master/README.md)

## 什么是ACL规则
ACL是一组由开发者定义的规则，这些规则告诉`koa-2-acl`怎么去处理后台接收到的对于某些特定资源的请求。就想路牌和交通灯一样，控你应用中的数据流向。ACL的规则通常用JSON或者yaml的语法进行定义

**例子**
```json
[{
  "group": "admin",
  "permissions": [{
    "resource": "users",
    "methods": [ "POST", "GET", "PUT" ],
    "action": "allow"
  }]
}]
```

yaml语法

```yaml
- group: user
  permissions:
    - resource: users
      methods:
        - GET
        - POST
        - DELETE
      action: allow
```
关于该文件的内容怎么定义会在后面如何使用中间件的时候详细说明

## 安装

你可以使用NPM包管理工具下载`koa-2-acl`

```bash

$ npm i koa-2-acl -S

```

然后在你的项目之中引入`koa-2-acl`

```js

const acl = require('koa-2-acl')

// ES6

import acl from 'koa-2-acl'

```

或者直接再Github上下载

```

$ git clone https://github.com/JefferyLiang/koa-2-acl.git

```

复制lib文件夹到你的项目之中，然后引入`acl.js`

```js

const acl = require('./lib/acl')

// ES6

import acl from './lib/acl'

```

## 使用

对`koa-2-acl`进行配置，定义用户的访问级别

## 配置
第一步是在项目的根目录下创建`nacl.json`文件。这个文件将定义可以访问我们应用的角色，以及对于这些角色的限制(或授权)访问资源权限的策略。我们看看下面的例子。

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
    "resource": "users",
    "methods": [ "POST", "GET", "PUT" ],
    "action": "deny"
  }]
}]
```

在上面的例子中，我们通过ACL定义了2个角色的授权策略(`user`和`admin`)。有效的ACL是一个由对象(规则)组成的数组。这些规则的属性如下。

属性 | 类型 | 描述信息 |
| --- | --- | ---|
**group** | `string` | 这个属性定义用户属于哪个访问组，这些用户可能是`user`,`guest`,`admin`,`tranier`。怎么去定义这些组，请根据你应用的实际情况进行定义。
**permissions** | `Array` | 这个属性定义了该访问组允许(拒绝)访问的资源和请求方法的对象数组。
**methods** | `string or Array` | 这个属性定义该访问组能够执行的http访问的类型。`["POST","GET","PUT"]`。如果你想访问组可以使用所有的请求方法，可以使用`*`去定义这个属性
**action**  | `string`  | 这个属性告诉`koa-2-acl`对上述定义的资源拥有什么样的权限`allow`(允许访问)或`deny`(拒绝访问)

## 怎么定义高质量的ACL规则

ACL的规则定义了`koa-2-acl`处理请求的方式，因此确保它们有良好的设计是非常重要的，良好的设计能够极大限度的提高效率。有关的详细资料可以点击此[链接](https://github.com/andela-thomas/express-acl/wiki/How-to-write-effective-ACL-rules)。

## 认证
`koa-2-acl`依赖于用户认证，根据用户认证的角色选择对应的访问组去控制请求。因此，你的acl中间件应该在你的用户认证中间件后面。例如使用`jsonwebtoken`中间件。

```js
  // jsonwebtoken powered middleware
  const acl = require('koa-2-acl')
  const jwt = require('jsonwebtoken')
  ROUTER.use((ctx, next) => {
    const token = ctx.request.headers['authorization']
    if (token) {
      // token like this 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhMzljYTZkNzliOWZkYmJjZjM1OGI5MiIsIm5pY2tuYW1lIjoieXBhZG1pbiIsInJvbGUiOiJhZG1pbiIsImNvbXBhbnkiOiI1YTM5YzM5MmE1ZmYyMGI2YWI0MmE1NTkiLCJpYXQiOjE1MTc1NTIyMTYsImV4cCI6MTUxNzU5NTQxNn0.M6IqUvKAmnSMJ0Kb-2UIeUmLrv69Kuhf-zibsWt_uYk'
      let codeStr = token.split(" ")[1]
      jwt.verify(codeStr, key, (err, decoded) => {
        if (err) ctx.throw(err)
        ctx.request.decoded = decoded
      })
    }
    next()
  })

  // koa-2-acl 中间件依赖角色
  // 角色信息可以存放与 ctx.request.decoded(jsonwebtoken) 或 ctx.request.session(koa-session)中 

  ROUTER.use(acl.authorize)
```

## 应用程式接口(API)

在`koa-2-acl`中有2个方法。

### config[type: function, params: config { filename, path, yml, encoding, baseUrl, rules }, response {}]
---

这个方法用读取你的json文件的配置信息。当你不指定任何配置信息时，这个方法会去默认寻找你项目的根目录下的`nacl.json`文件

**config**
- **filename**: 定义你的ACL规则的文件名字
- **path**: 定义你ACL规则文件的所在的位置
- **yml**: 设置是否使用yaml文件定义规则，如果设置为`true`则用yaml解析器解析文件，否则用json解析器解析文件
- **baseUrl**: 设置你的API的基础路径，如: /developer/v1
- **rules**: 允许不通过配置的文件去设置规则
- **defaultRole**: 当我们没有定义角色是，会把用户分配到这个默认的角色
- **decodedObjectName**: 角色字段处于 ctx.request 中的字段名称
- **searchPath**: 当角色不在 ctx.request 对象中的时间，设置用户角色信息的位置

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
  // The default role allows you to specify which role users will assumne if they are not assigned any

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
---

启动这个方法，让`koa-2-acl`根据你设置的ACL规则去管理应用的请求。

```js

app.use(acl.authorize)

```

### unless [type: function, params: function or object]
---

默认情况下，任何没有被定义访问规则的路由都会被阻止，这意味着你不能访问这些路由，直到你为其定义控制规则。我们可以通过这个方法去指定一些路由路径，让它不受保护。更多有关于这个方法的信息可以去看[koa-unless](ttps://github.com/Foxandxss/koa-unless)

```js

  // assuming we want to hide /auth/google from koa-2-acl

  app.use(acl.authorize.unless({ path: ['/auth/google'] }))

```

unless方法将让指定的路由路由不通过我们的中间件，现在我们可以任何情况下访问这个路径。

tips: 你不需要手动去安装`koa-unless`我已经集成到中间件项目之中。

## 返回信息(Response)
当用户请求你特定的资源时，设置你期望客户端返回的信息。这错误的错误状态码为403。

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

## 例子

安装 `koa-2-acl`

```bash

$ npm i koa-2-acl -S

```

在根目录下创建`nacl.json`文件

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

在你的项目路由文件中引入`koa-2-acl`

```js

  const acl = require('koa-2-acl')

  // ES6
  import acl from 'koa-2-acl'

```

使用config方法配置中间件

```js

  acl.config({
    //specify your own baseUrl
    baseUrl: 'api'
  })

```

添加acl中间件在你的应用之中

```js

  app.use(acl.authorize)

```

## 关于代码贡献

欢迎各位对本项目提交自己的Pull requests。如果你想添加或修复BUG，但没有对应的测试代码，那么希望你可以考虑编写测试代码去覆盖你提交的代码。更多的信息可以去看WIKI里面的共享页面---我将会在有空的是写去写这个WIKI。
