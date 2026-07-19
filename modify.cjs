const fs = require('fs');

let html = fs.readFileSync('user.html', 'utf8');

const extractDiv = (html, id) => {
    const startStr = `<div id="${id}"`;
    const startIndex = html.indexOf(startStr);
    if (startIndex === -1) return null;
    
    let endIndex = html.indexOf('<div id="view-', startIndex + 10);
    if (endIndex === -1) {
        endIndex = html.indexOf('<!-- Mobile Bottom Navigation -->', startIndex);
    }
    
    return {
        full: html.substring(startIndex, endIndex),
        content: html.substring(startIndex, endIndex).replace(startStr, `<div id="${id}_moved"`)
    };
};

const qrStudio = extractDiv(html, 'view-qr-studio');
const logoStudio = extractDiv(html, 'view-logo-studio');

if (!qrStudio || !logoStudio) {
    console.error("Could not find views");
    process.exit(1);
}

html = html.replace(qrStudio.full, '');
html = html.replace(logoStudio.full, '');

let qrHtml = qrStudio.content.replace(/class="app-view[^"]*"/, 'class="mt-8"');
let logoHtml = logoStudio.content.replace(/class="app-view[^"]*"/, 'class="mt-8"').replace(/<div class="bg-white border-b border-slate-200 sticky top-0 z-30 pt-4 pb-4 px-6 shadow-sm">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, '');

const overviewStart = html.indexOf('<div id="dash-overview"');
const quickActionsStart = html.indexOf('<!-- Quick Actions -->', overviewStart);
const quickActionsEnd = html.indexOf('<!-- Limits & Subscription -->', quickActionsStart);

const quickActionsHtml = html.substring(quickActionsStart, quickActionsEnd);
html = html.replace(quickActionsHtml, '');

const matchLimits = html.match(/<!-- Limits & Subscription -->[\s\S]*?<\/button>\s*<\/div>/);

if (matchLimits) {
    const insertPoint = matchLimits.index + matchLimits[0].length;
    
    const tabsHtml = `
    <!-- Unified Workspace Tabs -->
    <div class="flex gap-4 mb-6 mt-8 border-b border-slate-200">
        <button id="tab-qr" onclick="switchUnifiedTab('qr')" class="px-6 py-3 font-bold text-blue-600 border-b-2 border-blue-600 transition-colors">QR Generator</button>
        <button id="tab-logo" onclick="switchUnifiedTab('logo')" class="px-6 py-3 font-bold text-slate-500 border-b-2 border-transparent hover:text-slate-800 transition-colors">AI Logo Builder</button>
    </div>
    
    <div id="unified-content-qr">
        <div class="glass-card bg-white border border-slate-200 rounded-3xl shadow-sm">
            ${qrHtml.replace('id="view-qr-studio_moved" class="mt-8"', 'class="w-full"').replace(/h-screen overflow-hidden/g, '').replace(/studio-layout/g, 'grid grid-cols-1 lg:grid-cols-2 gap-8').replace(/overflow-hidden/g, '')}
        </div>
    </div>
    
    <div id="unified-content-logo" class="hidden">
        <div class="glass-card bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            ${logoHtml.replace('id="view-logo-studio_moved" class="mt-8"', 'class="w-full"').replace(/min-h-screen/g, '')}
        </div>
    </div>
    `;
    
    html = html.substring(0, insertPoint) + tabsHtml + html.substring(insertPoint);
}

// Ensure bottom mobile nav works correctly now
html = html.replace(/onclick="navigate\('qr-studio'\)"/g, 'onclick="navigate(\'dashboard\'); switchUnifiedTab(\'qr\')"');
html = html.replace(/onclick="navigate\('logo-studio'\)"/g, 'onclick="navigate(\'dashboard\'); switchUnifiedTab(\'logo\')"');

// Add to sidebar nav too
html = html.replace(/<a class="dash-nav-item" onclick="showDashSection\('my-qr'\)">[\s\S]*?<\/a>/, `<a class="dash-nav-item" onclick="switchUnifiedTab('qr')">
                    <div class="w-6 flex justify-center"><i class="fas fa-qrcode"></i></div>
                    <span>QR Generator</span>
                </a>`);
html = html.replace(/<a class="dash-nav-item" onclick="showDashSection\('my-logos'\)">[\s\S]*?<\/a>/, `<a class="dash-nav-item" onclick="switchUnifiedTab('logo')">
                    <div class="w-6 flex justify-center"><i class="fas fa-paint-brush"></i></div>
                    <span>Logo Builder</span>
                </a>`);


const scriptTagIndex = html.indexOf('<script>');
const scriptAdd = `
        function switchUnifiedTab(tab) {
            if (tab === 'qr') {
                document.getElementById('unified-content-qr').classList.remove('hidden');
                document.getElementById('unified-content-logo').classList.add('hidden');
                
                document.getElementById('tab-qr').classList.add('text-blue-600', 'border-blue-600');
                document.getElementById('tab-qr').classList.remove('text-slate-500', 'border-transparent');
                
                document.getElementById('tab-logo').classList.remove('text-blue-600', 'border-blue-600');
                document.getElementById('tab-logo').classList.add('text-slate-500', 'border-transparent');
            } else {
                document.getElementById('unified-content-logo').classList.remove('hidden');
                document.getElementById('unified-content-qr').classList.add('hidden');
                
                document.getElementById('tab-logo').classList.add('text-blue-600', 'border-blue-600');
                document.getElementById('tab-logo').classList.remove('text-slate-500', 'border-transparent');
                
                document.getElementById('tab-qr').classList.remove('text-blue-600', 'border-blue-600');
                document.getElementById('tab-qr').classList.add('text-slate-500', 'border-transparent');
            }
            
            showDashSection('overview');
        }
`;
html = html.substring(0, scriptTagIndex + 8) + scriptAdd + html.substring(scriptTagIndex + 8);

fs.writeFileSync('user.html', html);
console.log("Updated user.html");

