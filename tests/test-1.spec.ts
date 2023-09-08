import { test, expect } from '@playwright/test';

test('Demo slot is available for next 2 business days', async ({ page }) => {
  // 
  await page.goto('https://www.100ms.live/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Schedule a Demo' }).first().click();

  //
  const bookingFrame = 'iframe[title="Calendly Scheduling Page"]';
  // https://github.com/microsoft/playwright/issues/21054
  await page.locator(bookingFrame).scrollIntoViewIfNeeded();

  // Handle cookie modal on Calendly iframe
  // Calendly loads "accept cookies" modal that is localized to geographies (US different from India)
  // fails because text is localised on CI/local
  // for local run: npx playwright test --ui
  // for CI run: npx playwright show-report ~/Downloads/playwright-report/.
  await expect(page.frameLocator(bookingFrame).getByText('We respect your personal privacy')).toBeVisible();
  await page.frameLocator(bookingFrame).getByRole('button', { name: 'Close' }).click();

  await page.frameLocator(bookingFrame).getByLabel('Monday, September 11 - Times available').click();
  await page.frameLocator(bookingFrame).getByRole('button', { name: '10:00am' }).click();
  await page.frameLocator(bookingFrame).getByLabel('Next 10:00am').click();
});