'user strict';
const assert = require('assert');
const acl = require('../../');
const httpMocks = require('node-mocks-http');
const { mockKoaCtx } = require('../helper/mock');

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

describe('Testing Methods', () => {
  let ctx, data, next;

  context('When action deny', () => {
    beforeEach(done => {
      acl.config({
        baseUrl: 'api',
        filename: 'methods-glob-deny.json',
        path: './tests/config'
      });
      done();
    });

    it('Should deny access to resource POST /api/mangoes/42', done => {
      let req = httpMocks.createRequest({
        method: 'POST',
        url: 'api/mangoes/42'
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

    it('Should deny access to resource PUT /api/mangoes/42', done => {
      let req = httpMocks.createRequest({
        method: 'PUT',
        url: 'api/mangoes/42'
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

    it('Should deny access to resource DELETE /api/mangoes/42', done => {
      let req = httpMocks.createRequest({
        method: 'DELETE',
        url: 'api/mangoes/42'
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

  context('When action allow', () => {
    beforeEach(done => {
      acl.config({
        baseUrl: 'api',
        filename: 'methods-glob-allow.json',
        path: './tests/config'
      });
      done();
    });

    it('Should allow access to resource POST /api/mangoes/42', done => {
      let req = httpMocks.createRequest({
        method: 'POST',
        url: 'api/mangoes/42'
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

    it('Should allow access to resource PUT /api/mangoes/42', done => {
      let req = httpMocks.createRequest({
        method: 'PUT',
        url: 'api/mangoes/42'
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

    it('Should allow access to resource DELETE /api/mangoes/42', done => {
      let req = httpMocks.createRequest({
        method: 'DELETE',
        url: 'api/mangoes/42'
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
});
