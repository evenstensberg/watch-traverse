const fs = require("fs");
const dependencyTree = require('dependency-tree');

function watchTraverse(file, cb) {
  const fullFilePathFile = file.split('/');
  fullFilePathFile.pop();
  const directoryPath = fullFilePathFile.join('/');
  const list = dependencyTree.toList({
    directory: directoryPath,
    filename: file,
  });

  list.forEach( file => {
    fs.watchFile(file, cb);
  });
}

module.exports = watchTraverse;
