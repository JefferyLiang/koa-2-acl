'use strict';
const assert = require('assert');
const acl = require('../../');

let rules = [
  {
    group: 'user',
    permissions: [
      {
        resource: 'users',
        methods: ['GET', 'POST', 'DELETE'],
        action: 'allow'
      }
    ]
  }
];

describe('Policies passed as Array to config function', () => {
  it('Should be used in place of config file', () => {
   const policies = acl.config({ rules });
   assert(policies.has('user'), true);
   assert(typeof policies, 'object');
   assert.deepEqual(policies.get('user'), rules[0].permissions);
  });
});
