/**
 * nacl
 * copyright(c) 2017-2010 
 * MIT Lincensed
 */

'use strict'
const _ = require('lodash')
const utils = require('./utils')
const helper = require('./helpers')
const unless = require('koa-unless')

let opt = {}

/**
 * [config Loads the rules from our config file]
 * @param {[options]} options [defines where the
 * config file is located, and the encoding type]
 */
function config (config, response) {
  let options = config || {}
  let yml = options.yml || false
  opt.response = response
  opt.baseUrl = options.baseUrl
  opt.decodedObjectName = options.decodedObjectName
  opt.defaultRole = options.defaultRole || 'guest'
  opt.searchPath = options.searchPath || undefined

  if (options.rules) {
    opt.rules = utils.validate(options.rules)
  }

  /**
   * Get the filename
   */

  let defaultFilename = yml ? 'nacl.yml' : 'nacl.json'
  let filename = options.filename ? options.filename : defaultFilename

  /**
   * Merge filename and path
   */

  let path = filename && options.path ? (`${options.path}/${filename}`) : filename

  opt.rules = helper.getRules(path, options.encoding, yml)

  return opt.rules
}

/**
 * [authorize Koa middleware]
 * @param {[type]} ctx    [The Koa Context object]
 * @param {Function} next [description]
 * @return {[type]}        [description]
 */

function authorize (ctx, next) {
  let method = ctx.request.method
  let resource = helper.resource(next, ctx.request.originalUrl, opt.baseUrl)
  /**
   * if not resource terminate script
   */
  if (!resource || !_.isString(resource)) return

  /**
   * [group description]
   * @type {[type]}
   */

  let role = helper.getRole(ctx, opt.decodedObjectName, opt.defaultRole, opt.searchPath)

  /**
   * if no role or role not provided as string
   */
  if (!_.isString(role) || !role) {
    return utils.deny(ctx, 404, 'REQUIRED: Role should be provided as a string', null)
  }

  /**
   * get resource from the url
   */

  let groupPermissions = opt.rules.get(role)

  /**
   * if no groupPermissions
   */

  if (!groupPermissions || groupPermissions.length === 0) {
    return utils.deny(ctx, 404, 'REQUIRED: Group not found')
  }

  let policy = groupPermissions[0]
  let currResource = policy.resource
  let length = groupPermissions.length
  let methods = policy.methods
  
  /**
   * Globs / resources
   */
  if (length === 1 && currResource === '*') {
    switch (policy.action) {
      case 'allow':
        return utils.whenGlobAndActionAllow(ctx, next, method, methods, opt.response)
      default:
        return utils.whenGlobAndActionDeny(ctx, next, method, methods, opt.response)
    }
  }

  /**
   * If we have more that one group and we no glob '*'
   */

  if (length >= 1 && resource !== '*') {

    /**
     * [methods Get all the methods defined on the group]
     * @param {[Object]} [group]
     * @param {string} [resource]
     * @type {[Array]}
     */

    let policy = helper.getPolicy(groupPermissions, resource)

    if (!policy) {
      return utils.deny(ctx, 404, 'REQUIRED: Policy not found')
    }

    let methods = policy.methods

    /**
     * If the methods are defined with a glob '*'
     */

    if (methods && _.isString(methods)) {
      return utils.whenResourceAndMethodGlob(ctx, next, policy.action, methods, opt.response)
    }

    /**
     * If the methods are defined in an array
     */

    if (_.isArray(methods)) {
      return utils.whenIsArrayMethod(ctx, next, policy.action, method, methods, opt.response)
    }
  }
}

/**
 * Add unless to the authorize middleware
 * By default koa-unless will block all traffic to routes that have no plocy
 * defined against them, this module will enable koa-acl to exclude them
 */

authorize.unless = unless

/**
 * export the functionality
 */

module.exports = {
  config,
  authorize
}