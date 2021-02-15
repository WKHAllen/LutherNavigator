import * as playwright from "playwright";

const PAGEMAP = {
    "https://www.luthernavigator.com": "landing.png",
    "https://www.luthernavigator.com/about": "about.png",
    "https://www.luthernavigator.com/login": "login.png",
    "https://www.luthernavigator.com/post": "post.png",
    "https://www.luthernavigator.com/restaurant": "restaurant.png",
};

async function main() {
    const { chromium, firefox, webkit } = playwright;
    for (const browserType of [chromium, firefox, webkit]) {
        // Launch a browser
        const browser = await browserType.launch();

        // Create a context
        const context = await browser.newContext();

        // Create a page
        const page = await context.newPage();

        // Carry out actions for all urls
        for (let key in PAGEMAP) {
            await page.goto(key);
            await page.screenshot({
                path: `screenshots/${browserType.name()}/${PAGEMAP[key]}`,
            });
        }

        // Close a browser
        await browser.close();
    }
}

main();
