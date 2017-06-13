#!/usr/bin/env node

var execSync = require('child_process').execSync;
var changelogCommand = './node_modules/.bin/conventional-changelog -p angular';
var changelogContent = execSync(changelogCommand).toString();

var GithubApi = require('github');
var packageJSON = require('../package.json');
var token = process.argv[2] ? process.argv[2] : null;

var github = new GithubApi({
  version: '3.0.0'
});

github.authenticate({
  type: 'oauth',
  token: token || process.env.GH_TOKEN
});

github.releases.createRelease({
  owner: 'mbamobi',
  repo: packageJSON.name.split('/')[1],
  target_commitish: 'master',
  tag_name: 'v' + packageJSON.version,
  name: packageJSON.version,
  body: changelogContent,
  prerelease: false
}, function(err, data) {
  if (err) console.log('error: ' + err);
  console.log(data);
});
