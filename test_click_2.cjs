const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    
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
            link.click();
        }
    });
    
    // Wait to see what happens
    await new Promise(r => setTimeout(r, 1000));
    
    // Check if modal is visible
    const modalVisible = await page.evaluate(() => {
        const modal = document.getElementById('cms-modal');
        return modal && !modal.classList.contains('hidden');
    });
    
    console.log("Is CMS Modal Visible?", modalVisible);
    
    await browser.close();
})();
