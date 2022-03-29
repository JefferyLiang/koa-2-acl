const unless = require('koa-unless')

const {
  readConfigFile,
  mapPolicyToGroup,
  findRoleFromRequest,
  findPermissionForRoute,
  checkIfHasAccess,
  deny
} = require('./common')

let options = {
  path: '.',
  filename: 'nacl.json',
  policies: new Map(),
  defaultRole: 'guest',
  multipleRolePropertyName: 'id'
}

function config (config, response) {
  options = Object.assign({}, options, config, { response })

  if (config && config.rules) {
    options.policies = mapPolicyToGroup(config.rules)
  } else {
    let filePath = (options.filename && options.path)
      ? `${options.path}/${options.filename}`
      : options.filename
    
      options.policies = mapPolicyToGroup(readConfigFile(filePath))
  }

  if (!options.policies.size) {
    return `\u001b[33mWARNING: You have not set any policies, All traffic will be denied\u001b[39m`
  }
  return options.policies
}

/**
 * [authorize Koa middleware]
 * @param {[type]} ctx    [The Koa ctx]
 * @param {Function} next [description]
 * @return {[type]}       [description]
 */
function authorize (ctx, next) {
  const role = findRoleFromRequest(
    ctx,
    options.roleSearchPath,
    options.defaultRole,
    options.decodedObjectName
  )

  if (ctx.request.originalUrl === '/') return next()

  let policies

  if (typeof role == 'object') {
    policies = role.map((r) => {
      return options.policies.get(r[options.multipleRolePropertyName]);
    })
  } else {
    policies = options.policies.get(role)
  }

  if (!policies) {
    ctx.status = 403
    ctx.body = {
      status: 'Access denied',
      success: false,
      message: `REQUIRED: Policy for role ${role} is not defined`
    }
    return
  }

  let permissions
  
  if (typeof role == 'object') {
    permissions = policies.map((policy) => {
      return findPermissionForRoute(
        ctx.request.originalUrl,
        ctx.request.method,
        options.baseUrl,
        policy
      )
    })
  } else {
    permissions = findPermissionForRoute(
      ctx.request.originalUrl,
      ctx.request.method,
      options.baseUrl,
      policies
    )
  }
  
  if (!permissions) {
    return ctx.throw(401, deny(options.customMessage, options.response))
  }

  return checkIfHasAccess(
    ctx.method,
    ctx,
    next,
    permissions,
    options.customMessage,
    options.response
  )
}

authorize.unless = unless

module.exports = {
  config,
  authorize
}
