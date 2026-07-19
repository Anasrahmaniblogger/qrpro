const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    // Load local file
    await page.goto(`file://${__dirname}/user.html`);
    
    // Open sidebar
    await page.evaluate(() => {
        if (typeof toggleSidebar === 'function') toggleSidebar();
    });
    
    // Wait a bit
    await new Promise(r => setTimeout(r, 500));
    
    // Click the Overview link
    await page.evaluate(() => {
        const link = document.querySelector('#sidebar-items a');
        if (link) {
            console.log("Clicking link: " + link.textContent.trim());
            link.click();
        } else {
            console.log("Link not found");
        }
    });
    
    // Wait to see what happens
    await new Promise(r => setTimeout(r, 1000));
    
    await browser.close();
})();
