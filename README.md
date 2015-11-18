# bundledown

include files in markdown c:

**NOTE**: this is a work in progress. PRs v welcome (:

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

