const BasePage = require("./base.page");
const SearchField = require("../components/search-field.component");
const BackyardDetailPage = require("./backyard-detail.page");

const backyardNames = [
  "Bird Springs",
  "Feathered Friends",
  "Calm Palms",
  "Chrip Center",
  "Quiet Haven",
];

class BackyardsPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.searchField = new SearchField(driver);
  }

  async waitUntilOpen() {
    return this.waitForLabel("Backyards");
  }

  async displayedCardNames() {
    const displayed = [];
    for (const name of backyardNames) {
      const card = await this.elementByLabel(name);
      if (await card.isDisplayed()) {
        displayed.push(name);
      }
    }
    return displayed;
  }

  async openBackyard(name) {
    await (await this.waitForLabel(name)).click();
    const detailPage = new BackyardDetailPage(this.driver);
    await detailPage.waitForBackyard(name);
    return detailPage;
  }

  async returnFromDetail() {
    const backButton = await this.driver.$(
      '//XCUIElementTypeButton[@label="Back" or @name="Back"]',
    );
    if (await backButton.isDisplayed()) {
      await backButton.click();
    } else {
      await this.driver.back();
    }
    await this.waitUntilOpen();
  }

  async scrollCardIntoView(name, direction, maxSwipes = 20) {
    for (let i = 0; i < maxSwipes; i++) {
      const card = await this.elementByLabel(name);
      if (await card.isDisplayed()) {
        return card;
      }
      await this.driver.execute("mobile: swipe", { direction });
      await this.driver.pause(600);
    }

    const card = await this.elementByLabel(name);
    if (await card.isDisplayed()) {
      return card;
    }

    throw new Error(`"${name}" was not found after ${maxSwipes} swipes.`);
  }
}

BackyardsPage.names = backyardNames;

module.exports = BackyardsPage;
