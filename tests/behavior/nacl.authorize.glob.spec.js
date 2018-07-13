'use strict';
const assert = require('assert');
const acl = require('../../');
const httpMocks = require('node-mocks-http');
const { mockKoaCtx } = require('../helper/mock');

describe('Acl middleware for koa 2.x', () => {
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

  describe('When the methods and resource is a glob', () => {
    context('When action deny', done => {
      beforeEach(done => {
        acl.config({
          baseUrl: 'api',
          filename: 'all-glob-deny.json',
          path: './tests/config'
        });
        done();
      });

      it('Should deny access to resource POST /api/uses/42', done => {
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

      it('Should deny access to resource PUT /api/users/42', done => {
        let req = httpMocks.createRequest({
          method: 'PUT',
          url: '/api/users/42'
        });

        let mock = mockKoaCtx(req);
        ctx = mock.ctx;
        next = mock.next;
        ctx.request.decoded = { role: 'user' };

        acl.authorize(ctx, next);
        let data = ctx.body;

        assert(data, true);
        assert(typeof data, 'object');
        assert.deepEqual(data, response.restricted);
        done();
      });

      it('Should deny access to resource DELETE /api/users/42', done => {
        let req = httpMocks.createRequest({
          method: 'DELETE',
          url: '/api/users/42'
        });

        let mock = mockKoaCtx(req);
        let ctx = mock.ctx;
        let next = mock.next;
        ctx.request.decoded = { role: 'user' };

        acl.authorize(ctx, next);
        data = ctx.body;

        assert(data, true);
        assert(typeof data, 'object');
        assert.deepEqual(data, response.restricted);
        done();
      });
    });

    context('When action allow', done => {
      beforeEach(done => {
        acl.config({
          baseUrl: 'api',
          filename: 'all-glob-allow.json',
          path: './tests/config'
        });
        done();
      })

      it('Should deny access to resource PUT /api/users/42', done => {
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
        assert.deepEqual(data, response.success);
        done();
      });

      it('Should deny access to resource DELETE /api/users/42', done => {
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
  });
});
