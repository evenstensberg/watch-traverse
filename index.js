const fs = require("fs");
const path = require("path");
const acorn = require("acorn");
const walk = require("acorn-walk");
var nodeResolve = require("node-resolve");
let importSet = new Set();

function firstPass(file) {
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
    }
  });
}

function traverseTree(file) {
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
    }
  });
}

function watchTraverse(file, cb) {
  let rootFP = firstPass(file);

  for (let key of importSet) {
    traverseTree(key);
  }

  for (let key of importSet) {
    console.log(key);
  }
}

module.exports = watchTraverse;
