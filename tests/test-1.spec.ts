import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://www.100ms.live/', {waitUntil: "domcontentloaded"});
  await page.locator('#navbar').getByRole('button', { name: 'Schedule a Demo' }).click();
  const fr = 'iframe[title="Calendly Scheduling Page"]';
  await page.locator(fr).scrollIntoViewIfNeeded();

  // Calendly loads widget page
  await expect(page.frameLocator(fr).getByRole('button', { name: 'Cookie Settings', exact: true })).toBeVisible()

  await page.frameLocator(fr).getByRole('button', { name: 'Accept all' }).click();
  await page.frameLocator(fr).getByLabel('Monday, September 11 - Times available').click();
  await page.frameLocator(fr).getByRole('button', { name: '10:00am' }).click();
  await page.frameLocator(fr).getByLabel('Next 10:00am').click();
});