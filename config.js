const yaml = require('js-yaml');
const fs   = require('fs');

const config = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));
export config;
