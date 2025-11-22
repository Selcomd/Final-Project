import puppeteer from "puppeteer";

async function run() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();

  const url = "https://selcomd.github.io/Final-Project/";

  console.log("Opening:", url);
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });

  await page.waitForSelector("canvas");

  await page.waitForTimeout(2000);

  await page.screenshot({
    path: "screenshot.png",
    fullPage: false
  });

  console.log("Screenshot saved as screenshot.png");
  await browser.close();
}

run();
