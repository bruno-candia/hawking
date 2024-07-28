const path = require("path");

const moduleAlias = require("module-alias");

const rootDir = path.resolve(__dirname, "..");
const distDir = path.resolve(rootDir, "");

moduleAlias.addAliases({
  "@src": path.join(distDir, ""),
});
