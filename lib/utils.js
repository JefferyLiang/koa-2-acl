'use strict';
const _ = require('lodash');
const assert = require('assert');

/**
 * [deny sends Deny response]
 * @param {[Object]} ctx            [Koa ctx]
 * @param {[Number]} status         [Status code]
 * @param {[String]} customMessage  [error your are reporting]
 * @return {[Object]}
 */

function deny(ctx, status, customMessage, response) {
  let message = customMessage ? customMessage : 'Unauthorized access';

  if (response && typeof response === 'object') {
    ctx.status = status
    ctx.body = response
  }

  ctx.status = status;
  ctx.body = {
    code: status,
    status: 'Access denied',
    success: false,
    message: message
  }
}

/**
 * Allow traffic to all resource
 * 1. Check for methods
 * 2. If its a string and a glob '*'
 * 3. Allow traffic on all methods
 * 4. If methods are defined
 * 5. Allow traffic on the defined methods and deny the rest
 * 
 * If the method is a glob '*' grant access
 */

function whenGlobAndActionAllow(ctx, next, method, methods, response) {
  if (_.isString(methods)) return next();

  /**
   * [if Its an array of methods]
   * 1. check if the method is defined
   * 2. If defined Allow traffic else deny access
   */

  if (_.isArray(methods)) {
    let index = methods.indexOf(method);

    switch (index) {
      case -1:
        return deny(ctx, 403, null, response);
      default:
        return next();
    }
  }
}

/**
 * Allow traffic to all resources
 * 1. Check for methods
 * 2. If its a string and a glob '*'
 * 3. Allow traffic on all methods
 * 4. If methods are defined
 * 5. Allow traffic on the defined methods and deny the rest
 */

function whenGlobAndActionDeny(ctx, next, method, methods, response) {
  if (_.isString(methods)) {
    return deny(ctx, 403, null, response);
  }

  if (_.isArray(methods)) {
    let index = methods.indexOf(method);
    switch (index) {
      case -1:
        return next();
      default:
        return deny(ctx, 403, null, response);
    }
  }
}

/**
 * When a resource is matched
 * And the methods are denoted by glob "*"
 */

function whenResourceAndMethodGlob(ctx, next, action, response) {
  switch (action) {
    case 'deny':
      return deny(ctx, 403, null, response);
    default:
      return next();
  }
}

/**
 * [whenIsArrayMethod When the methods in policy are an array]
 * @param {[type]} ctx      [Koa ctx object]
 * @param {Function} next   [Koa next function]
 * @param {[type]} action   [Policy action]
 * @param {[type]} method   [Method from the request object]
 * @param {[type]} methods  [Policy methods]
 */

function whenIsArrayMethod (ctx, next, action, method, methods, response) {
  let boolean = _.includes(methods, method);
  switch (boolean) {
    case true:
      switch (action) {
        case 'allow':
          return next();
        default:
          return deny(ctx, 403, null, response);
      }
      /* istanbul ignore next */
      case false:
        switch (action) {
          case 'allow':
            return deny(ctx, 403, null, response);
          default:
            return next();
        }
  }
}

/**
 * Ensure that rules has the core preperties
 * @param {[JSON]} rules
 * @return {[JSON]}
 */

function assertIsGlobOrArray(term, name) {
  // check term is string or array.
  if (typeof term !== 'string' && !_.isArray(term)) {
    throw new Error(`TypeError: ${name} should be a array or string`);
  }

  if (typeof term === 'string' && term !== '*') {
    throw new Error(
      `DefinitionError: Unrecognised glob "${term}" , use "*" instead`
    );
  }
}

function checkProperties(rules) {
  let rulesMap = new Map();

  for (let rule of rules) {
    // rule group must be a string
    assert.equal(typeof rule.group, 'string');
    assertIsGlobOrArray(rule.permissions, 'Permissions');

    for (let policy of rule.permissions) {
      assert(typeof policy.resource, 'string');
      assertIsGlobOrArray(policy.methods, 'Methods');

      if (policy.action !== 'allow' && policy.action !== 'deny') {
        throw new Error('TypeError: action should be either "deny" or "allow"');
      }
    }

    rulesMap.set(rule.group, rule.permissions);
  }

  return rulesMap;
}

/**
 * [Checks the validity of the rules]
 * @param {[JSON]} rules
 * @return {[JSON]}
 */

function validate(rules) {

  // rules is not array throw the TypeError
  if (!_.isArray(rules)) {
    throw new Error('TypeError: Expected Array but got ' + typeof rules);
  }

  if (rules.length === 0) {
    return `\u001b[33mPolicy not set, All traffic will be denied\u001b[39m`;
  }

  // check the rule properties
  return checkProperties(rules);
}

module.exports = {
  deny,
  validate,
  whenGlobAndActionAllow,
  whenGlobAndActionDeny,
  whenResourceAndMethodGlob,
  whenIsArrayMethod
}