const httpMocks = require('node-mocks-http');
const assert = require('assert');

function mockKoaCtx(req) {
  let ctx = {};
  // mock ctx response
  let res = httpMocks.createResponse();
  ctx.response = res;

  // mock ctx request
  let request = {
    decoded: {},
    session: {}
  };
  ctx.request = req;

  // mock ctx throw function
  ctx.throw = (code, message) => {
    res.status(code);
    res.send(assert(typeof message, 'object')
      ? JSON.stringify(message)
      : message);
  };

  // set the ctx method
  Object.defineProperty(ctx, 'method', {
    get: () => req.method
  })
  
  // set the ctx status
  Object.defineProperty(ctx, 'status', {
    get: () => res.statusCode,
    set (value) {
      // if (!assert(typeof value, 'number')) throw Error(`TypeError: the status must be a number, but set to ${typeof value}`);
      res.status(value);
    }
  });

  // set the ctx body
  Object.defineProperty(ctx, 'body', {
    get: () => res._getData(),
    set(value) {
      res.send(value);
    }
  });

  let next = function () {
    return res.send({
      status: 200,
      success: true,
      message: 'ACCESS GRANTED'
    });
  };

  return {
    ctx,
    next
  };
}

module.exports = {
  mockKoaCtx
}
