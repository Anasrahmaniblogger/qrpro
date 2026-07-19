const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    
    // Load local file
    await page.goto(`file://${__dirname}/user.html`);
    
    // Open sidebar
    await page.evaluate(() => toggleSidebar());
    await new Promise(r => setTimeout(r, 500));
    
    // Click the Overview link
    await page.evaluate(() => {
        document.querySelector('#sidebar-items a').click();
    });
    
    // Wait for Supabase call to resolve or fail
    await new Promise(r => setTimeout(r, 2000));
    
    // Log the modal HTML content
    const modalHTML = await page.evaluate(() => {
        return document.getElementById('cms-modal-body').innerHTML;
    });
    
    console.log("MODAL HTML:", modalHTML.trim());
    
    await browser.close();
})();
