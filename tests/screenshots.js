import puppeteer from "puppeteer";

async function run() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  console.log("Opening game for screenshot...");
  
  await page.goto("http://localhost:4173", {
    waitUntil: "networkidle0",
    timeout: 60000
  });

  console.log("Taking screenshot...");

  await page.screenshot({ path: "screenshot.png", fullPage: true });

  console.log("Screenshot saved!");

  await browser.close();
}

run();
