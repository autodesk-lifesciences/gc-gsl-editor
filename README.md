# GSL Editor

[GSL](http://pubs.acs.org/doi/abs/10.1021/acssynbio.5b00194) (Genotype Specification Language) is a programming language developed by [Amyris](https://amyris.com/) for the rapid design of high level DNA components. GSL is an open-source project, written in [F#](http://fsharp.org/) and is available on Git [here](https://github.com/AmyrisInc/Gslc).

This GSL Editor extension provides an interface to execute GSL code within the Genetic Constructor, and render the results as block constructs. It currently supports the [S288C](http://www.yeastgenome.org/strain/S288C/overview), [BY4741](http://www.yeastgenome.org/strain/BY4741/overview) and [BY4742](http://www.yeastgenome.org/strain/BY4742/overview) genomes. To use a specific genome in your GSL code, preceed your code with a valid `#refgenome` statement (eg. To refer to genes from the S288C genome, use `#refgenome S288C`). More information on the GSL syntax [here](https://geneticconstructor.readme.io/docs/genotype-specification-language).

## Installation

Install the module dependencies via npm.

```npm install```

## Development

For a debuggable, non minified build run

```npm run debug```

Or, or for a minified production build run

```npm run release```

This will build the client into `./dist/index.js`.

For fast development, use...

```npm run watch```

This builds the debug version of the client (`./dist/index.js`) and continues to watch the project for changes, recompiling on all changes.

It is recommended that you use ``` npm link ``` as documented [here](https://github.com/Autodesk/genetic-constructor/blob/master/docs/extensions/npmLink.md) for faster development.

## Architecture

This consists of a stand-alone client package compiled into the Genetic Constructor application.

## Documentation

To learn more about the Genotype Specification Language, you could look at the documentation [here](https://geneticconstructor.readme.io/docs/genotype-specification-language) or in the GSL respository [here](https://github.com/AmyrisInc/Gslc/blob/master/README.md).

## Shortcuts
* ```Alt + Space``` lists the available keywords, snippets and Genes.
* ```Ctrl + Shift + S``` lists the available snippets.
* ```Cmd + F``` or ```Ctrl + F ``` brings up the search bar.
* ```Cmd + Enter ``` runs the code in the editor.