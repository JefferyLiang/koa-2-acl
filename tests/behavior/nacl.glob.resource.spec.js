'use strict';
const assert = require('assert');
const httpMocks = require('node-mocks-http');
const acl = require('../../');
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

describe('Testing for resource scenarios', () => {
  let ctx, data, next;

  for (let actionItem of ['deny', 'allow']) {
    context(`When action ${actionItem}`, () => {
      beforeEach(done => {
        acl.config({
          baseUrl: 'api',
          filename: `resource-glob-${actionItem}.json`,
          path: './tests/config'
        });
        done();
      });
      let methods = ['POST', 'PUT', 'DELETE'];
  
      for (let item of methods) {
        it(`Should deny access to resource ${item} /api/mangoes/42`, done => {
          let req = httpMocks.createRequest({
            type: item,
            url: '/api/mangoes/42'
          });
          let mock = mockKoaCtx(req);
          ctx = mock.ctx;
          next = mock.next;
          ctx.request.decoded = { role: 'user' }
    
          acl.authorize(ctx, next);
          data = ctx.body;
    
          assert(data, true);
          assert(typeof data, 'object');
          assert.deepEqual(
            data,
            actionItem === 'deny' ? response.restricted : response.success
          );
          done();
        });
      }
    });
  }
});
