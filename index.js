const fs = require("fs");
const path = require("path");
const acorn = require("acorn");
const walk = require("acorn-walk")
const jsonAstParser = require('json-to-ast');

function getRelativePathFromRoot(file) {
  const fp = file.split(path.sep);
  const isWin = process.platform === "win32";
  let relativePath;
  if (!isWin) {
    fp.pop();
    const sep = "/";
    const fpJoined = fp.join(sep);
    relativePath = path.resolve(fpJoined);
    return relativePath;
  }
  const sep = "/\\/";
  const fpJoined = fp.join(sep);
  return path.resolve(fpJoined);
}

function traverseTree(file) {
  let dependencySet = new Set();
  const extNameRoot = path.extname(file);

  const fileContents = fs.readFileSync(file, "utf8");
  if(extNameRoot === '.json') {
    const settings = {
      loc: true,
    };
    const parsedJSON = jsonAstParser(JSON.stringify(fileContents), settings);
    return dependencySet;
  }
  const parsed = acorn.parse(fileContents,  { ecmaVersion: 2020 });
  let relativePath = getRelativePathFromRoot(file);
  walk.full(parsed, (node) => {
    if (
      node.type === "VariableDeclaration" &&
      node.declarations[0] &&
      node.declarations[0].init &&
      node.declarations[0].init.type === "CallExpression" &&
      node.declarations[0].init.callee.name === "require"
    ) {
      const requireStatement = node.declarations[0].init.arguments[0].value;
      if (
        requireStatement.charAt(0) === "." &&
        requireStatement.charAt(1) === "/"
      ) {
        const extName = path.extname(requireStatement);
        try {
          let pathToRequireModule;
          if (extName) {
            pathToRequireModule = path.resolve(relativePath, requireStatement);
          } else {
            const requireStatementWithExt = requireStatement + ".js";
            pathToRequireModule = path.resolve(
              relativePath,
              requireStatementWithExt
            );
          }
          require.resolve(pathToRequireModule);
          dependencySet.add(pathToRequireModule);
        } catch (extErr) {
          pathToRequireModule = path.resolve(relativePath, requireStatement);
          const pathToModule = require.resolve(pathToRequireModule);
          dependencySet.add(pathToModule);
        }
      } else if (
        requireStatement.charAt(0) === "." &&
        requireStatement.charAt(1) === "." &&
        requireStatement.charAt(2) === "/"
      ) {
        const extName = path.extname(requireStatement);
        let pathToRequireModule;
        try {
          if (extName) {
            pathToRequireModule = path.resolve(relativePath, requireStatement);
          } else {
            const requireStatementWithExt = requireStatement + ".js";
            pathToRequireModule = path.resolve(
              relativePath,
              requireStatementWithExt
            );
          }
          dependencySet.add(pathToRequireModule);
        } catch (extErr) {
          pathToRequireModule = path.resolve(relativePath, requireStatement);
          const pathToModule = require.resolve(pathToRequireModule);
          dependencySet.add(pathToModule);
        }
      } else {
        require.main.paths.unshift(relativePath);
        try {
          const pathToResolve = path.resolve(
            relativePath,
            "node_modules",
            requireStatement
          );
          require.main.paths.unshift(pathToResolve);
          const resolvedPath = require.resolve(pathToResolve);
          dependencySet.add(resolvedPath);
        } catch (resolveErr) {}
      }
    }
  });
  return dependencySet;
}

function watchTraverse(file, cb) {
  let dependencySet = traverseTree(file);
  for (let key of dependencySet) {
    let subDependencySet = [...traverseTree(key)];
    subDependencySet.forEach((setItem) => {
      if (!dependencySet.has(setItem)) {
        dependencySet.add(setItem);
      }
    });
  }

    for (let key of dependencySet) {
    fs.watchFile(key, cb);
  }
}

module.exports = watchTraverse;
