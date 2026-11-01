const fs = require("node:fs");
const path = require("node:path");
const { execFileSync, execFile } = require("node:child_process");
const { promisify } = require("node:util");
const { remote } = require("webdriverio");
const addContext = require("mochawesome/addContext");

const execFileAsync = promisify(execFile);

const bundleId =
  process.env.APP_BUNDLE_ID || "com.example.apple-samplecode.Backyard-Birds";

const SIMULATORS = [
  {
    name: "iPhone 16",
    udid: process.env.APPIUM_UDID_1 || "4A664D34-877C-46D0-9A5C-36E9B0F0DB7E",
    wdaLocalPort: 8100,
    mjpegServerPort: 9100,
  },
  {
    name: "iPhone 17",
    udid: process.env.APPIUM_UDID_2 || "6C4146A6-CC37-4906-BA50-F29DC7C322F4",
    wdaLocalPort: 8101,
    mjpegServerPort: 9101,
  },
];

function getSimulator() {
  const simulatorIndex =
    process.env.SIMULATOR_INDEX ?? process.env.APPIUM_SIMULATOR_INDEX ?? "0";
  const index = Number(simulatorIndex);
  if (!Number.isInteger(index) || index < 0 || index >= SIMULATORS.length) {
    throw new Error(
      `Invalid SIMULATOR_INDEX "${simulatorIndex}". Choose an index from 0 to ${SIMULATORS.length - 1}.`,
    );
  }
  return SIMULATORS[index];
}

function findSimulator(udid) {
  const list = JSON.parse(
    execFileSync(
      "xcrun",
      ["simctl", "list", "devices", "available", "--json"],
      {
        encoding: "utf8",
      },
    ),
  );
  return Object.values(list.devices)
    .flat()
    .find((device) => device.udid === udid);
}

async function bootSimulator({ name, udid }) {
  if (!findSimulator(udid)) {
    throw new Error(
      `Simulator ${name} (${udid}) was not found. Run xcrun simctl list devices and check the UDID.`,
    );
  }
  await execFileAsync("xcrun", ["simctl", "bootstatus", udid, "-b"], {
    timeout: 180000,
  });
}

async function getSimulatorAppearance(udid) {
  const { stdout } = await execFileAsync("xcrun", [
    "simctl",
    "ui",
    udid,
    "appearance",
  ]);
  return stdout.trim();
}

async function setSimulatorAppearance(udid, appearance) {
  if (!["light", "dark"].includes(appearance)) {
    throw new Error(`Unsupported simulator appearance "${appearance}".`);
  }

  await execFileAsync("xcrun", [
    "simctl",
    "ui",
    udid,
    "appearance",
    appearance,
  ]);
  const actualAppearance = await getSimulatorAppearance(udid);
  if (actualAppearance !== appearance) {
    throw new Error(
      `Could not set simulator ${udid} to ${appearance} appearance; it reports "${actualAppearance}".`,
    );
  }
}

function resolveAppPath() {
  const appPath = path.resolve(process.env.APP_PATH || "Backyard Birds.app");
  if (!fs.existsSync(appPath)) {
    throw new Error(
      `App bundle not found at ${appPath}. Set APP_PATH to the .app bundle location.`,
    );
  }
  return appPath;
}

async function createDriver(simulator) {
  const appPath = resolveAppPath();
  await bootSimulator(simulator);

  const capabilities = {
    platformName: "iOS",
    "appium:automationName": "XCUITest",
    "appium:deviceName": simulator.name,
    "appium:udid": simulator.udid,
    "appium:app": appPath,
    "appium:bundleId": bundleId,
    "appium:language": "en",
    "appium:locale": "en_US",
    "appium:isHeadless": process.env.APPIUM_HEADLESS !== "0",
    "appium:noReset": true,
    "appium:newCommandTimeout": 120,
    "appium:wdaLocalPort": simulator.wdaLocalPort,
    "appium:mjpegServerPort": simulator.mjpegServerPort,
    "appium:derivedDataPath": path.resolve("artifacts", "wda", simulator.udid),
  };

  return remote({
    hostname: process.env.APPIUM_HOST || "127.0.0.1",
    port: Number(process.env.APPIUM_PORT || 4723),
    path: process.env.APPIUM_PATH || "/wd/hub",
    logLevel: "warn",
    connectionRetryTimeout: Number(
      process.env.APPIUM_CONNECTION_RETRY_TIMEOUT || 120000,
    ),
    capabilities,
  });
}

// Boots both simulators and opens one Appium session on each, in parallel.
// Returns drivers in the same order as SIMULATORS.
async function createDrivers() {
  return Promise.all(SIMULATORS.map((simulator) => createDriver(simulator)));
}

async function closeDrivers(drivers) {
  await Promise.allSettled(
    drivers.filter(Boolean).map((d) => d.deleteSession()),
  );
}

async function captureScreenshot(driver, testContext, title) {
  const screenshotDir = path.resolve("artifacts/screenshots");
  fs.mkdirSync(screenshotDir, { recursive: true });

  const udid =
    driver.capabilities["appium:udid"] || driver.capabilities.udid || "device";
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const filename = `${slug}-${udid.slice(0, 8)}-${Date.now()}.png`;
  const screenshotPath = path.join(screenshotDir, filename);
  await driver.saveScreenshot(screenshotPath);
  if (fs.statSync(screenshotPath).size === 0) {
    throw new Error("The screenshot file is empty.");
  }

  addContext(testContext, {
    title,
    value: `../screenshots/${filename}`,
  });
  return screenshotPath;
}

module.exports = {
  SIMULATORS,
  bundleId,
  captureScreenshot,
  closeDrivers,
  createDriver,
  createDrivers,
  getSimulatorAppearance,
  getSimulator,
  setSimulatorAppearance,
};
