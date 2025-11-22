import puppeteer from "puppeteer";

(async () => {
  console.log("Running screenshot test...");

  const browser = await puppeteer.launch({
    headless: "new"
  });

  const page = await browser.newPage();
  await page.goto("http://localhost:4173/", { waitUntil: "networkidle0" });

  await page.screenshot({ path: "screenshot.png" });

  console.log("Screenshot saved as screenshot.png");

  await browser.close();
})();
