import { Site } from 'src/common/Site';

const modules: Site[] = [];
const path = require('path').join(__dirname);

require('fs')
  .readdirSync(path)
  .forEach(function (file: string) {
    const name = file.split('.')[0];
    if (name === 'index') return;

    modules.push({
      name,
      run: require('./' + file).default,
    });
  });

export default modules;
