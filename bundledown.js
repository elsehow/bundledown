#!/usr/bin/env node

// TODO test with absolute paths
// TODO should work with e.g. '../../file.md'

var fs            = require('fs')
, path          = require('path')
, argv          = require('minimist')(process.argv.slice(2))
, through       = require('through')
//, replaceStream = require('replacestream')
, includeRegex  = /@include\('.+'\)/g

function startsWith (str1, str2) {
  return str1[0] === str2
}

function baseDirOf (p) {
  return path.dirname(p)
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

function recursivelyParseBuffer (buffer, baseDirectory, thru) {

  function recurse (splitText1, includeStatement, splitText2) {

    // part of the buffer that comes before include statement
    // push it to the main buffer
    thru.queue(new Buffer(splitText1))

    // include statement itself -
    // open the file it references,
    // and run each chunk of that through the same routine,
    // each time referring to our parent buffer here
    var p       = getFilePath(includeStatement, baseDirectory)
    var base    = baseDirOf(p)

    read(p)
      .pipe(through(function (b, _, newNext) {
        //console.log('hiiii', b.toString())
        recursivelyParseBuffer(b, base, thru)//, next)
        //newNext()
      }, function () {
        // part of buffer that comes after include statement
        thru.queue(new Buffer(splitText2))
      }))

  }

  var text      = buffer.toString()
  //console.log('hi', text)
  var pieces    = text.split(includeRegex)
  var matches   = text.match(includeRegex)
  if (matches) {
    recurse(pieces[0], matches[0], pieces[1])
  }
  else
    thru.queue(buffer)

  //next()
}

// usage: `bundledown my-file.md -o bundle.md`
var infile    = argv._[0]
var outstream = argv.o ? write(argv.o) : process.stdout

read(infile)
  .pipe(through(function (buff, _, next) {
    recursivelyParseBuffer(buff, baseDirOf(infile), this)
  }, function (cb) {
    //do nothin
  })).pipe(outstream)
