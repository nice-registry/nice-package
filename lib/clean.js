const normalize = require('normalize-registry-metadata')
const gh = require('github-url-to-object')
const semver = require('semver')

module.exports = function clean (doc) {
  // Has this object already been cleaned?
  if (doc.lastPublisher) return doc

  var pkg

  if (doc['dist-tags'] && doc['dist-tags'].latest) {
    // registry object
    doc = normalize(doc)
    var latest = doc['dist-tags'].latest
    pkg = doc.versions[latest]
  } else if (doc.name && doc.description) {
    // regular old package.json object
    pkg = doc
  } else {
    // incomplete package.json object
    if (doc && typeof doc.valid !== 'undefined') delete doc.valid
    return doc
  }

  if (!pkg) return

  var repo
  try {
    repo = gh(pkg.repository.url)
  } catch (e) {
    // no worries
  }

  if (repo) pkg.repository = repo

  if (doc.users) {
    pkg.stars = Object.keys(doc.users).length
    delete doc.users
  }

  if (doc.time) {
    pkg.versions = Object.keys(doc.time)
      .filter(version => !!semver.valid(version))
      .map(version => {
        return {
          number: version,
          date: doc.time[version]
        }
      })

    if (doc.time.created) pkg.created = doc.time.created
    if (doc.time.modified) pkg.modified = doc.time.modified

    delete doc.time
  }

  if (pkg._npmUser) {
    pkg.lastPublisher = Object.assign({}, pkg._npmUser)
    delete pkg._npmUser
  }

  if (pkg.maintainers) {
    if (Array.isArray(pkg.maintainers)) {
      pkg.owners = pkg.maintainers.map(m => m)
    }
    delete pkg.maintainers
  }

  if (doc.readme) {
    pkg.readme = doc.readme
    delete doc.readme
  }

  delete pkg._npmOperationalInternal
  delete pkg.directories
  delete pkg.bugs
  delete pkg._id
  delete pkg._shasum
  delete pkg._from
  delete pkg.npmVersion
  delete pkg.valid

  return pkg
}
