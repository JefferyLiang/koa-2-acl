'use strict';

const fs = require('fs');
const utils = require('./utils');
const yaml = require('js-yaml');
const _ = require('lodash');
const objectPath = require('object-path');

/**
 * Get the rules from the specified file path
 * @param {[String]} path
 * @param {[String]} encoding
 * @param {[Boolean]} isYaml
 * @return {[JSON]}
 */

function getRules(path, encoding, isYaml) {
  let rules, buffer;

  try {
    buffer = fs.readFileSync(path, { encoding });
    rules = (isYaml) ? yaml.safeLoad(buffer) : JSON.parse(buffer);
  } catch (error) {
    throw Error(error);
  }

  return utils.validate(rules);
}

/**
 * [Gets the methods from the selected group]
 * @param {[Object]} group
 * @param {[String]} resource
 * @return {[Array/String]} Returns an array of methods
 * or a string incase a glob is used;
 */

function getPolicy(permissions, resource) {
  let policy = _.find(permissions, { resource })

  if (policy) {
    return {
      methods: policy.methods,
      action: policy.action
    };
  }

  return policy;
}

function getRole(ctx, decodedObjectName, defaultRole, searchPath) {

  /**
   * Checking for path first, because if it's defined
   * it surely is so because that's where the role is
   */

  if (searchPath) {
    return objectPath.get(ctx.request, searchPath);
  }

  /**
   * if decodedObjectName provided in configurations
   * and role is attached to request[decodedObjectName]
   * Return role
   */

  if (decodedObjectName && ctx.request[decodedObjectName] && ctx.request[decodedObjectName].role) {
    return ctx.request[decodedObjectName].role;
  }

  /**
   * if role is attached to the decoded
   * Return role
   */

  if (ctx.request.decoded && ctx.request.decoded.role) {
    return ctx.request.decoded.role;
  }

  /**
   * if role is attached to the session
   * Return role
   */

  if (ctx.request.session && ctx.request.session.role) {
    return ctx.request.session.role;
  }

  /**
   * if role is not attached to the session or decoded object
   * Return role
   */

  return defaultRole;
}

/**
 * [resource finds the resource based of the baseurl specified]
 * @param {Function} next     [Koa next function]
 * @param {[String]} url      [Request url]
 * @param {[String]} baseUrl  [The api baseUrl]
 * @return {[String]}         [The matched resource]
 */

function resource(next, url, baseUrl) {
  let base = (baseUrl) ? baseUrl.match(/([A-Z])\w+/gi) : '';
  let lengthOfTheBaseUrl = (base) ? base.length : 0;
  let arr = url.match(/([A-Z])\w+/gi);

  if (arr) return arr.splice(lengthOfTheBaseUrl)[0];

  return next();
}

module.exports = {
  getRules,
  getRole,
  getPolicy,
  resource
}