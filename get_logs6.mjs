import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    await page.goto('file:///app/applet/user.html', { waitUntil: 'networkidle2' });
    
    // Evaluate if signInWithGoogle is defined
    const hasSignIn = await page.evaluate(() => typeof window.signInWithGoogle === 'function');
    console.log('hasSignIn:', hasSignIn);
    
    await browser.close();
    process.exit(0);
})();
