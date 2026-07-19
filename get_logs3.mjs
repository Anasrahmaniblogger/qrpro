import puppeteer from 'puppeteer';
import { exec } from 'child_process';

(async () => {
    const server = exec('npx serve -l 3000');
    await new Promise(r => setTimeout(r, 2000));
    
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    await page.goto('http://localhost:3000/user.html', { waitUntil: 'networkidle2' });
    
    await browser.close();
    server.kill();
})();
