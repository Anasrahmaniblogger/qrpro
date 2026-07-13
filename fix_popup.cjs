const fs = require('fs');
let content = fs.readFileSync('user.html', 'utf8');

const popupFix = `
        function handleRemoveBranding() {
            const container = document.getElementById('branding-options-container');
            container.innerHTML = '';
            
            if (brandingSettings.unlock_method === 'one-time' || brandingSettings.unlock_method === 'both') {
                container.innerHTML += \\\`
                    <div class="w-full text-left p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-500 transition-all flex flex-col gap-4 group bg-white shadow-sm hover:shadow-md">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="font-extrabold text-slate-900 text-lg flex items-center gap-2 group-hover:text-blue-600">
                                    <i class="fas fa-check-circle text-emerald-500 text-xl"></i> One-Time Purchase
                                </p>
                                <p class="text-sm text-slate-500 mt-1 pl-7">Pay once, remove branding forever.</p>
                            </div>
                            <div class="text-right">
                                \\\${brandingSettings.strike_price ? '<p class="text-xs text-slate-400 line-through">' + (brandingSettings.currency === 'INR' ? '₹' : brandingSettings.currency) + brandingSettings.strike_price + '</p>' : ''}
                                <div class="font-black text-2xl text-slate-900">\\\${brandingSettings.currency === 'INR' ? '₹' : brandingSettings.currency}\\\${brandingSettings.price}</div>
                            </div>
                        </div>
                        <button onclick="purchaseBrandingOnetime()" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all">Buy Now</button>
                    </div>
                \\\`;
            }
            
            if (brandingSettings.unlock_method === 'subscription' || brandingSettings.unlock_method === 'both') {
                container.innerHTML += \\\`
                    <div class="w-full text-left p-5 rounded-2xl border-2 border-indigo-100 bg-indigo-50/50 hover:border-indigo-500 transition-all flex flex-col gap-4 group shadow-sm hover:shadow-md">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="font-extrabold text-indigo-900 text-lg flex items-center gap-2 group-hover:text-indigo-700">
                                    <i class="fas fa-check-circle text-indigo-500 text-xl"></i> Upgrade to Premium
                                </p>
                                <p class="text-sm text-indigo-700/70 mt-1 pl-7">Included with Premium plan.</p>
                            </div>
                            <div class="text-right">
                                <div class="font-black text-2xl text-indigo-900">₹99<span class="text-sm font-medium opacity-70">/mo</span></div>
                            </div>
                        </div>
                        <button onclick="document.getElementById('branding-popup').classList.add('hidden'); handleDirectUpgrade();" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all">Upgrade to Premium</button>
                    </div>
                \\\`;
            }
            
            document.getElementById('branding-popup').classList.remove('hidden');
            document.getElementById('branding-popup').classList.add('flex');
        }
`;

// we need to replace the old function.
// Let's use regex to find and replace the whole function.
const regex = /function handleRemoveBranding\(\) \{[\s\S]*?document\.getElementById\('branding-popup'\)\.classList\.add\('flex'\);\n        \}/;
content = content.replace(regex, popupFix.trim());

fs.writeFileSync('user.html', content);
