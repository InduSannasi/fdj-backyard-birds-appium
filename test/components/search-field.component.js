class SearchField {
  constructor(driver) {
    this.driver = driver;
  }

  async element() {
    const field = await this.driver.$(
      "//XCUIElementTypeSearchField | //XCUIElementTypeTextField",
    );
    await field.waitForDisplayed({ timeout: 5000 });
    return field;
  }

  async isDisplayed() {
    return (await this.element()).isDisplayed();
  }

  async enter(text) {
    await (await this.element()).setValue(text);
  }

  async value() {
    return (await this.element()).getValue();
  }

  async clear() {
    await (await this.element()).clearValue();
  }
}

module.exports = SearchField;
