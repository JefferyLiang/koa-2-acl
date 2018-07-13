'use strict';
const assert = require('assert');
const acl = require('../../');
const httpMocks = require('node-mocks-http');
const { mockKoaCtx } = require('../helper/mock');

describe('Authorize middleware', () => {
  let ctx, data, next;
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
  };

  beforeEach(done => {
    acl.config({
      baseUrl: 'api',
      filename: 'nacl.json',
      path: '.'
    });
    done();
  });

  context('When request comes from home route', () => {
    beforeEach(done => {
      let req = httpMocks.createRequest({
        method: 'GET',
        url: '/'
      });
      // mock koa context
      let result = mockKoaCtx(req);
      ctx = result.ctx;
      next = result.next;

      done();
    });

    it('Should allow traffic for the home route', done => {
      acl.authorize(ctx, next);
      data = ctx.body;
      assert(data, true);
      assert.deepEqual(data, response.success);
      done();
    });
  });

  context('When role is defined in the user object', () => {
    beforeEach(done => {
      let req = httpMocks.createRequest({
        method: 'GET',
        url: '/api/users/42'
      });

      // mock koa context
      let mock = mockKoaCtx(req);
      ctx = mock.ctx;
      next = mock.next;
      
      done();
    });

    it('Should allow when role is defined on /api/user/42', done => {
      ctx.request.decoded = { role: 'user' };
      acl.authorize(ctx, next);
      data = ctx.body;
      assert(data, true);
      assert.deepEqual(data, response.success);
      done();
    });
  });

  context('When role is not defined in the user object', () => {
    it('Should block traffic if no role is defined', done => {
      // mock request
      let req = httpMocks.createRequest({
        method: 'GET',
        path: '/api/users/42'
      });
      let mock = mockKoaCtx(req);
      ctx = mock.ctx;
      next = mock.next;

      acl.authorize(ctx, next);
      let expectedResponse = {
        status: 'Access denied',
        success: false,
        message: 'REQUIRED: Policy for role guest is not defined'
      };

      data = ctx.body;
      
      assert(data, true);
      assert.deepEqual(data, expectedResponse);
      done();
    });
  });

  context('When no policy is defined for such role', () => {
    it('Should deny access if no policy for such role', done => {
      // mock request
      let req = httpMocks.createRequest({
        method: 'GET',
        path: '/api/users/42'
      });
      let mock = mockKoaCtx(req);
      let ctx = mock.ctx;
      let next = mock.next;

      acl.authorize(ctx, next);
      let expectedResponse = {
        status: 'Access denied',
        success: false,
        message: 'REQUIRED: Policy for role guest is not defined'
      };

      data = ctx.body;
      assert(data, true);
      assert.deepEqual(data, expectedResponse);
      done();
    });
  });

  context('When action is allow', () => {
    it('Should allow access to /api/users/42', done => {
      let req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/users/42'
      });

      let mock = mockKoaCtx(req);
      ctx = mock.ctx;
      next = mock.next;

      ctx.request.decoded = { role: 'user' };
      acl.authorize(ctx, next);
      data = ctx.body;
      assert(data, true);
      assert.deepEqual(data, response.success);
      done();
    });

    it('Should allow access to /api/users/42', done => {
      let req = httpMocks.createRequest({
        method: 'PUT',
        url: '/api/users/42'
      });

      let mock = mockKoaCtx(req);
      ctx = mock.ctx;
      next = mock.next;

      ctx.request.decoded ={ role: 'user' };
      acl.authorize(ctx, next);
      data = ctx.body;
      assert(data, true);
      assert.deepEqual(data, response.success);
      done();
    });

    it('Should deny access to resource /api/users/42', done => {
      let req = httpMocks.createRequest({
        method: 'DELETE',
        url: '/api/users/42'
      });

      let mock = mockKoaCtx(req);
      ctx = mock.ctx;
      next = mock.next;

      ctx.request.decoded = { role: 'user' };
      acl.config({
        baseUrl: 'api'
      });
      acl.authorize(ctx, next);
      data = ctx.body;
      assert(data, true);
      assert(typeof data, 'object');
      assert.deepEqual(data, response.restricted);
      done();
    });
  });

  context('When action is deny', () => {
    beforeEach(done => {
      acl.config({
        baseUrl: 'api',
        filename: 'deny-user-config.json',
        path: './tests/config'
      });
      done();
    });

    it('Should deny access to resource /api/users/42', done => {
      let req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/users/42'
      });

      let mock = mockKoaCtx(req);
      ctx = mock.ctx;
      next = mock.next;
      ctx.request.decoded = { role: 'user' };
      
      acl.authorize(ctx, next);
      data = ctx.body;
      
      assert(data, true);
      assert(typeof data, 'object');
      assert.deepEqual(data, response.restricted);
      done();
    });

    it('Should deny access to resource /api/users/42', done => {
      let req = httpMocks.createRequest({
        method: 'PUT',
        url: '/api/users/42'
      });

      let mock = mockKoaCtx(req);
      ctx = mock.ctx;
      next = mock.next;
      ctx.request.decoded = { role: 'user' };
      
      acl.authorize(ctx, next);
      data = ctx.body;
      
      assert(data, true);
      assert(typeof data, 'object');
      assert.deepEqual(data, response.restricted);
      done();
    });

    it('Should deny access to resource /api/users/42', done => {
      let req = httpMocks.createRequest({
        method: 'DELETE',
        url: '/api/users/42'
      });

      let mock = mockKoaCtx(req);
      ctx = mock.ctx;
      next = mock.next;
      ctx.request.decoded = { role: 'user' };
      
      acl.authorize(ctx, next);
      data = ctx.body;
      
      assert(data, true);
      assert(typeof data, 'object');
      assert.deepEqual(data, response.success);
      done();
    });
  });

  context('When not policy is defined', () => {
    beforeEach(done => {
      acl.config({ baseUrl: 'api' });
      done();
    });

    it('Should deny if not policy match resource', done => {
      let req = httpMocks.createRequest({
        method: 'POST',
        url: '/api/cargo/42'
      });

      let mock = mockKoaCtx(req);
      ctx = mock.ctx;
      next = mock.next;
      ctx.request.decoded = { role: 'user' };

      acl.authorize(ctx, next);
      data = ctx.body;
      
      assert(data, true);
      assert(typeof data, 'object');
      assert.deepEqual(data, response.restricted);
      done();
    });
  });
});
