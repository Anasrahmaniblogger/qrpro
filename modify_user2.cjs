const fs = require('fs');
let content = fs.readFileSync('user.html', 'utf8');

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
                    <div class="w-full text-left p-5 rounded-2xl border-2 border-slate-200 hover:border-blue-500 transition-all flex flex-col gap-4 group bg-white shadow-sm hover:shadow-md">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="font-extrabold text-slate-900 text-lg flex items-center gap-2 group-hover:text-blue-600">
                                    <i class="fas fa-check-circle text-emerald-500 text-xl"></i> One-Time Purchase
                                </p>
                                <p class="text-sm text-slate-500 mt-1 pl-7">Pay once, remove branding forever.</p>
                            </div>
                            <div class="text-right">
                                \${brandingSettings.strike_price ? '<p class="text-xs text-slate-400 line-through">' + (brandingSettings.currency === 'INR' ? '₹' : brandingSettings.currency) + brandingSettings.strike_price + '</p>' : ''}
                                <div class="font-black text-2xl text-slate-900">\${brandingSettings.currency === 'INR' ? '₹' : brandingSettings.currency}\${brandingSettings.price}</div>
                            </div>
                        </div>
                        <button onclick="purchaseBrandingOnetime()" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all">Buy Now</button>
                    </div>
                \`;
            }
            
            if (brandingSettings.unlock_method === 'subscription' || brandingSettings.unlock_method === 'both') {
                container.innerHTML += \`
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

content = content.replace(/(function updateAuthUI\(user\) \{)/, scripts + '\n        $1');
content = content.replace(/(await loadPricingPlans\(\);)/, '$1\n            await loadBrandingSettings();');
content = content.replace(/(updateSubscriptionUI\(\);)/g, '$1\n            updateBrandingUI();');

fs.writeFileSync('user.html', content);
