import puppeteer from "puppeteer";

(async () => {
  console.log("Running interaction test...");

  const browser = await puppeteer.launch({
    headless: "new"
  });

  const page = await browser.newPage();
  await page.goto("http://localhost:4173/", { waitUntil: "networkidle0" });

  await page.keyboard.down("ArrowUp");
  await page.waitForTimeout(250);
  await page.keyboard.up("ArrowUp");

  console.log("Interaction completed successfully.");

  await browser.close();
})();
