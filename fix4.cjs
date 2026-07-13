const fs = require('fs');
let content = fs.readFileSync('user.html', 'utf8');
content = content.replace(/    <script>window\.addEventListener\("DOMContentLoaded", initNotifications\);<\/body><\/html>/, '    </script>\n    <script>window.addEventListener("DOMContentLoaded", initNotifications);</script>\n</body>\n</html>');
fs.writeFileSync('user.html', content);
