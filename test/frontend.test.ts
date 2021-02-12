import * as playwright from "playwright";

async function main() {
    const { chromium, firefox, webkit } = playwright;
    for (const browserType of [chromium, firefox, webkit]) {
        // Launch a browser
        const browser = await browserType.launch();

        // Create a context
        const context = await browser.newContext();

        // Create a page
        const page = await context.newPage();

        // Carry out actions
        await page.goto("https://www.google.com");

        // Close a browser
        await browser.close();
    }
}
