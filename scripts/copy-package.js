var fs = require('fs');
var process = require('process');
var path = require('path');
var process = require('process');

var packageJson = require(path.join('..', 'package.json'));
var readme = fs.readFileSync(path.join(process.cwd(), 'README.md'));

if (! packageJson) {
  throw new Error('Can\'t find package json');
}

if (! readme) {
  throw new Error('Can\'t find README.md');
}

delete packageJson.devDependencies;
delete packageJson.dependencies;
delete packageJson.scripts;

fs.writeFile('./dist/package.json', JSON.stringify(packageJson, null, 2));

fs.writeFile('./dist/README.md', readme);
