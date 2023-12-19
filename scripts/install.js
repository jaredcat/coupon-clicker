#!/usr/bin/env node

const fs = require('fs');
const filename =
  'node_modules/puppeteer-extra-plugin-recaptcha/dist/provider/2captcha-api.js';

var data = fs.readFileSync(filename).toString().split('\n');
for (var i = 0; i < data.length; i++) {
  if (data[i].startsWith('var SOFT_ID')) {
    data[i] = "var SOFT_ID = '4022';";
    break;
  }
}
fs.writeFile(filename, data.join('\n'), function (err) {
  if (err) return console.log(err);
});
