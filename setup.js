'use strict';
/**
 * React Static Boilerplate
 * Copyright (c) 2015-present Kriasoft. All rights reserved.
 */

/* @flow */

const fs = require('fs');
const path = require('path');
const https = require('https');

let file, text;

//
// Inject "babel-plugin-styled-components"
// -----------------------------------------------------------------------------
file = path.resolve('./node_modules/babel-preset-react-app/index.js');
text = fs.readFileSync(file, 'utf8');

if (!text.includes('babel-plugin-styled-components')) {
  if (text.includes('const plugins = [')) {
    text = text.replace(
      'const plugins = [',
      "const plugins = [\n  require.resolve('babel-plugin-styled-components'),"); // prettier-ignore
    fs.writeFileSync(file, text, 'utf8');
  } else {
    throw new Error(`Failed to inject babel-plugin-styled-components in ${file}.`); // prettier-ignore
  }
}

//
// Inject "babel-plugin-transform-export-extensions"
// -----------------------------------------------------------------------------
file = path.resolve('./node_modules/babel-preset-react-app/index.js');
text = fs.readFileSync(file, 'utf8');

if (!text.includes('babel-plugin-transform-export-extensions')) {
  if (text.includes('const plugins = [')) {
    text = text.replace(
      'const plugins = [',
      "const plugins = [\n  require.resolve('babel-plugin-transform-export-extensions'),"); // prettier-ignore
    fs.writeFileSync(file, text, 'utf8');
  } else {
    throw new Error(`Failed to inject babel-plugin-transform-export-extensions in ${file}.`); // prettier-ignore
  }
}
