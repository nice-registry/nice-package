const test = require('tape')
const Package = require('..')
const semver = require('semver')
const fixtures = require('require-dir')('./fixtures')

test('Package', function (t) {
  var pkg = new Package(fixtures.express)

  t.comment('basic properties')
  t.equal(pkg.name, 'express', 'name')
  t.ok(pkg.description, 'description')
  t.ok(pkg.version, 'version')
  t.ok(pkg.readme, 'readme')

  t.comment('stars')
  t.ok(pkg.stars > 1500, 'turns `users` object into a star count')

  t.comment('versions')
  t.ok(pkg.versions.length > 20, 'turns `time` object into a versions array')
  t.ok(pkg.versions.every(version => version.number.length > 0), 'every version has a number')
  t.ok(pkg.versions.every(version => !!semver.valid(version.number)), 'every version is valid semver')
  t.ok(pkg.versions.every(version => version.date.length > 0), 'every version has a date')
  t.ok(pkg.created, 'keeps package created date')
  t.ok(pkg.modified, 'keeps package modified date')

  t.comment('renamed stuff')
  t.ok(pkg.owners, 'renames `maintainers` to `owners`')
  t.ok(pkg.owners.find(owner => owner.name === 'dougwilson'), 'keeps owners object structure')
  t.ok(pkg.lastPublisher, 'renames `_npmUser` to `lastPublisher`')

  t.comment('unwanted stuff')
  t.notOk(pkg.directories, 'directories')
  t.notOk(pkg.bugs, 'bugs')
  t.notOk(pkg._id, '_id')
  t.notOk(pkg._shasum, '_shasum')
  t.notOk(pkg._from, '_from')

  t.comment('convenience functions')
  t.ok(pkg.dependsOn('finalhandler'), 'dependsOn')
  t.notOk(pkg.dependsOn('monkeys'), 'dependsOn')
  t.ok(pkg.devDependsOn('istanbul'), 'devDependsOn')

  t.ok(pkg.somehowDependsOn('finalhandler'), 'somehowDependsOn includes deps')
  t.ok(pkg.somehowDependsOn('istanbul'), 'somehowDependsOn includes devDeps')

  t.ok(pkg.depNames.indexOf('finalhandler') > -1, 'depNames')
  t.ok(pkg.devDepNames.indexOf('istanbul') > -1, 'devDepNames')

  t.ok(pkg.allDepNames.indexOf('finalhandler') > -1, 'allDepNames includes depNames')
  t.ok(pkg.allDepNames.indexOf('istanbul') > -1, 'allDepNames includes devDepNames')

  t.ok(pkg.mentions('minimalist web framework'), '`mentions` looks for a string anywhere in the object')
  t.ok(pkg.mentions('MINIMALIST WEB FRAMEWORK'), '`mentions` is case insensitive')

  t.comment('validation')
  t.ok(pkg.valid, 'package is valid if required properties are present')

  delete pkg.description
  t.notOk(pkg.valid, '`description` is required')
  t.equal(pkg.validationErrors.length, 1, '`description` error is present')
  t.equal(pkg.validationErrors[0].property, 'description', '`description` error is present')
  pkg.description = 'Restore package validity'

  delete pkg.name
  t.notOk(pkg.valid, '`name` is required')
  t.equal(pkg.validationErrors.length, 1, '`name` error is present')
  t.equal(pkg.validationErrors[0].property, 'name', '`name` error is present')
  pkg.name = 'express'

  t.comment('reusing clean packages')
  var repkg = new Package(pkg)
  t.ok(repkg.name, 'packages can be reconstituted from an already-cleaned package object')

  t.comment('using package.json data instead of registry data')
  var packageJSONPackage = new Package(fixtures.spectron)
  t.equal(packageJSONPackage.name, 'spectron', 'packages can be constituted from package.json data')
  t.ok(packageJSONPackage.dependsOn('webdriverio'), 'and the convenience methods still work')
  t.ok(packageJSONPackage.devDependsOn('mocha'), 'and the convenience methods still work')

  t.comment('using incomplete package.json data')
  var sparsePackage = new Package(fixtures.sparse)
  t.notOk(sparsePackage.name, 'does not have a name')
  t.notOk(sparsePackage.valid, 'is not valid')
  t.ok(sparsePackage.dependsOn('request'), 'still has working convenience methods')

  t.comment('non-GitHub repository URLs')
  var bitty = new Package(fixtures.bitbucket)
  t.equal(bitty.repository.type, 'git', 'retains type value')
  t.equal(bitty.repository.url, 'https://bitbucket.org/monkey/business.git', 'retains url value')

  t.end()
})
