// 'use strict';
// const assert = require('assert');
// const acl = require('../../');
// const httpMocks = require('node-mocks-http');
// const { mockKoaCtx } = require('../helper/mock');

// let success = {
//   status: 200,
//   success: true,
//   message: 'ACCESS GRANTED'
// };

// describe('Testing for unprotected routes', () => {
//   let ctx, next;

//   context('When the routes is not authenticated', () => {
//     beforeEach(done => {
//       acl.config({
//         baseUrl: 'api'
//       });
//       done();
//     });

//     it('Should give access to unprotected path', done => {
//       let req = httpMocks.createRequest({
//         method: 'POST',
//         url: '/api/oranges'
//       });
//       let mock = mockKoaCtx(req);
//       ctx = mock.ctx;
//       next = mock.next;
//       ctx.request.decoded = { role: 'user' };

//       acl.authorize.unless({ path: ['/api/oranges'] })(ctx, next);
//       const data = ctx.body;

//       assert(data, true);
//       assert(typeof data, 'object');
//       assert.deepEqual(data, success);
//       done();
//     });
//   });
// });
