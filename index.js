const revalidator = require('revalidator')
const schema = require('./lib/schema')
const clean = require('./lib/clean')

module.exports = class Package {
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
