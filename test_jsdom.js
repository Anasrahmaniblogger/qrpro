const fs = require('fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync('user.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
dom.window.document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded fired!");
});
dom.window.addEventListener("error", (e) => {
  console.error("JSDOM Error:", e.error.message);
});
setTimeout(() => {
  console.log("Done");
}, 3000);
