'use strict'
const expect = require('chai').expect
const assert = require('assert')
const httpMocks = require('node-mocks-http')
const utils = require('../../lib/utils')

describe('Testing Utils', () => {
  let ctx, next, date, method

  ctx = {}

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
      ctx.body = response.success
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

  })
})