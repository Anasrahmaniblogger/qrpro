import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    page.on('requestfailed', request => {
        console.log(`REQUEST FAILED: ${request.url()} - ${request.failure().errorText}`);
    });
    
    // Using file protocol to avoid needing a web server
    await page.goto('file:///app/applet/user.html', { waitUntil: 'networkidle2', timeout: 10000 });
    
    // Evaluate if toggleSidebar is defined
    const hasToggleSidebar = await page.evaluate(() => typeof window.toggleSidebar === 'function');
    console.log('hasToggleSidebar:', hasToggleSidebar);
    
    // Click the toggle button
    try {
        await page.click('#three-dot-menu-btn');
        console.log('Clicked three-dot-menu-btn');
    } catch (e) {
        console.log('Could not click three-dot-menu-btn:', e.message);
    }
    
    await browser.close();
    process.exit(0);
})();
