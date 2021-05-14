#!/usr/bin/env node

const debounce = require('lodash.debounce');
const chokidar = require('chokidar');
const program = require('caporal');
const fs = require('fs');
const path = require('path')
const { compileJava, compilePython, compileNode } = require('./utils')

const supportedFile = ['.js', '.java', '.py']


program
  .version('0.0.1')
  .argument('<filename>', 'Name of a file to execute')
  .action(async ({ filename }) => {
    const name = {
      filename: filename, ref: null
    };

    const fileType = path.extname(name.filename);
    if (!supportedFile.includes(fileType)) throw new Error(`Filetype of ${fileType} not supported.`)


    try {
      await fs.promises.access(name.filename);
    } catch (err) {
      throw new Error(`Could not find the file ${name.filename}`);
    }

    const start = debounce(() => {
      if (fileType === '.java') {
        compileJava(name);
      } else if (fileType === '.js') {
        compileNode(name);
      } else if (fileType === '.py') {
        compilePython(name);
      }

    }, 100);

    chokidar
      .watch(`*${fileType}`)
      .on('add', start)
      .on('change', start)
      .on('unlink', start);
  });

program.parse(process.argv);

