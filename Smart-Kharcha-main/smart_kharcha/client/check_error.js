import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  
  const page = await context.newPage();
  
  // Listen for console events
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', error => console.error('BROWSER ERROR:', error.message));

  console.log('Navigating to http://localhost:5174/ ...');
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
  
  // Wait a moment for any react errors to bubble up
  await page.waitForTimeout(2000);
  
  await browser.close();
})();
