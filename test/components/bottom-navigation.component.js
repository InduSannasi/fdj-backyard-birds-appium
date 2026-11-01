class BottomNavigation {
  constructor(driver) {
    this.driver = driver;
  }

  async open(tabName) {
    const page = JSON.stringify(tabName);
    const tab = await this.driver.$(
      `//XCUIElementTypeButton[@name=${page} or @label=${page}]`,
    );
    await tab.waitForDisplayed();
    await tab.click();
  }
}

module.exports = BottomNavigation;
