# Playwright experiment

This repo tests whether a user can book a demo slot in working hours PST through the 100ms website.

## Usage

### Repo setup

After git clone and changing the directory, run

```sh
npm i

# Install browser to test
npx playwright install chromium
```

### Run test

```sh
# Run test on desktop and mobile
# This command runs on GitHub Actions
npx playwright test

# Run test on mobile
npx playwright test --project=mobile

# Run test on desktop and with a headed browser (shows UI)
npx playwright test --project=desktop --headed
```

### See test report

Each test execution generates a video. Failed tests generate a [Playwright trace](http://playwright.dev/docs/trace-viewer-intro) (for debugging).

```sh
npx playwright show-report
```

For test runs on GitHub Actions, the videos can be downloaded from the [run summary page](https://github.com/arjunattam/playwright-experiment/actions/runs/6195975978).
