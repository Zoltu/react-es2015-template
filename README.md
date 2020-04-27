# react-es2015-template
A skeleton for un-bundled react projects.

## Install
_this command will do an `npm install` for you_
```bash
npm run vendor
```

## Build
```bash
npm run build
```

## Watch
```bash
npm run watch
```

## Serve
```bash
npm run serve
```

No bundler, pure ES2015 modules loaded directly into the browser.  It uses es-module-shims for import map support (not yet implemented in any browsers) but otherwise doesn't use any special loaders, bundlers, file servers, etc.  Hosting is done via a static file server, you could use any static file server you wanted but I chose http-server because it is small and simple.

The one caveat with this project is the vendoring of dependencies.  If you add a runtime dependency, you will need to manually add it to the array at the top of `build/vendor.ts`.  Just create an entry in the array specifying the dependency package name, the path within the package that should be copied (whole folder will be vendored, usually this is a dist or out folder), and the relative path to the index file and then (from the root directory) run `npm run vendor`.  This will generate the runtime import map and embed it into your `index.html` file so the browser can turn `import { ... } from 'my-package'` into `import { ... } from './vendor/my-package/index.js'`.
