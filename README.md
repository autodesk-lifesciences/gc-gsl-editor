# GSL Editor

[GSL](http://pubs.acs.org/doi/abs/10.1021/acssynbio.5b00194) (Genotype Specification Language) is a programming language developed by [Amyris](https://amyris.com/) for the rapid design of high level DNA components. GSL is an open-source project, written in [F#](http://fsharp.org/) and is available on Git [here](https://github.com/Amyris/GSL).

This GSL Editor extension provides an interface to execute GSL code within the Genetic Constructor, and render the results as block constructs. It currently only supports the S288C Genome.

## Installation

### Client installation
First, install the module dependencies via npm.

```npm install```

### Server installation
* If you are running an instance of the server locally, you also need to install F# and mono by running the following installation helper script, present in the extension's root directory (`./gslEditor/`). 

    ```./tools/install-fsharp.sh```

    Alternatively, you could manually install them by following the instructions given for [Mac]( http://fsharp.org/use/mac/) or [Linux](http://fsharp.org/use/linux/). 

* As a part of the postinstall stage of the GSL extension, a [pre-built fork of the GSL repository](https://github.com/rupalkhilari/GSL-build) will be cloned and used by the extension's server to run GSL code. The development fork of the GSL repository can be found [here](https://github.com/rupalkhilari/GSL).


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

## System Diagram
As shown below, at a high level, the GSL extension is made up of a client (ReactJS, NodeJS) and a server (NodeJS).

![GSL System Diagram](http://goo.gl/S0npPy)
	
## Shortcuts
* ```Alt + Space``` lists the available keywords, snippets and Genes.
* ```Ctrl + Shift + S``` lists the available snippets.
* ```Cmd + F``` or ```Ctrl + F ``` brings up the search bar.
* ```Cmd + Enter ``` runs the code in the editor.
