import puppeteer from "puppeteer";

async function run() {
  console.log("Running interaction test...");

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  await page.goto("http://localhost:4173", {
    waitUntil: "networkidle0",
  });

  await page.keyboard.down("w");
  await page.waitForTimeout(1000);
  await page.keyboard.up("w");

  console.log("Movement input simulated.");
  await browser.close();
}

run();
