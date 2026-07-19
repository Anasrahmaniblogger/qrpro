const fs = require('fs');
let userHtml = fs.readFileSync('user.html', 'utf8');

const exitIntentJs = `
        // Exit Intent Detection
        document.addEventListener('mouseout', (e) => {
            if (e.clientY < 50 && e.relatedTarget == null) {
                if (typeof window.evaluateTriggers === 'function') {
                    window.evaluateTriggers('exit_intent');
                }
            }
        });
`;

userHtml = userHtml.replace('// Custom Context Menu', exitIntentJs + '\n        // Custom Context Menu');

fs.writeFileSync('user.html', userHtml);
