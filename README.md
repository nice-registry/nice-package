# nice-package ✨📦✨  [![Build Status](https://travis-ci.org/zeke/nice-package.svg?branch=master)](https://travis-ci.org/zeke/nice-package)

> Clean up messy package metadata from the npm registry

The [package data served by the npm registry](http://registry.npmjs.com/express)
is messy and confusing. The folks at npm, Inc maintain a tool called
[normalize-package-data](https://github.com/npm/normalize-package-data)
which does a lot of work to clean this data up, but the resulting object is
still kind of inhumane.

`nice-package` uses `normalize-package-data` as a baseline, then does even more
package cleanup:

- uses the `doc['dist-tags'].latest` as the baseline for package metadata
- turns `users` object into a star count
- turns the `time` object into an array of version data
- renames `_npmUser` to `lastPublisher`
- renames `maintainers` to `owners`
- parses GitHUB repository URLs into [useful objects](https://github.com/zeke/github-url-to-object#readme)
- removes internal bookkeeping properties like `_id` and `_from`
- [more...](tests/index.js)

## See Also

- [package-stream](https://github.com/zeke/package-stream/): streams nice packages
from the npm registry.
- [fetch-nice-package](https://github.com/hemanth/fetch-nice-package): fetch a nice package by name.
- [dependent-packages](https://github.com/zeke/dependent-packages/): offline dependency dataset.

## Installation

```sh
npm install nice-package --save
```

## Usage

`nice-package` exports a class. To create a new package instance,
call `new Package(doc)`, where `doc` is a JSON package object from the npm registry:

```js
const got = require('got')
const Package = require('nice-package')

got('https://registry.npmjs.com/express', {json: true})
  .then(function (doc) {
    var pkg = new Package(doc)
    console.log(JSON.stringify(pkg, null, 2))
  })
```

You can also instantiate a nice package from `package.json` data:

```js
const Package = require('nice-package')
const pkg = new Package(require('node_modules/express/package.json'))

pkg.dependsOn('array-flatten')
// => true
```

### Convenience Methods

A nice package comes with convenience methods:

#### `pkg.mentions(query)`

* `query` String

Performs a case-insensitive search against the JSON-stringified object. Returns
a Boolean indicating whether the given query is present in the object.

#### `pkg.dependsOn(pkgName)`

* `pkgName` String - The name of another package

Returns a Boolean indicating whether the given `pkgName` is listed in `dependencies`.

#### `pkg.devDependsOn(pkgName)`

* `pkgName` String - The name of another package

Returns a Boolean indicating whether the given `pkgName` is listed in `devDependencies`.

#### `pkg.somehowDependsOn(pkgName)`

* `pkgName` String - The name of another package

Returns a Boolean indicating whether the given `pkgName` is listed in
`dependencies` or `devDependencies`.

#### `pkg.depNames`

A getter method that returns an array of the `dependencies` keys.

#### `pkg.devDepNames`

A getter method that returns an array of the `devDependencies` keys.

#### `pkg.allDepNames`

A getter method that returns an array of all the `dependencies` and
`devDependencies` keys.

## Validation

`nice-package` uses a [JSON schema](lib/schema.js) to validate packages.

The following properties are required:

- `name` String
- `description` String
- `version` String

To determine if a package is valid, use the `pkg.valid` getter method:

```js
pkg.valid
// => false
```

To see validation errors on a package, use the `pkg.validationErrors` getter method:

```js
pkg.validationErrors
```

The result is an array of
[revalidator errors](https://github.com/flatiron/revalidator#example).

## :sparkle: Dependency Data :sparkle:

`nice-package` will detect if you have installed the [dependent-packages](https://ghub.io/dependent-packages)
module. If it's require-able, the following three properties will be
attached to each nice package automatically:

- `dependents` - an array of the names of all packages that list the current package in their `dependencies` in `package.json`. If none, this becomes an empty array.
- `devDependents` - an array of the names of all packages that list the current package in their `devDependencies` in `package.json`. If none, this becomes an empty array.
- `totalDependents` - The sum length of the above arrays.


## Tests

```sh
npm install
npm test
```
## Dependencies

- [github-url-to-object](https://github.com/zeke/github-url-to-object): Extract user, repo, and other interesting properties from GitHub URLs
- [normalize-registry-metadata](https://github.com/npm/normalize-registry-metadata): clean package metadata objects you get from registry changes feeds
- [revalidator](https://github.com/flatiron/revalidator): A cross-browser / node.js validator powered by JSON Schema
- [semver](https://github.com/npm/node-semver): The semantic version parser used by npm.

## Dev Dependencies

- [dependent-packages](https://github.com/zeke/dependent-packages): Offline collection of the dependents and devDependents of every package in the npm registry.
- [require-dir](https://github.com/aseemk/requireDir): Helper to require() directories.
- [standard](https://github.com/feross/standard): JavaScript Standard Style
- [standard-markdown](https://github.com/zeke/standard-markdown): Test your Markdown files for Standard JavaScript Style™
- [tap-spec](https://github.com/scottcorgan/tap-spec): Formatted TAP output like Mocha's spec reporter
- [tape](https://github.com/substack/tape): tap-producing test harness for node and browsers

## License

MIT

## Credits

💛 Thanks to [emilyrose](https://github.com/emilyrose) for giving up
the `nice-package` name on npm.
