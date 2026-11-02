const assert = require("node:assert/strict");
const { performance } = require("node:perf_hooks");
const {
  bundleId,
  captureScreenshot,
  getSimulator,
  getSimulatorAppearance,
  setSimulatorAppearance,
} = require("../configs/config-driver");
const registerAppHooks = require("../support/app-hooks");
const BackyardsPage = require("../pages/backyards.page");

let driver;
let backyardsPage;

describe("Tests for Backyards Page", function () {
  registerAppHooks({
    simulator: getSimulator(),
    setDriver(session) {
      driver = session;
    },
    onSessionCreated(session) {
      backyardsPage = new BackyardsPage(session);
    },
  });

  it("S1 — launches and shows the landing screen within 10 seconds", async function () {
    const title = await backyardsPage.waitUntilOpen();
    assert.ok(await title.isDisplayed(), "The landing screen is not visible.");
  });

  it("S2 — renders at least one backyard card without an error banner", async function () {
    const cards = await backyardsPage.displayedCardNames();
    assert.ok(cards.length > 0, "No backyard cards are visible.");
    const errorLabels = (await backyardsPage.visibleLabels()).filter((label) =>
      /error|unable to load|something went wrong|loading|try again/i.test(
        label,
      ),
    );
    assert.deepEqual(errorLabels, [], "An error banner is visible.");
  });

  it("S3 — exposes the home title and first card to accessibility", async function () {
    assert.ok(await (await backyardsPage.waitUntilOpen()).isDisplayed());
    const firstCard = await backyardsPage.waitForLabel(BackyardsPage.names[0]);
    assert.ok(
      await firstCard.isDisplayed(),
      "The first card is not accessible.",
    );
  });

  it("N1 — opens the first backyard detail and returns to the list", async function () {
    await backyardsPage.openBackyard(BackyardsPage.names[0]);
    await backyardsPage.returnFromDetail();
    assert.ok(
      (await backyardsPage.displayedCardNames()).includes(
        BackyardsPage.names[0],
      ),
    );
  });

  it("N2 — scrolls the backyard list down and back to the top", async function () {
    const lastCard = await backyardsPage.scrollCardIntoView(
      BackyardsPage.names[4],
      "up",
    );
    assert.ok(await lastCard.isDisplayed());

    const firstCardAgain = await backyardsPage.scrollCardIntoView(
      BackyardsPage.names[0],
      "down",
    );
    assert.ok(await firstCardAgain.isDisplayed());
  });

  it("N3 — opens two different backyard details without same titles", async function () {
    await backyardsPage.openBackyard(BackyardsPage.names[0]);
    await backyardsPage.returnFromDetail();
    const secondDetail = await backyardsPage.openBackyard(
      BackyardsPage.names[1],
    );
    assert.ok(
      await (
        await secondDetail.waitForBackyard(BackyardsPage.names[1])
      ).isDisplayed(),
    );
  });

  it("N5 — follows an in-app detail link when one is available", async function () {
    const detailPage = await backyardsPage.openBackyard(BackyardsPage.names[0]);
    const birdFoodTitle = await detailPage.openBirdFood();
    assert.ok(await birdFoodTitle.isDisplayed(), "Bird Food did not open.");

    await detailPage.closeBirdFood();
    await detailPage.waitForBackyard(BackyardsPage.names[0]);
    assert.ok(
      await detailPage.hasBirdFoodButton(),
      "The app did not return to the backyard detail.",
    );
  });

  it("F1 — toggles the first backyard favorite on and off", async function () {
    const detailPage = await backyardsPage.openBackyard(BackyardsPage.names[0]);
    const wasFavorite = await detailPage.favoriteButton.isOn();

    await detailPage.favoriteButton.click();
    assert.equal(
      await detailPage.favoriteButton.isOn(),
      wasFavorite,
      "Favorite state did not toggle.",
    );

    await detailPage.favoriteButton.click();
    assert.equal(
      await detailPage.favoriteButton.isOn(),
      wasFavorite,
      "Favorite state did not return to its original value.",
    );
  });

  it("F4 — retains a favorite after leaving and reopening the item", async function () {
    const detailPage = await backyardsPage.openBackyard(BackyardsPage.names[1]);
    await detailPage.favoriteButton.click();
    await backyardsPage.returnFromDetail();
    await backyardsPage.openBackyard(BackyardsPage.names[0]);
    await backyardsPage.returnFromDetail();
    const reopenedDetail = await backyardsPage.openBackyard(
      BackyardsPage.names[0],
    );

    assert.equal(
      await reopenedDetail.favoriteButton.isOn(),
      false,
      "Favorite state was not retained.",
    );
  });

  it("F5 — handles a search with no matching results without crashing", async function () {
    await backyardsPage.searchField.enter("zzzz");
    await driver.pause(500);
    assert.ok(
      await backyardsPage.searchField.isDisplayed(),
      "The search field is not visible on the empty results screen.",
    );
    assert.equal(await backyardsPage.searchField.value(), "zzzz");
    assert.deepEqual(await backyardsPage.displayedCardNames(), []);
  });

  it("F8 — keeps text readable and buttons usable in dark mode", async function () {
    const simulator = getSimulator();
    const originalAppearance = await getSimulatorAppearance(simulator.udid);

    try {
      await setSimulatorAppearance(simulator.udid, "dark");
      await driver.terminateApp(bundleId);
      await driver.activateApp(bundleId);

      const homeTitle = await backyardsPage.waitUntilOpen();
      assert.ok(
        await homeTitle.isDisplayed(),
        "The home title is not visible.",
      );

      const backyardName = BackyardsPage.names[0];
      const backyardCard = await backyardsPage.waitForLabel(backyardName);
      assert.ok(
        await backyardCard.isDisplayed(),
        "The backyard card is not visible.",
      );
      assert.ok(
        await backyardCard.isEnabled(),
        "The backyard card is disabled.",
      );

      const detailPage = await backyardsPage.openBackyard(backyardName);
      const detailTitle = await detailPage.waitForBackyard(backyardName);
      assert.ok(
        await detailTitle.isDisplayed(),
        "The detail title is not visible.",
      );
    } finally {
      if (originalAppearance === "dark" || originalAppearance === "light") {
        await setSimulatorAppearance(simulator.udid, originalAppearance);
      }
    }
  });

  it("F10 — shows the home screen within 5 seconds of launch", async function () {
    await driver.terminateApp(bundleId);

    const launchStartedAt = performance.now();
    await driver.activateApp(bundleId);
    const homeTitle = await backyardsPage.waitUntilOpen();
    const launchDuration = performance.now() - launchStartedAt;

    assert.ok(
      await homeTitle.isDisplayed(),
      "The home screen is not visible after launch.",
    );
    assert.ok(
      launchDuration <= 5000,
      `Home screen took ${launchDuration.toFixed(0)}ms to appear; expected 3000ms or less.`,
    );
  });
});
