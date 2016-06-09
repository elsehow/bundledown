#!/usr/bin/env node

// TODO should work with e.g. '../../file.md'

// usage: `bundledown my-file.md -o bundle.md`
var fs         = require('fs')
var argv       = require('minimist')(process.argv.slice(2))
var bundledown = require('./index')
var infile     = argv._[0]

function write (f) {
  return fs.createWriteStream(f)
}

var outstream  = argv.o ? write(argv.o) : process.stdout

bundledown(infile).pipe(outstream)
