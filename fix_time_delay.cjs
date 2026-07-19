const fs = require('fs');
let userHtml = fs.readFileSync('user.html', 'utf8');

userHtml = userHtml.replace(
    'if (trigger !== triggerEvent) return;',
    'if (trigger !== triggerEvent && !(triggerEvent === "on_load" && trigger === "time_delay")) return;'
);

fs.writeFileSync('user.html', userHtml);
