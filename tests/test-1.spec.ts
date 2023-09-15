import { test, expect, errors } from '@playwright/test';

test.use({ timezoneId: 'US/Pacific' });

test('Demo slot is available for next 2 business days', async ({ page }) => {
  await page.goto('https://www.100ms.live/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Schedule a Demo' }).first().click();

  const bookingFrame = 'iframe[title="Calendly Scheduling Page"]';

  // Ideally Playwright should auto-scroll, but Chrome defers rendering out-of-view iframes
  // Open issue: https://github.com/microsoft/playwright/issues/21054
  await page.locator(bookingFrame).scrollIntoViewIfNeeded();

  // Handle cookie modal on Calendly iframe
  await expect(page.frameLocator(bookingFrame).getByText('We respect your personal privacy')).toBeVisible();
  await page.frameLocator(bookingFrame).getByRole('button', { name: 'Close' }).click();

  const nextWeekdays = getNextWeekdayDates(2);
  const timeSlots = generateWorkingHourTimes(9, 16);
  console.log(timeSlots);

  await page.frameLocator(bookingFrame).getByLabel(`${nextWeekdays[0]} - Times available`).click();

  for (let i = 0; i < timeSlots.length; i++) {
    const timeSlot = timeSlots[i];
    try {
      await page.frameLocator(bookingFrame).getByRole('button', { name: timeSlot }).click({ timeout: 1000 });
      await page.frameLocator(bookingFrame).getByLabel(`Next ${timeSlot}`).click();
      console.log('Found and clicked on slot', timeSlot);
      break;
    } catch (error) {
      if (error instanceof errors.TimeoutError) {
        // Click failed - let's try again
        console.log('Clicked failed on', timeSlot);
      }
    }
  }
});

function generateWorkingHourTimes(start, end) {
  const arr = [start];
  for (let i = start; i < end; i = i + 0.5) {
    arr.push(i + 0.5);
  }
  return arr.map(hour => convert24HrTo12Hr(convertNumberToTime(hour)));
}

function convertNumberToTime(number) {
  const hours = Math.floor(number);
  const minutes = (number - hours) * 60;
  return minutes === 0 ? `${hours}:00` : `${hours}:${minutes}`;
}

function convert24HrTo12Hr(time) {
  const [hours, minutes] = time.split(':');
  const suffix = hours >= 12 ? 'pm' : 'am';
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes}${suffix}`;
}

function getNextWeekdayDates(count) {
  const dates: string[] = [];
  let currentDate = new Date();
  const formatOptions = { weekday: 'long', month: 'long', day: 'numeric' };

  while (dates.length < count) {
    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    const dayOfWeek = currentDate.getDay();

    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // Check if it's a weekday (Monday to Friday)
      const newDate = new Date(currentDate);
      const formattedDate = newDate.toLocaleDateString('en-US', formatOptions);
      dates.push(formattedDate); // Add a copy of the date to the array
    }
  }

  return dates;
}
