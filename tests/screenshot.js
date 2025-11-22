import puppeteer from "puppeteer";

async function run() {
  console.log("Taking screenshot...");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto("http://localhost:4173", { waitUntil: "networkidle0" });

  await page.screenshot({ path: "screenshot.png" });

  await browser.close();
  console.log("Screenshot saved!");
}

run();
