#!/usr/bin/env node

// TODO test with absolute paths
// TODO should work with e.g. '../../file.md'

var fs            = require('fs')
  , path          = require('path')
  , argv          = require('minimist')(process.argv.slice(2))
  , replaceStream = require('replacestream')
  , includeRegex  = /@include\('.+'\)/g

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

// extract relative paths from include steatement
function relPath (includeStatement) {
  return includeStatement.match(/'.+'/g)[0].split('\'')[1]
}

function bundledown (instream, outstream, baseDir) {

  // this fn is specific to a particular `baseDir`
  function getFilePath (includeStatement) {
    // turn relative paths into absolute paths 
    function absPath (relativePath) {
      // remove leading '.' ('./my-path' becomes '/my-path')
      var p = relativePath.slice(1)
      // join to the base dir
      return path.join(baseDir, p)
    }
    // return the absolute filepath from the includ estatement 
    return absPath(relPath(includeStatement))
  }

  // this is run everytime we find an include statement
  function replaceFn (includeStatement) {
    var absPath = getFilePath(includeStatement, baseDir)
    // call bundledown recursively on this path
    instream.pause()
    bundledown(read(absPath), outstream, baseDirOf(absPath))
    instream.resume()
  }

  var rs = replaceStream(includeRegex, replaceFn)

  instream.pipe(rs).pipe(outstream)
}


// usage: `bundledown my-file.md -o bundle.md`
var input   = argv._[0]
var output  = argv.o ? write(argv.o) : process.stdout
// recursively bundle the input file
bundledown(read(input), output, baseDirOf(input))
