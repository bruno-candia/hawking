import fs from "fs";
import path from "path";

const ERROR_PLATFORM_NOT_SUPPORT = new Error("platform not support");
const ERROR_NO_INSTALLATIONS_FOUND = new Error("no chrome installations found");

function canAccess(file: fs.PathLike) {
  if (!file) {
    return false;
  }

  try {
    fs.accessSync(file);
    return true;
  } catch (e) {
    return false;
  }
}

function win32() {
  const installations: string[] = [];
  const suffixes = [
    "\\Google\\Chrome SxS\\Application\\chrome.exe",
    "\\Google\\Chrome\\Application\\chrome.exe",
    "\\chrome-win32\\chrome.exe",
    "\\Chromium\\Application\\chrome.exe",
    "\\Google\\Chrome Beta\\Application\\chrome.exe",
  ];
  const prefixes = [
    process.env.LOCALAPPDATA,
    process.env.PROGRAMFILES,
    process.env["PROGRAMFILES(X86)"],
  ];

  prefixes.forEach((prefix) =>
    suffixes.forEach((suffix) => {
      if (prefix) {
        const chromePath = path.join(prefix, suffix);
        if (canAccess(chromePath)) {
          installations.push(chromePath);
        }
      }
    }),
  );
  return installations;
}

export function findChrome() {
  const { platform } = process;
  let installations: string[] = [];
  switch (platform) {
    case "win32":
      installations = win32();
      break;
    // case 'darwin':
    //   installations = require('./darwin')();
    //   break;
    // case 'linux':
    //   installations = require('./linux')();
    //   break;
    default:
      throw ERROR_PLATFORM_NOT_SUPPORT;
  }
  if (installations.length) {
    return installations[0];
  } else {
    throw ERROR_NO_INSTALLATIONS_FOUND;
  }
}
