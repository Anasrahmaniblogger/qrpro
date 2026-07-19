import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    await page.goto('file:///app/applet/user.html', { waitUntil: 'networkidle2' });
    
    await page.click('#three-dot-menu-btn');
    await new Promise(r => setTimeout(r, 500));
    
    const sidebarClasses = await page.evaluate(() => document.getElementById('sidebar').className);
    console.log('Sidebar classes after open:', sidebarClasses);
    
    await page.click('#three-dot-menu-btn');
    await new Promise(r => setTimeout(r, 500));
    
    const sidebarClasses2 = await page.evaluate(() => document.getElementById('sidebar').className);
    console.log('Sidebar classes after close:', sidebarClasses2);
    
    await browser.close();
    process.exit(0);
})();
