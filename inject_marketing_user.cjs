const fs = require('fs');
let userHtml = fs.readFileSync('user.html', 'utf8');

const jsCode = `
        // ==========================================
        // MARKETING AUTOMATION ENGINE
        // ==========================================
        let activeMarketingCampaigns = [];

        async function loadMarketingCampaigns() {
            if (!supabaseClient) return;
            try {
                const { data, error } = await supabaseClient
                    .from('settings')
                    .select('value')
                    .eq('id', 'marketing_campaigns')
                    .maybeSingle();
                
                if (data && data.value) {
                    activeMarketingCampaigns = data.value.filter(c => c.status === 'active');
                }
            } catch (err) {
                console.error("Error loading marketing campaigns:", err);
            }
        }

        window.evaluateMarketingTriggers = function(triggerEvent) {
            if (!activeMarketingCampaigns || activeMarketingCampaigns.length === 0) return;
            
            activeMarketingCampaigns.forEach(camp => {
                const trigger = camp.triggers.event;
                if (trigger !== triggerEvent) return;

                // Targeting Checks
                if (camp.targeting.audience !== 'all') {
                    if (!userProfile || !userProfile.id) return; // Guest
                    
                    if (camp.targeting.audience === 'free_only' && userProfile.subscription_tier !== 'FREE') return;
                    if (camp.targeting.audience === 'pro_only' && userProfile.subscription_tier !== 'PRO') return;
                    if (camp.targeting.audience === 'lifetime_only' && userProfile.subscription_tier !== 'LIFETIME') return;
                }
                
                // Frequency Checks
                const seenKey = 'mc_seen_' + camp.id;
                const freq = camp.triggers.frequency;
                
                if (freq === 'once_ever' && localStorage.getItem(seenKey)) return;
                if (freq === 'once_session' && sessionStorage.getItem(seenKey)) return;
                if (freq === 'once_day') {
                    const lastSeen = localStorage.getItem(seenKey + '_time');
                    if (lastSeen && (Date.now() - parseInt(lastSeen)) < 86400000) return;
                }
                
                // Show Campaign after Delay
                const delay = parseInt(camp.triggers.delay || 0) * 1000;
                
                setTimeout(() => {
                    // Update seen statuses
                    localStorage.setItem(seenKey, 'true');
                    sessionStorage.setItem(seenKey, 'true');
                    localStorage.setItem(seenKey + '_time', Date.now().toString());
                    
                    renderMarketingCampaign(camp);
                    trackCampaignMetric(camp.id, 'views');
                }, delay);
            });
        };

        function trackCampaignMetric(id, metric) {
            // Optimistic fire-and-forget to track analytics
            if (!supabaseClient) return;
            // In a real high-scale prod, we would use an edge function or RPC, but since we are optimizing for Free plan without migrations, we will just update the JSON setting directly. Note: this has a race condition risk but it's acceptable for this scope.
            
            // Wait a random jitter to reduce race conditions
            setTimeout(async () => {
                const { data } = await supabaseClient.from('settings').select('value').eq('id', 'marketing_campaigns').maybeSingle();
                if (data && data.value) {
                    let camps = data.value;
                    let target = camps.find(c => c.id === id);
                    if (target) {
                        if (!target.analytics) target.analytics = { views: 0, clicks: 0, dismisses: 0 };
                        target.analytics[metric] = (target.analytics[metric] || 0) + 1;
                        await supabaseClient.from('settings').upsert({ id: 'marketing_campaigns', value: camps });
                    }
                }
            }, Math.random() * 2000);
        }

        window.marketingCtaAction = function(campId, action, url) {
            trackCampaignMetric(campId, 'clicks');
            document.getElementById('mc_wrapper_' + campId)?.remove();
            
            if (action === 'checkout_pro') {
                if (!userProfile || !userProfile.id) { showAuthModal(); return; }
                handleSubscription('price_pro_monthly'); // Placeholder or specific ID
            } else if (action === 'checkout_lifetime') {
                if (!userProfile || !userProfile.id) { showAuthModal(); return; }
                handleSubscription('price_lifetime'); 
            } else if (action === 'url' && url) {
                window.open(url, '_blank');
            }
        };

        window.dismissMarketingCampaign = function(campId) {
            trackCampaignMetric(campId, 'dismisses');
            document.getElementById('mc_wrapper_' + campId)?.remove();
        };

        function renderMarketingCampaign(camp) {
            // Don't render if it already exists
            if (document.getElementById('mc_wrapper_' + camp.id)) return;
            
            const display = camp.display.method;
            const title = camp.content.title;
            const body = camp.content.body;
            const image = camp.content.image;
            const color = camp.content.color || '#4f46e5';
            const ctaText = camp.content.ctaText || 'Claim Offer';
            const ctaAction = camp.content.ctaAction;
            const ctaUrl = camp.content.ctaUrl;

            const wrapper = document.createElement('div');
            wrapper.id = 'mc_wrapper_' + camp.id;
            wrapper.className = 'fixed z-[9999] transition-all duration-500 ease-out opacity-0';
            
            const imgHtml = image ? \`<img src="\${image}" class="\${display === 'modal' ? 'w-24 h-24 mx-auto mb-4' : (display === 'bottom_sheet' ? 'w-16 h-16' : 'w-10 h-10')} rounded-xl object-cover">\` : '';
            
            const btnHtml = \`<button onclick="marketingCtaAction('\${camp.id}', '\${ctaAction}', '\${ctaUrl}')" class="px-5 py-2.5 text-white font-bold rounded-xl shadow-md w-full hover:opacity-90 active:scale-95 transition-all mt-4" style="background-color: \${color}">\${ctaText}</button>\`;

            if (display === 'modal') {
                wrapper.classList.add('inset-0', 'bg-black/60', 'backdrop-blur-sm', 'flex', 'items-center', 'justify-center', 'p-4');
                wrapper.innerHTML = \`
                    <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center relative transform scale-95 transition-transform" id="mc_inner_\${camp.id}">
                        <button onclick="dismissMarketingCampaign('\${camp.id}')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"><i class="fas fa-times"></i></button>
                        \${imgHtml}
                        <h4 class="text-2xl font-bold text-gray-800 mb-3">\${title}</h4>
                        <div class="text-sm text-gray-500 mb-6 prose">\${body}</div>
                        \${btnHtml}
                    </div>
                \`;
            } else if (display === 'toast') {
                wrapper.classList.add('bottom-4', 'right-4', 'translate-y-10');
                wrapper.innerHTML = \`
                    <div class="bg-white rounded-2xl shadow-xl p-4 max-w-sm w-full flex flex-col gap-3 border border-gray-100 relative">
                        <button onclick="dismissMarketingCampaign('\${camp.id}')" class="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><i class="fas fa-times text-xs"></i></button>
                        <div class="flex items-center gap-3">
                            \${image ? imgHtml : \`<div class="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0" style="background-color: \${color}"><i class="fas fa-gift"></i></div>\`}
                            <div class="flex-1 pr-4">
                                <h4 class="text-sm font-bold text-gray-800">\${title}</h4>
                                <div class="text-xs text-gray-500 line-clamp-2 prose">\${body}</div>
                            </div>
                        </div>
                        <button onclick="marketingCtaAction('\${camp.id}', '\${ctaAction}', '\${ctaUrl}')" class="px-4 py-2 w-full text-white text-xs font-bold rounded-lg shadow-sm hover:opacity-90 transition-opacity" style="background-color: \${color}">\${ctaText}</button>
                    </div>
                \`;
            } else if (display === 'bottom_sheet') {
                wrapper.classList.add('inset-0', 'bg-black/40', 'flex', 'items-end', 'sm:items-center', 'sm:justify-center');
                wrapper.innerHTML = \`
                    <div class="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 w-full max-w-md transform translate-y-full sm:translate-y-10 transition-transform" id="mc_inner_\${camp.id}">
                        <div class="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>
                        <button onclick="dismissMarketingCampaign('\${camp.id}')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 hidden sm:flex"><i class="fas fa-times"></i></button>
                        <div class="flex gap-4 items-center mb-6">
                            \${imgHtml}
                            <div class="flex-1 text-left">
                                <h4 class="text-xl font-bold text-gray-800 mb-1">\${title}</h4>
                                <div class="text-sm text-gray-500 line-clamp-3 prose">\${body}</div>
                            </div>
                        </div>
                        \${btnHtml}
                        <button onclick="dismissMarketingCampaign('\${camp.id}')" class="w-full mt-3 py-2 text-sm text-gray-500 font-medium sm:hidden">Maybe Later</button>
                    </div>
                \`;
            } else if (display === 'top_banner') {
                wrapper.classList.add('top-0', 'left-0', 'right-0', '-translate-y-full');
                wrapper.innerHTML = \`
                    <div class="w-full px-4 py-3 text-white flex flex-col sm:flex-row items-center justify-center gap-4 shadow-md relative" style="background-color: \${color}">
                        <button onclick="dismissMarketingCampaign('\${camp.id}')" class="absolute top-1/2 -translate-y-1/2 right-4 text-white/70 hover:text-white"><i class="fas fa-times"></i></button>
                        <div class="flex items-center gap-3 text-center sm:text-left pr-6">
                            \${imgHtml}
                            <div class="text-sm">
                                <span class="font-bold mr-1">\${title}</span>
                                <span class="opacity-90 prose hidden sm:inline">\${body}</span>
                            </div>
                        </div>
                        <button onclick="marketingCtaAction('\${camp.id}', '\${ctaAction}', '\${ctaUrl}')" class="bg-white text-gray-900 px-4 py-1.5 text-xs font-bold rounded-full shadow-sm hover:scale-105 transition-transform whitespace-nowrap shrink-0">\${ctaText}</button>
                    </div>
                \`;
            }

            document.body.appendChild(wrapper);

            // Animate In
            requestAnimationFrame(() => {
                wrapper.classList.remove('opacity-0');
                if (display === 'toast') wrapper.classList.remove('translate-y-10');
                if (display === 'top_banner') wrapper.classList.remove('-translate-y-full');
                
                const inner = document.getElementById('mc_inner_' + camp.id);
                if (inner) {
                    if (display === 'modal') inner.classList.remove('scale-95');
                    if (display === 'bottom_sheet') {
                        inner.classList.remove('translate-y-full');
                        inner.classList.remove('sm:translate-y-10');
                    }
                }
            });
        }
`;

// Insert the JS code right before `window.evaluateTriggers = function` so we can call evaluateMarketingTriggers inside it.
userHtml = userHtml.replace('window.evaluateTriggers = function(triggerEvent, specificNotif = null) {', jsCode + '\n        window.evaluateTriggers = function(triggerEvent, specificNotif = null) {\n            if(typeof evaluateMarketingTriggers === "function") evaluateMarketingTriggers(triggerEvent);\n');

// Also inject `await loadMarketingCampaigns();` into `init()` just like `await loadFeatureConfigs();`
userHtml = userHtml.replace('await loadFeatureConfigs();', 'await loadFeatureConfigs();\n            await loadMarketingCampaigns();');

fs.writeFileSync('user.html', userHtml);
