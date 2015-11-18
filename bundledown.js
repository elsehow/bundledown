#!/usr/bin/env node

// TODO test with absolute paths

var fs            = require('fs')
  , path          = require('path')
  , argv          = require('minimist')(process.argv.slice(2))
  , replaceStream = require('replacestream')

function baseDirOf (p) {
  return path.dirname(p)
}

function startsWith (str1, str2) {
  return str1[0] === str2
}

function pathTo (f) {
  return path.join(__dirname, f)
}

function read (f) {
  return fs.createReadStream(pathTo(f))
}

function write (f) {
  return fs.createWriteStream(pathTo(f))
}

function bundledown (instream, outstream, baseDir) {

  function replaceFn () {

    // the paths in the require statements are relative to the file being req'd
    function getRelPath (reqStatement) {
      return reqStatement
        // get the './path/whatever.md' from req statement
        .match(/'.+'/g)[0]
        // get the path between the quotes
        .split('\'')[1]
    }

    function getAbsPath (relativePath) {
      // remove leading '.' ('./my-path' becomes '/my-path')
      var p = relativePath.slice(1)
      // join to the base dir
      return path.join(baseDir, p)
    }

    var reqExp  = arguments[0]
    var relPath = getRelPath(reqExp)
    // TODO should work with e.g. '../../file.md'
    var absPath = getAbsPath(relPath)
    // call bundledown recursively on this path
    // TODO -- how do we 'interrupt' the stream currently being written?
    bundledown(read(absPath), outstream, baseDirOf(absPath))
  }

  instream
    .pipe(replaceStream(/@include\('.+'\)/g, replaceFn))
    .pipe(outstream)
}

// usage: `bundledown my-file.md -o bundle.md`
var input   = argv._[0]
var output  = argv.o ? write(argv.o) : process.stdout
// recursively bundle the input file
bundledown(read(input), output, baseDirOf(input))
