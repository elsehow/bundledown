# bundledown

recursively bundle arbitrary files!!!!

## installation

    npm install -g bundledown

## usage

make a markdown file:

```markdown

# my cool markdown document

lets bundle some markdown

@include('./src/other-markdown-file.md')

nice

```

now just

    bundledown index.md -o bundle.md
    
or, in js,

```js
var bundledown = require('bundledown')
var filePath = require('path').join(__dirname, 'myfile.md')
var readStream = require('fs').createReadStream(filePath)

bundledown(readStream).pipe(process.stdout)
```

## api

### bundledown(path)

recursively bundles the file at path. returns a stream.

## license

BSD
