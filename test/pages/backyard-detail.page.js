const BasePage = require("./base.page");
const FavoriteButton = require("../components/favorite-button.component");

class BackyardDetailPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.favoriteButton = new FavoriteButton(driver);
  }

  async waitForBackyard(name) {
    return this.waitForLabel(name);
  }

  async openBirdFood() {
    const sunflowerSeeds = await this.birdFoodButton();
    await sunflowerSeeds.waitForDisplayed();
    await sunflowerSeeds.click();
    return this.waitForLabel("Bird Food");
  }

  async birdFoodButton() {
    return this.driver.$(
      '//XCUIElementTypeButton[contains(@label, "Sunflower Seeds")]',
    );
  }

  async hasBirdFoodButton() {
    return (await this.birdFoodButton()).isDisplayed();
  }

  async closeBirdFood() {
    await (await this.waitForLabel("Done")).click();
  }
}

module.exports = BackyardDetailPage;
