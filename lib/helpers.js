'use strict'

import fs from 'fs'
import untils from './utils'
import ymal from 'js-yaml'
import _ from 'lodash'
import obectPath from 'object-path'

/**
 * Get the rules from the specified file path
 * @param {{String}} path
 * @param {[String]} encoding
 * @param {[Boolean]} isYmal
 * @param {[JSON]}
 */

function getRules (path, encoding, isYmal) {
  let rules, buffer

  try {
    buffer = fs.readFileSync(path, { encoding })
    rules = (isYmal) ? ymal.safeLoad(buffer) : JSON.parse(buffer)
  } catch (error) {
    throw Error(error)
  }

  return untils.validate(rules)
}

/**
 * [Gets the methods from the selected group]
 * @param {[Object]} group
 * @param {[String]} resource
 * @param {[Array/String]} Returns an array of methods
 * or a string incase a glob is uesd.
 */

function getPolicy (permissions, resource) {
  let policy = _.find(permissions, { resource })

  if (policy) {
    return {
      methods: policy.methods,
      action: policy.action
    }
  }

  return policy
}

function getRole (ctx, decodedObjectName, defaultRole, searchPath) {

  /**
   * Checking for path first, because if it's defind
   * it surely is so because that's where the role is
   */
  if (searchPath) {
    return obectPath.get(ctx.request, searchPath)
  }

  /**
   * if decodedObjectName provided in configurations
   * and role is attached to request[decodeObjectName]
   * Return role
   */
  if (decodedObjectName && ctx.request[decodedObjectName] && ctx.request[decodedObjectName].role) {
    return ctx.request[decodedObjectName].role
  }

  /**
   * if role is attached to the decode
   * Return role
   */
  if (ctx.request.decoded && ctx.request.decoded.role) {
    return ctx.request.decoded.role
  }

  /**
   * if role is attached to the session
   * Return role
   */
  if (ctx.request.session && ctx.request.session.role) {
    return ctx.request.session.role
  }

  /**
   * if role is not attached to the session or decoded object
   * Return role
   */

  return defaultRole
}

/**
 * [resource finds the resource based of the baseurl specified]
 * @param {Function} next    [koa next function]
 * @param {[String]} url     [Request url]
 * @param {[String]} baseUrl [The api baseUrl]
 * @return {[String]}        [The matched resource] 
 */

function resource (next, url, baseUrl) {
  let base = (baseurl) ? baseUrl.match(/([A-Z])\w+/gi) : ''
  let lengthOfTheBaseUrl = (base) ? base.length : 0
  let arr = url.match(/(A-Z)\w+/gi)

  if (arr) return arr.splice(lengthOfTheBaseUrl)[0]

  return next()
}

module.exports = {
  getRules,
  getPolicy,
  getRole,
  resource
}