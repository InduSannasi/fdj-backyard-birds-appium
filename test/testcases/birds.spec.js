const assert = require("node:assert/strict");
const { getSimulator } = require("../configs/config-driver");
const registerAppHooks = require("../support/app-hooks");
const BirdsPage = require("../pages/birds.page");

let driver;
let birdsPage;

describe("Tests for Birds Page", function () {
  registerAppHooks({
    simulator: getSimulator(),
    setDriver(session) {
      driver = session;
    },
    onSessionCreated(session) {
      birdsPage = new BirdsPage(session);
    },
  });

  it("F2 — shows the Birds title, search bar and content list", async function () {
    await birdsPage.open();
    assert.ok(await (await birdsPage.waitForTitle()).isDisplayed());
    assert.ok(await birdsPage.searchField.isDisplayed());
    const hummingbird = await birdsPage.hummingbirdListItem();
    assert.ok(
      await hummingbird.isDisplayed(),
      "Hummingbird is not visible in the Birds content list.",
    );
  });

  it("F3 — searches the Birds tab for dove", async function () {
    await birdsPage.open();
    await birdsPage.searchField.enter("Dove");
    assert.ok(
      (await birdsPage.searchField.value()).toLowerCase().includes("dove"),
      'The Birds search field does not contain "dove".',
    );

    const doveResults = await birdsPage.visibleResultsByName("Dove");
    assert.ok(
      doveResults.length >= 1,
      `Expected at least one visible Dove result; found ${doveResults.length}.`,
    );
  });

  it("F12 — captures a screenshot when the search bar visibility check fails", async function () {
    await birdsPage.open();
    assert.equal(
      await birdsPage.searchField.isDisplayed(),
      false,
      "F12 intentionally expects the visible search bar to be hidden.",
    );
  });
});
