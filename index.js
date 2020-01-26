const core = require("@actions/core");
const github = require("@actions/github");
const io = require("@actions/io");
const toolCache = require("@actions/tool-cache");
const exec = require("@actions/exec");
const fs = require("fs");

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
  return `https://storage.googleapis.com/flutter_infra/releases/${channel}/linux/flutter_linux_${version}-${channel}.tar.xz`;
}

async function downloadFlutter() {
  // Create a folder
  let cachedPath = toolCache.find("flutter", "1.12.13");
  console.log("Cached Path:", cachedPath);
  if (!cachedPath.trim()) {
    const url = getFlutterUrl();
    console.log("Dowloading Flutter from", url);
    const sdkFile = await toolCache.downloadTool(url);
    console.log("SDK File", sdkFile);
    await toolCache.extractTar(sdkFile, "flutter-sdk", "x");
    cachedPath = await toolCache.cacheDir(
      "flutter-sdk/flutter",
      "flutter",
      "1.12.13"
    );
  }
  core.exportVariable("FLUTTER_HOME", `${cachedPath}`);
  core.addPath(`${cachedPath}/bin`);
  try {
    await exec.exec("flutter --version");
  } catch (error) {
    console.log("Here is an error");
    console.log(error);
    core.error(error);
  }
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
