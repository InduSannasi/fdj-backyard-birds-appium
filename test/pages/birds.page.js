const BasePage = require("./base.page");
const BottomNavigation = require("../components/bottom-navigation.component");
const SearchField = require("../components/search-field.component");

class BirdsPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.navigation = new BottomNavigation(driver);
    this.searchField = new SearchField(driver);
  }

  async open() {
    await this.navigation.open("Birds");
    await this.waitForLabel("Birds");
  }

  async waitForTitle() {
    return this.waitForLabel("Birds");
  }

  async hummingbirdListItem() {
    return this.driver.$(
      '(//XCUIElementTypeStaticText[@name="Hummingbird"])[1]',
    );
  }

  async visibleResultsByName(name) {
    const results = await this.driver.$$(
      `//XCUIElementTypeStaticText[contains(@name, ${JSON.stringify(name)})]`,
    );
    const visible = [];
    for (const result of results) {
      if (await result.isDisplayed()) {
        visible.push(result);
      }
    }
    return visible;
  }
}

module.exports = BirdsPage;
