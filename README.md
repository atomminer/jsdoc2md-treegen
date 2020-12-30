[![node version](https://img.shields.io/badge/node-%3E%3D%2010.0.0-brightgreen?style=plastic)](https://img.shields.io/badge/node-%3E%3D%2010.0.0-brightgreen?style=plastic) [![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/atomminer/jsdoc2md-treegen?style=plastic)](https://img.shields.io/github/languages/code-size/atomminer/jsdoc2md-treegen?style=plastic) [![DeepScan grade](https://deepscan.io/api/teams/12301/projects/15297/branches/303459/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=12301&pid=15297&bid=303459)

## jsdoc2md-treegen

`jsdoc2md-treegen` is a simple `jsdoc2md` cli wrapper to generate markdown module tree with index.  While `jsdoc2md` is really nice and useful tool, it doesn't feel like a good idea to dump literally everything into a single .md file. markdown tree seems to be more intuitive and convenient to navigate through.

#### Installtion
```bash
npm install -g atomminer/jsdoc2md-treegen
```
### How it works
Add `.jsdoc2md-treegen.json` in your project root and run `jsdoc2md-treegen` to generate markdown tree. No command line arguments required nor supported. Everything is taken from `.jsdoc2md-treegen.json` and `package.json` files to generate API documentation for your project.

Generated markdown tree structure follows `@module` definitions, not the source file location, which provides enough flexibility to create logical and readable API docs.  For example,
source file located at `src/helpers/my_view.js` with following module definition:
```js
/**
* My super cool view controller
* @module  myproject/controllers/myview
* @typicalname controller
*/
```
Will be translated to `docs/myproject/controllers/myview.md` in the documentation tree.

#### .jsdoc2md-treegen.json configuration file
| Name | Type | Default | Description |
| --- | --- | --- | --- |
|output|`string`|`'docs'`| Output documentation folder. docs will be used if missing|
|cleanOutput|`boolean`|`false`| Empty output folder on start. :warning::warning::warning: will remove _**all**_ files and folders in the output folder if `true` :warning::warning::warning: |
|input|`string|Array`|`'src/**/*.js'`| Filepaths (`**` glob matching supported) of javascript source files to parse. Passed to `jsdoc2md.files`. |
|index|`boolean|string`|`false`| Documentation index filename. If `true` `index.md` will be created. Ex: `'README.md'`|
|indexTemplate|`boolean|string`|`false`| Optional documentation index template filename. |
|moduleTemplate|`boolean|string`|`false`| Optional single module template filename. |
|namepaths|`boolean|string`|`false`| JSON namepaths output filename. `namepaths.json` will be used if `true`. |
|jsdoc2md|`Object`|`{}`| `jsdoc2md` [options object](https://github.com/jsdoc2md/jsdoc-to-markdown/blob/master/docs/API.md#jsdoctomarkdown-) Passed directly to `jsdoc2md` |

#### Default templates
#####  Single module default template
```
{{#module name="${moduleName}"}}
{{>docs}}
{{/module}}
```
where `${moduleName}` is replaced with the current module name. 

To add header and footer:
```
![node version](https://img.shields.io/badge/node-%3E%3D%2010.0.0-brightgreen?style=plastic)
---

{{#module name="${moduleName}"}}
{{>docs}}
{{/module}}

---
Copyright (c) 2020 AtomMiner
```
#####  Index default template
```
## {{name}} Reference API

{{description}}

#### Modules

{{index}}
```
`{{name}}` and `{{description}}` will be taken from `package.json` and `{{index}}` will be replaced with the actual index.

#### Examples
`jsdoc2md-treegen` follows `@module` names to build project tree structure. For example, following set of source files:
```
📂 src
┣ 📜transport.js   		// * @module  transport
┣ 📜tcp.js				// * @module  tcp/tcp
```
will generate following markdown tree because `tcp.js` module definition `@module  tcp/tcp`.
```
📂 docs
┣ 📂 tcp
┣ ┗ 📜tcp.md
┣ 📜transport.md
┣ 📜index.md
┣ 📜namepaths.json
```
---
To setup npm scripts, simly add `.jsdoc2md-treegen.json`(can be empty JSON object `{}` for all default settings) to your project and add script to `package.json`:
```json
"scripts": {
  ...
  "gen-docs": "jsdoc2md-treegen"
},
```
then, to (re)generate your project documentation run:
```bash
npm run gen-docs
```

---
Copyright (c) 2020 AtomMiner. This project is released under MIT license.