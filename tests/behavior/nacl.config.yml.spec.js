'use strict';
const assert = require('assert');
const acl = require('../../');

describe('Yaml testing', () => {
  let rules;

  beforeEach(done => {
    rules = acl.config({
      path: 'tests/config',
      baseUrl: 'api',
      filename: 'nacl.yaml'
    });
    done();
  });

  it('Should read the yaml file and convert to json', () => {
    let expectedRule = [
      {
        resource: 'users/*',
        methods: ['GET', 'POST', 'DELETE'],
        action: 'allow'
      }
    ];

    assert(rules, true);
    assert(rules.has('user'));
    assert.deepEqual(rules.get('user'), expectedRule);
  });
});
