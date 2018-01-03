'use strict';

exports.__esModule = true;
exports.default = resolvePath;

var fs = require("fs");

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _pick = require("lodash.pick");

var _pick2 = _interopRequireDefault(_pick);

var _log = require('./log');

var _mapToRelative = require('./mapToRelative');

var _mapToRelative2 = _interopRequireDefault(_mapToRelative);

var _normalizeOptions = require('./normalizeOptions');

var _normalizeOptions2 = _interopRequireDefault(_normalizeOptions);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function findPathInRoots(sourcePath, { extensions, root }) {
  // Search the source path inside every custom root directory
  let resolvedSourceFile;

  root.some(basedir => {
    resolvedSourceFile = (0, _utils.nodeResolvePath)(`./${sourcePath}`, basedir, extensions);
    return resolvedSourceFile !== null;
  });

  return resolvedSourceFile;
}

function resolvePathFromRootConfig(sourcePath, currentFile, opts) {
  
  const absFileInRoot = findPathInRoots(sourcePath, opts);

  if (!absFileInRoot) {
    return null;
  }

  const realSourceFileExtension = _path2.default.extname(absFileInRoot);
  const sourceFileExtension = _path2.default.extname(sourcePath);

  // Map the source and keep its extension if the import/require had one
  const ext = realSourceFileExtension === sourceFileExtension ? realSourceFileExtension : '';
  return (0, _utils.toLocalPath)((0, _utils.toPosixPath)((0, _utils.replaceExtension)((0, _mapToRelative2.default)(opts.cwd, currentFile, absFileInRoot), ext, opts)));
}

function checkIfPackageExists(modulePath, currentFile, extensions) {
  return (0, _utils.nodeResolvePath)(modulePath, _path2.default.dirname(currentFile), extensions);
  if (resolvedPath === null) {
    (0, _log.warn)(`Could not resolve "${modulePath}" in file ${currentFile}.`);
  }
}

function checkIfDirExists(modulePath, currentFile) {
  const currentFolder = _path2.default.dirname(currentFile);
  return fs.existsSync(currentFolder + "/./" + modulePath.substr(0, modulePath.indexOf("{") ));
}

function replaceSiteKeys(str, replaceWith) {
  let repl = "\\{"+Object.keys(replaceWith).join("\\}|\\{")+"\\}";
  repl =  new RegExp(repl, "g");
  return str.replace(repl, function(matched){
    const match = matched.replace("{","").replace("}", "");
    return replaceWith[match];
  });
}
function resolvePathFromSiteConfig(sourcePath, currentFile, opts) {
  let aliasedSourceFile;
  const { site, defaultSite } = opts;
  if (sourcePath.indexOf("{") > -1) {
    if (!checkIfDirExists(sourcePath, currentFile)) {
      (0, _log.warn)(`Could not resolve directory to "${modulePath}" in file ${currentFile}.`);
      return sourcePath;
    }
    aliasedSourceFile = replaceSiteKeys(sourcePath, site);
    const fileResult = checkIfPackageExists(aliasedSourceFile, currentFile, opts.extensions);
    if (!fileResult) {

      const dynamicPaths = sourcePath.match(/\{(.*?)\}/g).map((p) => {
        return p.replace("{", "").replace("}", "");
      });

      const filteredSite = _pick2.default(site, dynamicPaths);
      const filteredDefaultSite = _pick2.default(defaultSite, dynamicPaths);
      
      const siteValues = Object.values(filteredSite).reverse();
      const defaultSiteValues = Object.values(filteredDefaultSite).reverse();
      
      const defaultSiteKeys = Object.keys(filteredDefaultSite).reverse();

      const foundIndex = siteValues.findIndex((val, index) => {
          if (val !== defaultSiteValues[index] && defaultSiteValues[index]) {
              return true;
          }
          return false;
      });
      if (foundIndex > -1) {
          const actualIndex = siteValues.length - (foundIndex + 1);
          const key = defaultSiteKeys.reverse()[actualIndex];
          const newSite = {...site};
          newSite[key] = defaultSiteValues.reverse()[actualIndex];
          const newOpts = { ...opts };
          newOpts.site = newSite;
          aliasedSourceFile = resolvePathFromSiteConfig(sourcePath, currentFile, newOpts);
      } else {
        aliasedSourceFile = replaceSiteKeys(sourcePath, defaultSite);
      }
      
    }
  }
  return aliasedSourceFile;
}

const resolvers = [resolvePathFromSiteConfig];

function resolvePath(sourcePath, currentFile, opts) {
  const normalizedOpts = (0, _normalizeOptions2.default)(currentFile, opts);

  const absoluteCurrentFile = _path2.default.resolve(currentFile);
  let resolvedPath = null;

  resolvers.some(resolver => {
    resolvedPath = resolver(sourcePath, absoluteCurrentFile, normalizedOpts);
    return resolvedPath !== null;
  });

  return resolvedPath;
}