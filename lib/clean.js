const normalize = require('normalize-registry-metadata')
const gh = require('github-url-to-object')
const semver = require('semver')
const getProp = require('lodash').get

module.exports = function clean (doc) {
  if (!doc || typeof doc !== 'object') return

  // Has this object already been cleaned?
  if (doc.lastPublisher) return doc

  var pkg

  const latest = getProp(doc, 'dist-tags.latest')

  if (latest) {
    // this is a registry object
    doc = normalize(doc)
    // add props from lastest release that are absent from the top level
    pkg = Object.assign({}, doc.versions[latest], doc)
  } else if (doc.name) {
    // this is a basic object, i.e. a package.json file
    pkg = doc
  } else {
    // incomplete package.json object
    if (doc && typeof doc.valid !== 'undefined') delete doc.valid
    return doc
  }

  if (!pkg) return

  // attempt to sanitize github repo to a plain HTTPS url
  var repo
  try {
    repo = gh(pkg.repository.url).https_url
  } catch (e) {
    // not a github repo; no worries
  }
  if (repo) pkg.repository = repo

  // derive star count from users object
  if (pkg.users) {
    pkg.starsCount = Object.keys(pkg.users).length
  }

  if (pkg.time) {
    pkg.versions = Object.keys(pkg.time)
      .filter(version => !!semver.valid(version))
      .map(version => {
        return {
          number: version,
          date: pkg.time[version]
        }
      })

    if (pkg.time.created) pkg.created = pkg.time.created
    if (pkg.time.modified) pkg.modified = pkg.time.modified
  }

  if (pkg._npmUser) {
    pkg.lastPublisher = Object.assign({}, pkg._npmUser)
  }

  if (pkg.maintainers) {
    if (Array.isArray(pkg.maintainers)) {
      pkg.owners = pkg.maintainers.map(m => m)
    }
  }

  // create an object to store unwanted props
  pkg.other = {}
  const otherProps = [
    '_attachments',
    '_from',
    '_id',
    '_nodeVersion',
    '_npmOperationalInternal',
    '_npmUser',
    '_npmVersion',
    '_rev',
    '_shasum',
    'author',
    'bugs',
    'contributors',
    'directories',
    'dist-tags',
    'dist',
    'maintainers',
    'readmeFilename',
    'time',
    'users'
  ]
  otherProps
    .filter(prop => prop in pkg)
    .forEach(prop => {
      pkg.other[prop] = pkg[prop]
      delete pkg[prop]
    })

  if (Object.keys(pkg.other).length === 0) delete pkg.other

  // don't allow this prop to override the `pkg.valid` getter method
  delete pkg.valid

  return pkg
}
