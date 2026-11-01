const {
  bundleId,
  captureScreenshot,
  createDriver,
} = require("../configs/config-driver");

function registerAppHooks({ simulator, setDriver, onSessionCreated }) {
  let driver;

  before(async function () {
    driver = await createDriver(simulator);
    setDriver(driver);
    onSessionCreated(driver);
  });

  beforeEach(async function () {
    if (!driver) {
      return;
    }

    await driver.terminateApp(bundleId);
    await driver.activateApp(bundleId);
    const home = await driver.$("~Backyards");
    await home.waitForDisplayed();
  });

  afterEach(async function () {
    if (this.currentTest.state !== "failed" || !driver) {
      return;
    }

    try {
      await captureScreenshot(
        driver,
        this,
        `Failure screenshot (${simulator.name})`,
      );
    } catch (error) {
      console.error(
        `Could not capture or attach failure screenshot on ${simulator.name}: ${error.message}`,
      );
    }
  });

  after(async function () {
    if (driver) {
      await driver.deleteSession();
      driver = undefined;
      setDriver(undefined);
    }
  });
}

module.exports = registerAppHooks;
