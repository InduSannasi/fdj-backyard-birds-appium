class FavoriteButton {
  constructor(driver) {
    this.driver = driver;
  }

  async element() {
    const button = await this.driver.$(
      '//XCUIElementTypeButton[@label="Favorite"]',
    );
    return (await button.isDisplayed()) ? button : null;
  }

  async click() {
    const button = await this.element();
    if (!button) {
      throw new Error("Favorite button is not visible.");
    }
    await button.click();
  }

  async isOn() {
    const button = await this.element();
    if (!button) {
      throw new Error("Favorite button is not visible.");
    }

    return (await button.getAttribute("value")) === "1";
  }
}

module.exports = FavoriteButton;
