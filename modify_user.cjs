const fs = require('fs');
let content = fs.readFileSync('user.html', 'utf8');

const brandingUI = `
                    <!-- Branding Status Card -->
                    <div class="glass-card p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 shadow-sm rounded-2xl mb-8 mt-6">
                        <div class="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div>
                                <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-3 border border-blue-200">
                                    <i class="fas fa-copyright"></i>
                                    <span>Branding Setting</span>
                                </div>
                                <h3 id="branding-status-title" class="text-2xl font-extrabold mb-1.5 tracking-tight text-slate-900">Branding Enabled</h3>
                                <p id="branding-status-desc" class="text-slate-600 text-sm font-medium">QR Pro watermark will be applied to your creations.</p>
                            </div>
                            <button id="branding-action-btn" onclick="handleRemoveBranding()" class="btn bg-blue-600 text-white hover:bg-blue-700 px-6 py-3 rounded-xl font-bold transition-all shadow-md">
                                Remove Branding
                            </button>
                        </div>
                    </div>
`;

content = content.replace(/(<!-- Unified Workspace Tabs -->)/, brandingUI + '\n                    $1');

const popupUI = `
        <!-- Branding Purchase Popup -->
        <div id="branding-popup" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center z-[9999] p-4 transition-opacity">
            <div class="glass-card p-8 w-full max-w-md bg-white text-slate-800 border shadow-2xl rounded-3xl transform scale-95 transition-all duration-300">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                        <i class="fas fa-crown"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-slate-900 mb-2">Unlock Branding Removal</h3>
                    <p class="text-slate-500 text-sm" id="branding-popup-desc">Choose your option to remove QR Pro branding from all your creations.</p>
                </div>
                
                <div class="space-y-4 mb-8" id="branding-options-container">
                    <!-- Options populated via JS -->
                </div>
                
                <div class="flex gap-4">
                    <button onclick="document.getElementById('branding-popup').classList.add('hidden')" class="w-full px-4 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
`;

content = content.replace(/(<\/body>)/, popupUI + '\n$1');

const scripts = `
        let brandingSettings = {
            unlock_method: 'subscription',
            sub_expiry: 'locked_again',
            price: 49,
            currency: 'INR',
            enable: true,
            mandatory: true,
            allow_removal: true
        };

        async function loadBrandingSettings() {
            if (supabaseClient) {
                const { data } = await supabaseClient.from('settings').select('*').eq('id', 'branding_settings').single();
                if (data && data.value) brandingSettings = { ...brandingSettings, ...data.value };
            } else {
                const local = localStorage.getItem('branding_settings');
                if (local) brandingSettings = { ...brandingSettings, ...JSON.parse(local) };
            }
            updateBrandingUI();
        }

        function isBrandingRemoved() {
            if (!brandingSettings.enable) return true; // Disabled system means branding is removed
            
            if (userProfile.branding_unlocked) return true;
            
            if (userProfile.subscription_tier === 'PRO') {
                if (brandingSettings.unlock_method === 'subscription' || brandingSettings.unlock_method === 'both') {
                    return true;
                }
            }
            
            if (brandingSettings.unlock_method === 'free') return true;
            
            return false;
        }

        function updateBrandingUI() {
            const titleEl = document.getElementById('branding-status-title');
            const descEl = document.getElementById('branding-status-desc');
            const btnEl = document.getElementById('branding-action-btn');
            
            if (!titleEl) return;
            
            if (!brandingSettings.enable) {
                titleEl.innerText = "Branding Disabled";
                descEl.innerText = "System-wide branding is currently disabled.";
                btnEl.style.display = 'none';
                return;
            }
            
            if (isBrandingRemoved()) {
                let unlockedBy = "Unlocked";
                if (userProfile.branding_unlocked) unlockedBy = "Unlocked by One-Time Purchase";
                else if (userProfile.subscription_tier === 'PRO') unlockedBy = "Unlocked by Premium";
                else if (brandingSettings.unlock_method === 'free') unlockedBy = "Free Access";
                
                titleEl.innerText = "Branding Removed";
                descEl.innerText = unlockedBy;
                btnEl.style.display = 'none';
            } else {
                titleEl.innerText = "Branding Enabled";
                descEl.innerText = "QR Pro watermark will be applied to your creations.";
                
                if (brandingSettings.allow_removal && (brandingSettings.unlock_method !== 'subscription' || !userProfile.subscription_tier || userProfile.subscription_tier !== 'PRO')) {
                    btnEl.style.display = 'block';
                } else {
                    btnEl.style.display = 'none';
                }
            }
        }

        function handleRemoveBranding() {
            const container = document.getElementById('branding-options-container');
            container.innerHTML = '';
            
            if (brandingSettings.unlock_method === 'one-time' || brandingSettings.unlock_method === 'both') {
                container.innerHTML += \`
                    <button onclick="purchaseBrandingOnetime()" class="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-blue-500 transition-all flex items-center justify-between group">
                        <div>
                            <p class="font-bold text-slate-900 group-hover:text-blue-600"><i class="fas fa-shopping-cart mr-2 text-slate-400 group-hover:text-blue-500"></i> One-Time Purchase</p>
                            <p class="text-sm text-slate-500 mt-1">Pay once, remove branding forever.</p>
                        </div>
                        <div class="font-black text-lg text-slate-900">\${brandingSettings.currency === 'INR' ? '₹' : brandingSettings.currency}\${brandingSettings.price}</div>
                    </button>
                \`;
            }
            
            if (brandingSettings.unlock_method === 'subscription' || brandingSettings.unlock_method === 'both') {
                container.innerHTML += \`
                    <button onclick="document.getElementById('branding-popup').classList.add('hidden'); handleDirectUpgrade();" class="w-full text-left p-4 rounded-xl border-2 border-indigo-100 bg-indigo-50 hover:border-indigo-500 transition-all flex items-center justify-between group">
                        <div>
                            <p class="font-bold text-indigo-900 group-hover:text-indigo-600"><i class="fas fa-bolt mr-2 text-indigo-400 group-hover:text-indigo-500"></i> Upgrade to Premium</p>
                            <p class="text-sm text-indigo-700/70 mt-1">Included with Premium plan.</p>
                        </div>
                        <div class="font-black text-lg text-indigo-900">₹99<span class="text-xs font-normal opacity-70">/mo</span></div>
                    </button>
                \`;
            }
            
            document.getElementById('branding-popup').classList.remove('hidden');
            document.getElementById('branding-popup').classList.add('flex');
        }

        async function purchaseBrandingOnetime() {
            // Mock Cashfree integration for branding
            alert("Redirecting to Cashfree Payment Gateway...");
            setTimeout(() => {
                const success = confirm("Mock Payment: Click OK for Success, Cancel for Failure.");
                if (success) {
                    alert("Payment Successful! Branding Removal unlocked permanently.");
                    userProfile.branding_unlocked = true;
                    if (supabaseClient) {
                        supabaseClient.from('profiles').update({ branding_unlocked: true }).eq('id', currentUser.id).then();
                        // Update analytics
                        brandingSettings.onetime_unlocks = (brandingSettings.onetime_unlocks || 0) + 1;
                        brandingSettings.sales = (brandingSettings.sales || 0) + 1;
                        brandingSettings.revenue = (brandingSettings.revenue || 0) + brandingSettings.price;
                        supabaseClient.from('settings').upsert({ id: 'branding_settings', value: brandingSettings }).then();
                    } else {
                        let localProfile = JSON.parse(localStorage.getItem('profile_' + currentUser.id)) || {};
                        localProfile.branding_unlocked = true;
                        localStorage.setItem('profile_' + currentUser.id, JSON.stringify(localProfile));
                        
                        brandingSettings.onetime_unlocks = (brandingSettings.onetime_unlocks || 0) + 1;
                        brandingSettings.sales = (brandingSettings.sales || 0) + 1;
                        brandingSettings.revenue = (brandingSettings.revenue || 0) + brandingSettings.price;
                        localStorage.setItem('branding_settings', JSON.stringify(brandingSettings));
                    }
                    document.getElementById('branding-popup').classList.add('hidden');
                    updateBrandingUI();
                } else {
                    alert("Payment Failed or Cancelled.");
                }
            }, 1000);
        }
`;

content = content.replace(/(async function updateAuthUI\(user\) \{)/, scripts + '\n        $1');
content = content.replace(/(await loadPricingPlans\(\);)/, '$1\n            await loadBrandingSettings();');
content = content.replace(/(updateSubscriptionUI\(\);)/g, '$1\n            updateBrandingUI();');

fs.writeFileSync('user.html', content);
