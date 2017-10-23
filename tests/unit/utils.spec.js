'use strict'
const chai = require('chai')
const expect = chai.expect
const spies = require('chai-spies')
const assert = require('assert')
const httpMocks = require('node-mocks-http')
const utils = require('../../lib/utils')

describe('Testing Utils', () => {
  let ctx, next, data, method

  ctx = {
    request: {},
    response: {},
    throw: function () {}
  }

  let response = {
    success: {
      status: 200,
      success: true,
      message: 'ACCESS GRANTED'
    },
    restricted: {
      status: 'Access denied',
      success: false,
      message: 'Unauthorized access'
    }
  }

  let methods = [ 'GET', 'PUT', 'DELETE' ]

  beforeEach((done) => {
    ctx.response = httpMocks.createResponse()

    next = function () {
      ctx.response.send(response.success)
    }

    ctx.throw = function (status, response) {
      ctx.status = status
      ctx.body = response
      return ctx
    }

    done()
  })

  describe('Validating Utils', () => {

    it('All the function should be defined', () => {
      assert(utils, true)
      assert(utils.deny, true)
      assert(utils.whenGlobAndActionAllow, true)
      assert(utils.whenGlobAndActionDeny, true)
      assert(utils.whenIsArrayMethod, true)
      assert(utils.checkProperties, true)
    })

    it('They should be functions', () => {
      expect(utils.deny).to.be.a('function')
      expect(utils.checkProperties).to.be.a('function')
      expect(utils.validate).to.be.a('function')
      expect(utils.whenGlobAndActionAllow).to.be.a('function')
      expect(utils.whenGlobAndActionDeny).to.be.a('function')
      expect(utils.whenIsArrayMethod).to.be.a('function')
      expect(utils.whenResourceAndMethodGlob).to.be.a('function')
    })

  })

  describe('utils.deny', () => {

    it('should return default message when called with status', () => {
      utils.deny(ctx, 403)
      data = ctx.body
      assert(data, true)
      expect(data).to.be.an('object')
      assert.deepEqual(data, response.restricted)
    })

    it('Should return custom message when called with message', () => {
      utils.deny(ctx, 450, 'Role not found')
      data = ctx.body
      assert(data, true)
      expect(data).to.be.an('object')
      assert.deepEqual(data, {
        status: 'Access denied',
        success: false,
        message: 'Role not found'
      })
    })

    it('should return custom error when called with custom error message', () => {
      chai.use(spies)
      let customErrorResponse = {
        status: 'Access Denied',
        message: 'You are not authorized to access this resource'
      }

      utils.deny(ctx, 403, null, customErrorResponse)
      data = ctx.body
      assert(data, true)
      expect(data).to.be.an('object')
      expect(ctx.status).to.equal(403)
      assert.deepEqual(data, customErrorResponse)
    })

  })

  // describe('Utils.whenGlobAndActionAllow', () => {

  //   context('When the Methods are a string', () => {
      
  //     it('should call next when method is string and "*"', () => {
  //       utils.whenGlobAndActionAllow(ctx, next, null, '*')
  //       data = ctx.body
  //       assert(data, true)
  //       expect(data).to.be.an('object')
  //       assert.deepEqual(data, response.success)
  //     })

  //   })

  // })
})