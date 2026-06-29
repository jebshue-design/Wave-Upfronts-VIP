const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto("http://localhost:3000/login");
  await page.fill('input[name="password"]', "upfronts2026");
  await page.click('button[type="submit"]');
  await page.waitForURL("http://localhost:3000/");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);

  // Hero section
  await page.screenshot({ path: "/tmp/wave-hero.png" });

  // Scroll to shows section
  await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll("h2"));
    const originals = headings.find(h => h.textContent.includes("Originals"));
    if (originals) originals.scrollIntoView({ block: "start" });
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "/tmp/wave-shows-fresh.png" });

  await browser.close();
  console.log("Done");
})();
