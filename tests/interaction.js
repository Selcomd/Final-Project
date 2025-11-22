const puppeteer = require("puppeteer");

async function runTest() {
  const url = "https://selcomd.github.io/Final-Project/"; // ← your GitHub Pages link

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  try {
    console.log("Loading game...");
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

    console.log("Game loaded. Simulating input...");

    await page.keyboard.down("w");
    await page.waitForTimeout(800);
    await page.keyboard.up("w");

    await page.keyboard.down("d");
    await page.waitForTimeout(800);
    await page.keyboard.up("d");

    await page.waitForTimeout(2000);

    const levelPassed = await page.evaluate(() => {
      return document.body.innerText.toLowerCase().includes("level passed");
    });

    if (levelPassed) {
      console.log("SUCCESS: Level was passed!");
      await browser.close();
      process.exit(0);
    } else {
      console.log("FAILURE: Level did not pass.");
      await browser.close();
      process.exit(1);
    }
  } catch (err) {
    console.error("Test failed:", err);
    await browser.close();
    process.exit(1);
  }
}

runTest();
