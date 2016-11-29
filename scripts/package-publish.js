#!/usr/bin/env node

var fs = require('fs');
var process = require('process');
var path = require('path');
var process = require('process');

var originalPath = path.join(process.cwd(), 'package.json');
var publishPath = path.join(__dirname, 'package.json');
var backupPath = path.join(process.cwd(), 'package-orig.json');

var Package = {

  prepare: function() {
	  
    var packageJson = require(originalPath);
    var packagePublish = require(publishPath);

    if (! packageJson) {
      throw new Error('Can\'t find package json');
    }

    if (! packagePublish) {
      throw new Error('Can\'t find package-publish json');
    }

    Object.assign(packageJson, packagePublish);

    // delete keys null
    for (var config in packageJson) {
      if (!packageJson[config]) {
        delete packageJson[config];
      }
    }

    fs.renameSync(originalPath, backupPath);
    fs.writeFileSync(originalPath, JSON.stringify(packageJson, null, 2));	
  },

  restore: function() {
    fs.renameSync(backupPath, originalPath);
  }
}

var argvJson = JSON.parse(process.env.npm_config_argv);

if (argvJson.original && argvJson.original.length > 2) {
  var method = argvJson.original[2].replace(/-/g, '');
  Package[method]();
  return;
}

module.exports = Package;
