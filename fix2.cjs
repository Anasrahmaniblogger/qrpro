const fs = require('fs');
let content = fs.readFileSync('user.html', 'utf8');

content = content.replace('    <style>', '    </script>\n    <style>');
content = content.replace('    <div id="view-auth"', '    </script>\n    <div id="view-auth"');
content = content.replace('        // Notifications Engine Init\n    \n    <script>', '        // Notifications Engine Init\n    </script>\n    <script>');

content = content.replace('    <script>window.addEventListener("DOMContentLoaded", initNotifications);</body></html>', 
`    </script>\n    <script>window.addEventListener("DOMContentLoaded", initNotifications);</script>\n</body>\n</html>`);

fs.writeFileSync('user.html', content);
