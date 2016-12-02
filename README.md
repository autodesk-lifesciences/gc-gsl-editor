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

This will build the client into `./client-build.js` and the server into `./server-build.js`.

For fast development, use...

```npm run watch-client```

This builds the debug version of the client (`./main.js`) and continues to watch the project for changes, recompiling on all changes. 

```npm run watch-server```

Similarly, this builds the debug version of the the server (`./server/router.js`) and continues to watch for server changes.

It is recommended that you use ``` npm link ``` as documented [here](https://github.com/Autodesk/genetic-constructor/blob/master/docs/extensions/npmLink.md) for faster development.

### Server

The routes exposed by this extension are imported into the main app server. It can be considered as an intermediate server that simply forwards requests to an external containerized GSL server located at `https://gsl.dev.bionano.autodesk.com/`. The external containerized server runs `Gslc`, writes output files in various formats in the external server. 

## Architecture

As shown below, at a high level, the GSL extension is made up of the following components:

1. The client : Displayed in the project details section of the Genetic constructor.

2. The intermediate (forwarding) server : A lightweight server that simply mediates between the GSL client extension in the browser and the remote external GSL server.

3. The GSL server : The GSL server does the heavy lifting of running the Gslc.exe command and producing output packages available for download. It is located at `https://gsl.dev.bionano.autodesk.com/`

Note: As shown in the diagram by the grey box, this repository includes functionality mentioned in (1) and (2) above 

![GSL System Diagram](https://cloud.githubusercontent.com/assets/7693347/20849396/56ab30c4-b88b-11e6-956a-28716a2b9013.png)

## Documentation

To learn more about the Genotype Specification Language, you could look at the documentation [here](https://geneticconstructor.readme.io/docs/genotype-specification-language) or in the GSL respository [here](https://github.com/AmyrisInc/Gslc/blob/master/README.md).

## Shortcuts
* ```Alt + Space``` lists the available keywords, snippets and Genes.
* ```Ctrl + Shift + S``` lists the available snippets.
* ```Cmd + F``` or ```Ctrl + F ``` brings up the search bar.
* ```Cmd + Enter ``` runs the code in the editor.