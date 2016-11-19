#!/usr/bin/env node

var prePackage = require('./package');
var fluid = require('fluid-publish');
prePackage.prepare();
var options = {
	devTag: 'nightly',
	changesCmd: 'git status -s -uno > /dev/null',
	publishCmd: 'npm publish --tag=nightly'
};
fluid.dev(false, options);
prePackage.restore();
