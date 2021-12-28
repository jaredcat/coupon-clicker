const modules = {};
const path = require('path').join(__dirname);

require('fs')
  .readdirSync(path)
  .forEach(function (file) {
    modules[file.split('.')[0]] = require('./' + file);
  });

delete modules['index'];

module.exports = modules;
