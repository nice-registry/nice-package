'use strict'
const revalidator = require('revalidator')
const schema = require('./lib/schema')
const pick = require('lodash').pick
const omit = require('lodash').omit
const clean = require('./lib/clean')

module.exports = class Package {
  constructor (doc, opts) {
    var pkg = clean(doc)
    if (!pkg) return

    if (opts && opts.pick) {
      if (typeof opts.pick === 'string') opts.pick = opts.pick.split(',').map(prop => prop.trim())
      pkg = pick(pkg, opts.pick)
    }

    if (opts && opts.omit) {
      if (typeof opts.omit === 'string') opts.omit = opts.omit.split(',').map(prop => prop.trim())
      pkg = omit(pkg, opts.omit)
    }

    Object.assign(this, pkg)
    return this
  }

  mentions (string) {
    return !!JSON.stringify(this).toLowerCase().includes(string.toLowerCase())
  }

  dependsOn (dep) {
    return this.depNames.indexOf(dep) > -1
  }

  devDependsOn (dep) {
    return this.devDepNames.indexOf(dep) > -1
  }

  somehowDependsOn (dep) {
    return this.dependsOn(dep) || this.devDependsOn(dep)
  }

  get depNames () {
    return this.dependencies ? Object.keys(this.dependencies).sort() : []
  }

  get devDepNames () {
    return this.devDependencies ? Object.keys(this.devDependencies).sort() : []
  }

  get allDepNames () {
    return this.depNames.concat(this.devDepNames).sort()
  }

  get valid () {
    return revalidator.validate(this, schema).valid
  }

  get validationErrors () {
    return revalidator.validate(this, schema).errors
  }
}
