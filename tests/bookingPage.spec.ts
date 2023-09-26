import { test, expect } from '@playwright/test';

test.use({ timezoneId: 'US/Pacific' });

const START_WORK_DAY = 9; // 9am
const END_WORK_DAY = 17; // 5pm

test('Demo slot is available for next 2 business days', async ({ page }) => {
  await page.goto('https://www.100ms.live/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Schedule a Demo' }).first().click();

  const bookingFrame = 'iframe[title="Calendly Scheduling Page"]';
  // Ideally Playwright should auto-scroll, but Chrome defers rendering out-of-view iframes
  // Open issue: https://github.com/microsoft/playwright/issues/21054
  await page.locator(bookingFrame).scrollIntoViewIfNeeded();

  // Handle cookie modal on the Calendly iframe
  await expect(page.frameLocator(bookingFrame).getByText('We respect your personal privacy')).toBeVisible();
  await page.frameLocator(bookingFrame).getByRole('button', { name: 'Close' }).click();
  const validTimeSlots = generateWorkingHourTimes(START_WORK_DAY, END_WORK_DAY);
  const nextWeekdays = getNextWeekdayDates(2); // Next 2 Mon-Fri

  // TODO: support multiple months
  // if no available slot found on the first month, try the next month by clicking on
  // button.aria-label = go to previous page and 
  // button.aria-label = next month
  const availableTimeSlots: string[] = [];

  for (const weekday of nextWeekdays) {
    await page.frameLocator(bookingFrame).getByLabel(`${weekday} - Times available`).click();
    const buttons = await page.frameLocator(bookingFrame).getByRole('button');

    for (const button of await buttons.all()) {
      // TODO: optimise this - populates the trace viewer with multiple steps
      const text = await button.innerText();
      if (isTimestampString(text) && validTimeSlots.indexOf(text) >= 0) {
        // text looks like '11:00am' and is inside working hours
        availableTimeSlots.push(text);
      }
    }

    if (availableTimeSlots.length > 0) {
      // attempt to click the working slot
      const timeSlot = availableTimeSlots[0];
      await page.frameLocator(bookingFrame).getByRole('button', { name: timeSlot }).click();
      await page.frameLocator(bookingFrame).getByLabel(`Next ${timeSlot}`).click();
      console.log('Found and clicked on slot', timeSlot);
      break;
    }

    // no available slot found, try the next day
    await page.frameLocator(bookingFrame).getByLabel('Go to previous page').click();
  }

  // ensure we have at least one available time slot
  expect(availableTimeSlots.length).toBeTruthy();
});

function generateWorkingHourTimes(start, end) {
  // start time of 30 mins slots from start to end
  // for 9am-5pm, this will generate [9:00am, 9:30am, 10:00am, ... 4:30pm]
  const arr = [start];
  for (let i = start; i < end - 0.5; i = i + 0.5) {
    arr.push(i + 0.5);
  }
  return arr.map(hour => convert24HrTo12Hr(convertNumberToTime(hour)));
}

function convertNumberToTime(number) {
  const hours = Math.floor(number);
  const minutes = (number - hours) * 60;
  return minutes === 0 ? `${hours}:00` : `${hours}:${minutes}`;
}

function isTimestampString(timestamp) {
  const regex = /^(1[0-2]|0?[1-9]):([0-5][0-9])([ap]m)$/i;
  return regex.test(timestamp);
}

function convert24HrTo12Hr(time) {
  const [hours, minutes] = time.split(':');
  const suffix = hours >= 12 ? 'pm' : 'am';
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes}${suffix}`;
}

function getNextWeekdayDates(count) {
  // returns count number of weekdays in format 'Friday, September 29'
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
