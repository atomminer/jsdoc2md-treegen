#!/usr/bin/env node

const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs-extra')
const path = require('path');
const { Console } = require('console');

console.log(__dirname);
console.log(process.cwd());
const errorAndExit = (e) => {
	console.error('\x1b[31m', e, '\x1b[0m');
	process.exit(255);
}

// Banner
console.log('This is extension cli tool for jsdoc2md to generate project .md tree instead of dumping everything into a single file.');
console.log('All settings are picked up from .jsdoc2md-treegen.json configuration file.');
console.log('');

var conf = null;
try {
	conf = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), '.jsdoc2md-treegen.json')));
}
catch(e) {
	errorAndExit(e);
}

if(!conf) errorAndExit('Non-empty .jsdoc2md-treegen.json config file required. Cancelled.');
if(!conf.input) {
	conf.input = '**/*.js';
	console.warn('No input specified. Using **/*.js');
}
if(!Array.isArray(conf.input) && typeof conf.input !== 'string') errorAndExit('Input must be either filename, glob or array');
if(!conf.output) {
	conf.output = 'docs';
	console.log('No output folder specified. Using ./docs');
}

const outdir = path.resolve(process.cwd(), conf.output);
// delete all files and folders in output folder
if(conf.cleanOutput) {
	console.log(`Cleaning output folder "${conf.output}"...`);
	try {
		fs.emptyDirSync(outdir)
	}
	catch(e) {
		console.error(e);
	}
}

// jsdoc2md options
var options = conf.jsdoc2md || {};
if(!options.files) {
	if(Array.isArray(conf.input)) options.files = conf.input.join(' ');
	else options.files = conf.input;
}

const templateData = jsdoc2md.getTemplateDataSync(options);
const moduleNames = templateData.filter(({kind}) => kind === 'module').map(({name}) => name);


var indexTemplate = null;
var moduleTemplate = null;
//////////////////////////////////////////////////////////////////////////////////////////////
// Try loading single module template and index template
if(conf.moduleTemplate) {
	try {
		moduleTemplate = fs.readFileSync(path.resolve(process.cwd(), conf.moduleTemplate), 'utf8');
	}
	catch(e) {
		console.warn('Failed to load module template. Using deafult. Err: ', e);
	}
}

if(conf.indexTemplate) {
	try {
		indexTemplate = fs.readFileSync(path.resolve(process.cwd(), conf.indexTemplate), 'utf8');
	}
	catch(e) {
		console.warn('Failed to load index template. Using deafult. Err: ', e);
	}
}

var indexname = typeof conf.index === 'string' ? conf.index : 'index.md';
if(!indexname.toLowerCase().endsWith('.md')) indexname += '.md'

//////////////////////////////////////////////////////////////////////////////////////////////
// Write modules
const renderModule = (moduleName, data) => {
	const template = (moduleTemplate ? moduleTemplate.replace(/\$\{moduleName\}/g, moduleName) : 
		`{{#module name="${moduleName}"}}{{>docs}}{{/module}}`).replace(/\{\{treeindex\}\}/g, indexname);
	const moduleDocumentation = jsdoc2md.renderSync({data, template});

	try {
		const location = path.resolve(outdir, `${moduleName}.md`);
		fs.ensureFileSync(location);
		fs.writeFileSync(location, moduleDocumentation);
	}
	catch(e) {
		console.error(`Error processing ${moduleName}: `, e);
	}
}

for(var m of moduleNames) {
	const modulePath = path.join(conf.output, `${m}.md`);
	console.log(`Processing module ${m} --> ${modulePath}`);
	renderModule(m, templateData);
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Write index
if(conf.index) {
	const location = path.resolve(outdir, `${indexname}`);
	console.log(`Processing index --> ${indexname}`);
	
	var index = moduleNames.sort().map(moduleName => `* [${moduleName}](${moduleName}.md)`).join('\r\n');
	var template = indexTemplate;
	var pkg = {};
	try {
		const location = path.resolve(process.cwd(), 'package.json');
		pkg = JSON.parse(fs.readFileSync(location, 'utf8'));
	}
	catch(e) {
		console.warn('Error reading package.json');
	}

	if(!template) {
		template =  
`## {{name}} Reference API

{{description}}

#### Modules

{{index}}
`;
	}

	try {
		fs.ensureFileSync(location);
		var data = template.replace(/\{\{index\}\}/g, index)
				.replace(/\{\{version\}\}/g, pkg.version || '0.0.0')
				.replace(/\{\{name\}\}/g, pkg.name || '')
				.replace(/\{\{description\}\}/g, pkg.description || '')
		fs.writeFileSync(location, data);
	}
	catch(e) {
		console.error(`Error processing ${indexname}: `, e);
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////
// Write namepaths
if(conf.namepaths) {
	var filename = typeof conf.namepaths === 'string' ? conf.namepaths : 'namepaths.json';
	if(!filename.toLowerCase().endsWith('.json')) filename += '.json'
	const location = path.resolve(outdir, filename);
	console.log(`Generating namepaths --> ${filename}`);
	try {
		fs.ensureFileSync(location);
		fs.writeFileSync(location, JSON.stringify(templateData, null, 2));
	}
	catch(e) {
		console.error(`Error writing namepaths: `, e);
	}
}


