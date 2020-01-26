const core = require("@actions/core");
const github = require("@actions/github");
const io = require("@actions/io");
const toolCache = require("@actions/tool-cache");
const exec = require("@actions/exec");

// try {
//   const nameToGreet = core.getInput("who-to-greet");
//   console.log(`Hello ${nameToGreet}!`);
//   const time = new Date().toTimeString();
//   core.setOutput("time", time);
//   const payload = JSON.stringify(github.context.payload, undefined, 2);
//   console.log(`The event payload: ${payload}`);
// } catch (error) {
//   core.setFailed(error.message);
// }

function getFlutterUrl(
  options = { version: "v1.12.13+hotfix.5", channel: "stable" }
) {
  const version = options.version || "v1.12.13+hotfix.5";
  const channel = options.channel || "stable";
  return `https://storage.googleapis.com/flutter_infra/releases/${channel}/linux/flutter_linux_v${version}-${channel}.tar.xz`;
}

async function downloadFlutter() {
  // Create a folder
  let cachedPath = toolCache.find("flutter", "v1.12.13+hotfix.5");
  console.log("Cached Path:", cachedPath);
  if (!cachedPath.trim()) {
    await io.mkdirP("flutter_sdk");
    const sdkFile = await toolCache.downloadTool(getFlutterUrl());
    await toolCache.extractTar("flutter_sdk", sdkFile, "xz");
    exec.exec("pwd");
    exec.exec("ls -l");
    exec.exec("ls -l flutter_sdk");
    const sdkDir = "flutter_sdk/flutter";
    cachedPath = toolCache.cacheDir(sdkDir);
  }
  core.exportVariable("FLUTTER_HOME", cachedPath);
  core.addPath(cachedPath);
}

downloadFlutter()
  .then(() => {})
  .catch(error => {
    console.log(error);
    core.setFailed(error.message);
  });

process.on("uncaughtException", err => {
  console.error(err.stack);
  console.log("Node NOT Exiting...");
  core.setFailed(error.message);
});
