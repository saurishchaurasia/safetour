const path = require("node:path");

function loadPlaywright() {
  try {
    return require("playwright");
  } catch {
    const bundledPath = path.join(
      process.env.USERPROFILE || "C:\\Users\\Saurish",
      ".cache",
      "codex-runtimes",
      "codex-primary-runtime",
      "dependencies",
      "node",
      "node_modules",
      ".pnpm",
      "playwright@1.60.0",
      "node_modules",
      "playwright"
    );
    return require(bundledPath);
  }
}

const { chromium } = loadPlaywright();

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (error) {
    console.error("Playwright is available, but its Chromium browser is not installed.");
    console.error("Install browsers with: npx playwright install chromium");
    console.error(error.message);
    process.exit(1);
  }

  const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
  const errors = [];

  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("file:///C:/Users/Saurish/OneDrive/Documents/TOURIST%20SAFETY/index.html");
  await page.click('button[data-score="5"]');
  await page.fill("#incidentLocation", "Near Central Plaza");
  await page.click('button[type="submit"]');
  await page.click("#panicButton");

  const result = await page.evaluate(() => ({
    title: document.title,
    alerts: document.querySelectorAll(".alert-card").length,
    markers: document.querySelectorAll(".place-marker").length,
    heatSpots: document.querySelectorAll(".heat-spot").length,
    selectedPlace: document.querySelector("#placeDetails h3")?.textContent,
    adminVisible: document.querySelector("#adminDashboard")?.classList.contains("is-visible")
  }));

  await browser.close();

  if (errors.length) {
    throw new Error(errors.join("\n"));
  }

  console.log(JSON.stringify(result, null, 2));
})();
