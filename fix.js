const fs = require('fs');
let content = fs.readFileSync('user.html', 'utf8');

const headContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QR Pro | A Product By Rahmani International</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
    <!-- QR Code Generator JS -->
    <script src="https://cdn.jsdelivr.net/npm/qr-code-styling@1.5.0/lib/qr-code-styling.js"></script>
    <script>
`;

content = content.replace(/^<!DOCTYPE html>[\s\S]*?<script>\n/m, headContent);

// we also need to fix the missing </script> tags!
// 13:    <script>
// 1493:    <script>
// 2790:    <script>
// 5633:    <script>
// 5786:<script>window.addEventListener("DOMContentLoaded", initNotifications);</body></html>

content = content.replace(/<\/body><\/html>$/, '</script></body></html>');
fs.writeFileSync('user.html', content);
