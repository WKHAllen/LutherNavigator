/*
 * The code performs mobile device emulation and accesses pages using three
 * major browser engines: Chromium, Firefox, and WebKit. The tests can be
 * deployed using `npx ts-node mobile_emulation.ts` command. However, it is
 * already automated so that every times tests are run with the
 * `emulation-mode` argument, these tests also get executed.
 *
 */
import { chromium, firefox, webkit, devices } from "playwright";

const PAGEMAP = {
  "https://www.luthernavigator.com": "landing.png",
  "https://www.luthernavigator.com/about": "about.png",
  "https://www.luthernavigator.com/login": "login.png",
  "https://www.luthernavigator.com/post": "post.png",
  "https://www.luthernavigator.com/restaurant": "restaurant.png",
};

(async () => {
  for (const browserType of [chromium, firefox, webkit]) {
    for (let device_name in devices) {
      // A mobile device to be tested
      const device = devices[device_name];

      // Launch a browser
      const browser = await browserType.launch();

      // Create a context
      const context = await browser.newContext({ ...device });

      // Create a page
      const page = await context.newPage();

      // Carry out actions for all urls
      for (let url in PAGEMAP) {
        // Go to a page
        await page.goto(url);

        // Take a screenshot
        await page.screenshot({
          path: `screenshots/mobile/${device_name}/${browserType.name()}/${
            PAGEMAP[url]
          }`,
        });
      }

      // Close a browser
      await browser.close();
    }
  }
})();
