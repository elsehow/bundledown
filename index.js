var fs          = require('fs')
, path          = require('path')
, through       = require('through2')
, split         = require('split')
, duplexer      = require('duplexer2')
, includeRegex  = /@include\('.+'\)/g

function startsWith (str1, str2) {
  return str1[0] === str2
}

function baseDirOf (p) {
  return path.dirname(p)
}

function read (f) {
  if (startsWith(f, '/'))
    return fs.createReadStream(f)
  else
    return fs.createReadStream(f)
}

// return absolute filepath from include statement, given a root directory
//
//    getFilePath("@include('./my/path.md'", 'chapter1')
//    > 'chapter1/my/path.md'
//
function getFilePath (inclStatement, baseDir) {

  //ex.
  //    relPath('@include('./my/path')
  //    > './my/path'
  function relPath (inclStatement) {
    return inclStatement.match(/'.+'/g)[0].split('\'')[1]
  }

  // turn relative paths into absolute paths
  function absPath (relativePath, baseDir) {
    // remove leading period
    var p = relativePath.slice(1)
    return path.join(baseDir, p)
  }

  return absPath(
      relPath(inclStatement)
    , baseDir)
}

function recursivelyParseBuffer (baseDirectory) {

  function recurse (includeStatement) {
    var p       = getFilePath(includeStatement, baseDirectory)
    var base    = baseDirOf(p)
    return read(p)
      .pipe(split())
      .pipe(recursivelyParseBuffer(base))
  }

  function findInclude (buff) {
    var line    = buff.toString()
    var matches = line.match(includeRegex)
    if (matches)
      return matches[0]
    return
  }

  var input  = through()
  var output = through()
  input
    .pipe(through(function (buff, _, next) {
      var include = findInclude(buff)
      if (include) {
        var r = recurse(include)
        r.pipe(output, {end: false})
        r.on('end', next)
      }
      else {
        output.write(buff+'\n\n')
        next()
      }
    }, function () {
      output.end()
    }))

  return duplexer(input, output)
}

// takes a path , returns a stream
module.exports = (infile) => {
  return read(infile)
    .pipe(split())
    .pipe(recursivelyParseBuffer(baseDirOf(infile)))
}
