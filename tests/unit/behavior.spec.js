'use strict'
const chai = require('chai')
const helper = require('../../lib/helpers')
const httpMochs = require('node-mocks-http')
const spies = require('chai-spies')
const expect = chai.expect

describe('Helpers test', () => {

  context('getRules', () => {
    let path, rules

    beforeEach(() => {
      path = './tests/config/config.json'
    })

    it('Should return an array containing the rules', () => {
      rules = helper.getRules(path, null, false)
      let permissions = rules.get('user')
      expect(rules.has('user')).to.equal(true)
      expect(permissions[0]).to.have.property('resource')
      expect(permissions[0]).to.have.property('methods')
      expect(permissions[0]).to.have.property('action')
    })

    it('Should throw an error', () => {
      try {
        rules = helper.getRules(path, 1, true)
      } catch (err) {
        expect(helper.getRules).to.throw(Error)
      }
    })
  })

  context('getPolicy', () => {
    it('Should return the permissions specified', () => {
      let mockResource = 'users'
      let mockGroup = [{
        resource: 'users',
        methods: '*',
        actions: 'allow'
      }]

      let policy = helper.getPolicy(mockGroup, mockResource)

      expect(policy).to.not.be.empty
      expect(policy).to.have.property('methods')
      expect(policy).to.have.property('action')
    })
  })

  context('getRole', () => {
    let ctx = {}

    beforeEach((done) => {
      ctx.request = httpMochs.createRequest()
      ctx.response = httpMochs.createResponse()
      done()
    })

    it('Should return the role', () => {
      ctx.request.decoded = {
        role: 'user'
      }
      let role = helper.getRole(ctx)
      expect(role).to.not.be.empty
      expect(role).to.equal(ctx.request.decoded.role)
    })

    it('Should return the role when session exists', () => {
      ctx.request.session = {
        role: 'admin'
      }
      let role = helper.getRole(ctx)
      expect(role).to.not.be.empty
      expect(role).to.equal(ctx.request.session.role)
    })

    it('Should return the role when option exists', () => {
      let opt = {
        decodedObjectName: 'currentUser'
      }
      ctx.request[opt.decodedObjectName] = {
        role: "admin"
      }
      let role = helper.getRole(ctx, opt.decodedObjectName)

      expect(role).to.not.be.empty
      expect(role).to.equal(ctx.request[opt.decodedObjectName].role)
    })

    it('Should return default role if user has no role defined', () => {
      let defaultRole = 'guest'
      let role = helper.getRole(ctx, undefined, defaultRole)
      expect(role).to.not.be.empty
      expect(role).to.equal(defaultRole)
    })

    it('Should return role from a deep path', () => {
      let path = 'guest'
      ctx.request.user = {
        Role: {
          name: 'admin'
        }
      }
      let role = helper.getRole(ctx, undefined, undefined, 'user.Role.name')
      expect(role).to.not.be.empty
      expect(role).to.equal(ctx.request.user.Role.name)
    })
  })

  context('Resource', () => {
    let next

    beforeEach(() => {
      next = function () {
        return
      }
    })

    it('Should return the resource for a given url', () => {
      let url = `/api/user/4`
      let baseUrl = `api`
      let resource = helper.resource(next, url, baseUrl)

      expect(resource).to.not.be.empty
      expect(resource).to.equal('user')
    })

    it('Should call next', () => {
      chai.use(spies)
      let url = ''
      let baseUrl = 'api'
      let spy = chai.spy(next)
      let resource = helper.resource(spy, url, baseUrl)

      expect(resource).to.undefined
      expect(spy).to.have.been.called()
    })
  })

})