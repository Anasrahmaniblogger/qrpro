import puppeteer from 'puppeteer';
import { exec } from 'child_process';

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    // Serve the directory
    const server = exec('npx serve -l 3000');
    
    // Wait for server to start
    await new Promise(r => setTimeout(r, 2000));
    
    await page.goto('http://localhost:3000/user.html', { waitUntil: 'networkidle2' });
    
    await browser.close();
    server.kill();
})();
