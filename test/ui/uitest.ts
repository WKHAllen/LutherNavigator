/*
 * Tests pages using three major browser engines: Chromium, Firefox, and
 * WebKit. The tests can be deployed using `npx ts-node uitest.ts` command.
 * However, it is already automated so that every times tests are run, this
 * command also gets executed. Therefore, it suffices to run `sh script.sh
 * test`.
 *
 */
import { chromium, firefox, webkit } from "playwright";

const PAGEMAP = {
    "https://www.luthernavigator.com": "landing.png",
    "https://www.luthernavigator.com/about": "about.png",
    "https://www.luthernavigator.com/login": "login.png",
    "https://www.luthernavigator.com/post": "post.png",
    "https://www.luthernavigator.com/restaurant": "restaurant.png",
};

(async () => {
    for (const browserType of [chromium, firefox, webkit]) {
        // Launch a browser
        const browser = await browserType.launch();

        // Create a context
        const context = await browser.newContext();

        // Create a page
        const page = await context.newPage();

        // Carry out actions for all urls
        for (let url in PAGEMAP) {
            // Go to a page
            await page.goto(url);

            // Take a screenshot
            await page.screenshot({
                path: `screenshots/${browserType.name()}/${PAGEMAP[url]}`,
            });
        }

        // Close a browser
        await browser.close();
    }
})();
