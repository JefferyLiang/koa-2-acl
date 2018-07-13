'use strict';
const assert = require('assert');
const httpMocks = require('node-mocks-http');
const acl = require('../../');
const { mockKoaCtx } = require('../helper/mock');

const response = {
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
};

describe('Test Sub Routes configuration', () => {
  let ctx, next;
  beforeEach(done => {
    acl.config({
      path: 'tests/config',
      baseUrl: 'api',
      filename: 'subroutes.json'
    });
    done();
  });

  context('When subroutes are specified', () => {
    it('Should allow traffic or deny tranffic when passed url of /api/users/42', done => {
      let req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/users/42'
      });
      let mock = mockKoaCtx(req);
      ctx = mock.ctx;
      next = mock.next;
      ctx.request.decoded = { role: 'user' };

      acl.authorize(ctx, next);
      const data = ctx.body;

      assert(data, true);
      assert(typeof data, 'object');
      assert.deepEqual(data, response.restricted);
      done();
    });

    it('Should allow traffic for api/users/public', done => {
      let req = httpMocks.createRequest({
        type: 'GET',
        url: '/api/users/public'
      });
      let mock = mockKoaCtx(req);
      ctx = mock.ctx;
      next = mock.next;
      ctx.request.decoded = { role: 'user' };

      acl.authorize(ctx, next);
      const data = ctx.body;

      assert(data, true);
      assert(typeof data, 'object');
      assert.deepEqual(data, response.success);
      done();
    });

    it('Should allow traffic for api/users/public when query string is added', done => {
      let req = httpMocks.createRequest({
        type: 'GET',
        url: '/api/users/public?string=true'
      });
      let mock = mockKoaCtx(req);
      ctx = mock.ctx;
      next = mock.next;
      ctx.request.decoded = { role: 'user' };

      acl.authorize(ctx, next);
      const data = ctx.body;

      assert(data, true);
      assert(typeof data, 'object');
      assert.deepEqual(data, response.success);
      done();
    })
  });
});
