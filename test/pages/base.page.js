class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async elementByLabel(label) {
    const accessibilityId = await this.driver.$(`~${label}`);
    if (await accessibilityId.isExisting()) {
      return accessibilityId;
    }

    const name = JSON.stringify(label);
    return this.driver.$(
      `-ios predicate string:label == ${name} OR name == ${name} OR value == ${name}`,
    );
  }

  async waitForLabel(label, timeout = 10000) {
    const element = await this.elementByLabel(label);
    await element.waitForDisplayed({ timeout });
    return element;
  }

  async visibleLabels() {
    const elements = await this.driver.$$(
      "//XCUIElementTypeStaticText | //XCUIElementTypeButton | //XCUIElementTypeCell",
    );
    const labels = [];
    for (const element of elements) {
      if (!(await element.isDisplayed())) {
        continue;
      }
      const label =
        (await element.getAttribute("label")) ||
        (await element.getAttribute("name"));
      if (label) {
        labels.push(label.trim());
      }
    }
    return [...new Set(labels)];
  }
}

module.exports = BasePage;
