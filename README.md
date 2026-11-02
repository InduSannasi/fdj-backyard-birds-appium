# Backyard Birds iOS Test Automation

## 💡Project Overview

A JavaScript mobile UI automation project for the Backyard Birds iOS sample app.

The project is organized with the Page Object Model (POM), separating test scenarios from page behavior and reusable UI components.

### 🎯Key Features

- Test scenarios organized by each screen/page, making them easy to read, understand and extend
- Page objects for each app screen, isolated locators and screen actions from test cases
- Reusable components for navigation, search, and toggle favourite buttons
- Shared app test hooks:
  - **Setup:** the `before` hook creates the Appium session; `beforeEach` resets and launches the app.
  - **Teardown:** the `after` hook ends the Appium session.
  - **Failure screenshots:** `afterEach` captures a screenshot when a test fails.
- Test reports generated in the `artifacts` folder

---

## ⚙️ Tools & Technologies

| Tool             | Purpose                    |
| ---------------- | -------------------------- |
| JavaScript       | Test automation language   |
| Appium           | Mobile automation server   |
| WebdriverIO      | Appium WebDriver client    |
| XCUITest         | iOS Simulator automation   |
| Mocha            | Test runner and assertions |
| Mochawesome      | HTML and JSON test reports |
| Xcode Device Hub | iOS Simulator management   |

---

## ⭐Project Structure

```text
.
├── test/
│   ├── components/
│   │   ├── bottom-navigation.component.js
│   │   ├── favorite-button.component.js
│   │   └── search-field.component.js
│   ├── configs/
│   │   └── config-driver.js
│   ├── pages/
│   │   ├── backyard-detail.page.js
│   │   ├── backyards.page.js
│   │   ├── base.page.js
│   │   └── birds.page.js
│   ├── support/
│   │   └── app-hooks.js
│   └── testcases/
│       ├── backyards.spec.js
│       └── birds.spec.js
├── artifacts/
│   ├── report/
│   └── screenshots/
├── Backyard Birds.app/
├── package.json
└── README.md
```

---

## Quick Start

### 🛠️Prerequisites

- macOS with Xcode and an available iOS Simulator runtime
- Node.js 18.17 or newer and npm
- The supplied `Backyard Birds.app` bundle

The app bundle identifier is `com.example.apple-samplecode.Backyard-Birds`. By default, the project looks for the app bundle at `./Backyard Birds.app`.

### Install Dependencies

```sh
npm ci
```

### Start Appium

Start the Appium server in a terminal and leave it running. The tests boot the selected simulator automatically if needed.

```sh
npm run appium
```

The server listens on `127.0.0.1:4723` with the `/wd/hub` base path.

### ✅Run the Tests

In another terminal, from the project directory:

```sh
# Run all specs on the default device (iPhone 16)
npm test

# Run all specs on iPhone 16 only
npm run test:iphone16

# Run all specs on iPhone 17 only
npm run test:iphone17

# Run all specs on both devices concurrently
npm run test:parallel

# Run one spec file on a selected device (example: iPhone 16)
SIMULATOR_INDEX=0 npx mocha --timeout 90000 --reporter spec test/testcases/backyards.spec.js
```

# Run the CI suite on iPhone 16 (excludes the intentionally failing F12 case)

npm run test:ci:iphone16

```

### 📊Runtime Comparison

Three recorded parallel runs completed all 15 tests on each device. The individual device durations and estimated sequential totals were:

| Run | iPhone 16 | iPhone 17 | Parallel Execution time | Estimated sequential time |
| --- | --------: | --------: | ----------------------: | ------------------------: |
| 1   |      4:09 |      4:50 |                    4:50 |                      9:59 |
| 2   |      4:36 |      5:09 |                    5:09 |                     10:45 |
| 3   |      4:21 |      4:32 |                    4:31 |                      8:43 |

Across these runs, parallel execution took about **4–7 minutes**. Running the same two device suites sequentially is estimated at about **9–13 minutes**, based on adding their recorded durations. This suggests parallel execution can be around **1.7–2x faster** when both simulator sessions remain healthy.

---

## 📁Reports and Screenshots

The test commands write Mochawesome HTML and JSON reports to `artifacts/report/`. The parallel command creates a separate report for each device. Failed tests capture a screenshot under `artifacts/screenshots/` and attach it to the report. The Birds tab screenshot scenario also saves and attaches a screenshot.

Generated artifacts, dependencies, and the supplied app bundle are excluded from Git.
```
