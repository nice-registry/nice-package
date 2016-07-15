'use strict';
const revalidator = require('revalidator')
const schema = require('./lib/schema')
const clean = require('./lib/clean')
const registryUrl = require('registry-url')()
const got = require('got')

class Package {
  constructor (doc) {
    var pkg = clean(doc)
    if (!pkg) return
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

  get depNames () {
    return this.dependencies ? Object.keys(this.dependencies) : []
  }

  get devDepNames () {
    return this.devDependencies ? Object.keys(this.devDependencies) : []
  }

  get valid () {
    return revalidator.validate(this, schema).valid
  }

  get validationErrors () {
    return revalidator.validate(this, schema).errors
  }
}

module.exports = moduleName => {
  return new Promise((resolve, reject) => {
    return got(`${registryUrl}${moduleName}`, {json:true})
    .then(resp => resolve(new Package(resp.body)))
    .catch(err => reject(err))
  })
}