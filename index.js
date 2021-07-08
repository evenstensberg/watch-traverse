const fs = require("fs");
const path = require("path");
const acorn = require("acorn");
const walk = require("acorn-walk");

let importSet = new Set();
function traverseInitialTree(file) {
  let rootPath;
  const fileContents = fs.readFileSync(file, "utf8");
  const parsed = acorn.parse(fileContents, { ecmaVersion: 2020 });
  walk.full(parsed, (node) => {
    if (
      node.type === "VariableDeclaration" &&
      node.declarations[0] &&
      node.declarations[0].init.type === "CallExpression" &&
      node.declarations[0].init.callee.name === "require"
    ) {
      const importStatement = node.declarations[0].init.arguments[0].value;
      if (importStatement.includes(".") || importStatement.includes("..")) {
        let rootFP = file.split(path.sep);
        rootFP.pop();
        rootFP = rootFP.join("/");
        let importPath = path.resolve(rootFP, importStatement);
        rootPath = rootFP;
        const extName = path.extname(importPath);
        if (!extName) {
          importPath += ".js";
        }
        if (!importSet.has(importPath)) {
          importSet.add(importPath);
        }
      } else {
        let rootFP = file.split(path.sep);
        rootFP.pop();
        rootFP.push("node_modules");
        rootFP.push(importStatement);
        rootFP = rootFP.join("/");
        let pkgJson = path.resolve(rootFP, "package.json");
        try {
          let pkgJSONPath = require(pkgJson);
          fs.existsSync(pkgJSONPath);
          pkgJSONPath = pkgJSONPath.main;
          rootFP = rootFP.split("/");
          rootFP.push(pkgJSONPath);
          rootFP = rootFP.join("/");
          if (!importSet.has(rootFP)) {
            importSet.add(rootFP);
          }
        } catch (err) {
          rootFP = rootFP.split("/");
          rootFP.pop();
          rootFP.pop();
          rootFP.push(importStatement);
          try {
              const files = fs.readdirSync(rootFP.join("/"));
              files.forEach((file) => {
                const subPaths = path.resolve(rootFP.join("/"), file);
                if (!importSet.has(subPaths)) {
                  importSet.add(subPaths);
                }
              });
          } catch(subErr) {
       
          }
        }
      }
    }
  });
}

function traverseTree(file) {
  let rootPath;
  const fileContents = fs.readFileSync(file, "utf8");
  const parsed = acorn.parse(fileContents, { ecmaVersion: 2020 });
  walk.full(parsed, (node) => {
    if (
      node.type === "VariableDeclaration" &&
      node.declarations[0] &&
      node.declarations[0].init &&
      node.declarations[0].init.type === "CallExpression" &&
      node.declarations[0].init.callee.name === "require"
    ) {
      const importStatement = node.declarations[0].init.arguments[0].value;
      if (importStatement.includes(".") || importStatement.includes("..")) {
        let rootFP = file.split(path.sep);
        rootFP.pop();
        rootFP = rootFP.join("/");
        let importPath = path.resolve(rootFP, importStatement);
        rootPath = rootFP;
        const extName = path.extname(importPath);
        if (!extName) {
          importPath += ".js";
        }
        if (!importSet.has(importPath)) {
          importSet.add(importPath);
        }
      } else {
        let rootFP = file.split(path.sep);
        rootFP.pop();
        rootFP.push("node_modules");
        rootFP.push(importStatement);
        rootFP = rootFP.join("/");
        let pkgJson = path.resolve(rootFP, "package.json");
        try {
          let pkgJSONPath = require(pkgJson);
          fs.existsSync(pkgJSONPath);
          pkgJSONPath = pkgJSONPath.main;
          rootFP = rootFP.split("/");
          rootFP.push(pkgJSONPath);
          rootFP = rootFP.join("/");
          if (!importSet.has(rootFP)) {
            importSet.add(rootFP);
          }
        } catch (err) {
          rootFP = rootFP.split("/");
          rootFP.pop();
          rootFP.pop();
          rootFP.push(importStatement);

          try {
              const files = fs.readdirSync(rootFP.join("/"));
              files.forEach((file) => {
                const subPaths = path.resolve(rootFP.join("/"), file);
                if (!importSet.has(subPaths)) {
                  importSet.add(subPaths);
                }
              });
          } catch(subbErr) {
              
          }
        }
      }
    }
  });
}

function watchTraverse(file, cb) {
  let rootFP = traverseInitialTree(file);

  for (let key of importSet) {
    traverseTree(key);
  }

  for (let key of importSet) {
    console.log(key);
  }
}

module.exports = watchTraverse;
