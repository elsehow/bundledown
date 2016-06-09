var test = require('tape')
  , fs = require('fs')
  , path = require('path')
  , concat = require('concat-stream')
  , bundledown = require('..')

function relPath (dir, f) {
  return path.join(__dirname,  dir, f)
}

function file (dir, f) {
  return fs.readFileSync(relPath(dir, f))
}

test('simple example should be ok', function (t) {
  t.plan(1)
  var correct   = file('simple', 'correct.md')
  var generated = file('simple', 'bundle.md')
  t.deepEquals(correct.toString(), generated.toString())
})



test('advanced example should be ok', function (t) {
  t.plan(1)
  var correct   = file('advanced', 'correct.md')
  var generated = file('advanced', 'bundle.md')
  t.deepEquals(correct.toString(), generated.toString())
})


test('try a programmatic example', t => {
  t.plan(2)
  function handle (buff) {
    var correct = file('advanced', 'correct.md')
    t.deepEquals(correct, buff)
  }
  t.ok(bundledown)
  var p = relPath('advanced', 'index.md')
  bundledown(p).pipe(concat(handle))
})
