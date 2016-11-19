#!/usr/bin/env node

var prePackage = require('./package');
var fluid = require('fluid-publish');
prePackage.prepare();
fluid.dev(false, {devTag: 'nightly', changesCmd: 'git status -s -uno > /dev/null'});
prePackage.restore();
