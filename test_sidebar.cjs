const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const html = fs.readFileSync('user.html', 'utf-8');
const dom = new JSDOM(html, { runScripts: "dangerously" });
