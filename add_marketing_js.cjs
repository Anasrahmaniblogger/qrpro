const fs = require('fs');
let adminHtml = fs.readFileSync('admin.html', 'utf8');

const jsCode = `
        // ==========================================
        // MARKETING AUTOMATION JS
        // ==========================================
        let marketingCampaigns = [];

        async function loadMarketingCampaigns() {
            if (!supabaseClient) return;
            try {
                const { data, error } = await supabaseClient
                    .from('settings')
                    .select('value')
                    .eq('id', 'marketing_campaigns')
                    .maybeSingle();
                
                if (data && data.value) {
                    marketingCampaigns = data.value;
                } else {
                    marketingCampaigns = [];
                }
                renderMarketingCampaigns();
            } catch (err) {
                console.error("Error loading campaigns:", err);
            }
        }

        function renderMarketingCampaigns() {
            const tbody = document.getElementById('campaigns-table-body');
            if (!tbody) return;
            tbody.innerHTML = '';
            
            let activeCount = 0;
            let totalViews = 0;
            let totalConversions = 0;

            if (marketingCampaigns.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-gray-500">No campaigns found. Create one!</td></tr>';
            } else {
                marketingCampaigns.forEach((camp, index) => {
                    if (camp.status === 'active') activeCount++;
                    const views = camp.analytics?.views || 0;
                    const clicks = camp.analytics?.clicks || 0;
                    totalViews += views;
                    totalConversions += clicks;

                    let statusBadge = '<span class="px-2.5 py-1 text-[10px] font-bold rounded-full bg-slate-100 text-slate-600">Draft</span>';
                    if (camp.status === 'active') statusBadge = '<span class="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-600">Active</span>';
                    if (camp.status === 'paused') statusBadge = '<span class="px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-100 text-amber-600">Paused</span>';

                    const tr = document.createElement('tr');
                    tr.className = "hover:bg-slate-50/50 transition-colors";
                    tr.innerHTML = \`
                        <td class="p-4 align-middle">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style="background-color: \${camp.content.color}">
                                    \${camp.content.title.substring(0,2).toUpperCase()}
                                </div>
                                <div>
                                    <p class="text-sm font-bold text-gray-800">\${camp.name}</p>
                                    <p class="text-xs text-gray-500 capitalize">\${camp.type} &bull; \${camp.display.method.replace('_', ' ')}</p>
                                </div>
                            </div>
                        </td>
                        <td class="p-4 align-middle">
                            <p class="text-xs text-gray-700 font-bold mb-1"><i class="fas fa-users text-emerald-500 mr-1"></i>\${camp.targeting.audience.replace('_', ' ')}</p>
                            <p class="text-[11px] text-gray-500"><i class="fas fa-bolt text-amber-500 mr-1"></i>\${camp.triggers.event.replace('_', ' ')}</p>
                        </td>
                        <td class="p-4 align-middle">
                            <div class="flex items-center gap-4">
                                <div class="text-center">
                                    <p class="text-xs font-bold text-gray-800">\${views}</p>
                                    <p class="text-[10px] text-gray-500 uppercase tracking-wider">Views</p>
                                </div>
                                <div class="text-center">
                                    <p class="text-xs font-bold text-emerald-600">\${clicks}</p>
                                    <p class="text-[10px] text-gray-500 uppercase tracking-wider">Clicks</p>
                                </div>
                            </div>
                        </td>
                        <td class="p-4 align-middle">
                            \${statusBadge}
                        </td>
                        <td class="p-4 align-middle text-right">
                            <button onclick="editCampaign('\${camp.id}')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mr-1" title="Edit"><i class="fas fa-edit"></i></button>
                            \${camp.status === 'active' ? 
                                \`<button onclick="toggleCampaignStatus('\${camp.id}', 'paused')" class="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors mr-1" title="Pause"><i class="fas fa-pause"></i></button>\` : 
                                \`<button onclick="toggleCampaignStatus('\${camp.id}', 'active')" class="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors mr-1" title="Activate"><i class="fas fa-play"></i></button>\`
                            }
                            <button onclick="deleteCampaign('\${camp.id}')" class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><i class="fas fa-trash"></i></button>
                        </td>
                    \`;
                    tbody.appendChild(tr);
                });
            }

            document.getElementById('stat-active-campaigns').innerText = activeCount;
            document.getElementById('stat-campaign-views').innerText = totalViews;
            document.getElementById('stat-campaign-conversions').innerText = totalConversions;
            const ctr = totalViews > 0 ? ((totalConversions/totalViews)*100).toFixed(1) : 0;
            document.getElementById('stat-campaign-ctr').innerText = ctr + '%';
        }

        function openCampaignBuilder() {
            document.getElementById('camp-id').value = '';
            document.getElementById('camp-name').value = '';
            document.getElementById('camp-type').value = 'promo';
            document.getElementById('camp-display').value = 'modal';
            document.getElementById('camp-title').value = '';
            document.getElementById('camp-body').value = '';
            document.getElementById('camp-image').value = '';
            document.getElementById('camp-color').value = '#4f46e5';
            document.getElementById('camp-color-hex').value = '#4f46e5';
            document.getElementById('camp-cta-text').value = 'Upgrade Now';
            document.getElementById('camp-cta-action').value = 'checkout_pro';
            document.getElementById('camp-cta-url').value = '';
            document.getElementById('camp-audience').value = 'all';
            document.getElementById('camp-trigger').value = 'on_load';
            document.getElementById('camp-frequency').value = 'once_ever';
            document.getElementById('camp-delay').value = '5';
            
            document.getElementById('camp-cta-url-container').classList.add('hidden');
            document.getElementById('camp-delay-container').classList.add('hidden');
            
            document.getElementById('campaign-modal-title').innerText = "Create Campaign";
            document.getElementById('campaign-builder-modal').classList.remove('hidden');
            updateCampaignPreview();
        }

        function closeCampaignBuilder() {
            document.getElementById('campaign-builder-modal').classList.add('hidden');
        }

        function editCampaign(id) {
            const camp = marketingCampaigns.find(c => c.id === id);
            if (!camp) return;

            document.getElementById('camp-id').value = camp.id;
            document.getElementById('camp-name').value = camp.name;
            document.getElementById('camp-type').value = camp.type;
            document.getElementById('camp-display').value = camp.display.method;
            document.getElementById('camp-title').value = camp.content.title;
            document.getElementById('camp-body').value = camp.content.body;
            document.getElementById('camp-image').value = camp.content.image || '';
            document.getElementById('camp-color').value = camp.content.color || '#4f46e5';
            document.getElementById('camp-color-hex').value = camp.content.color || '#4f46e5';
            document.getElementById('camp-cta-text').value = camp.content.ctaText;
            document.getElementById('camp-cta-action').value = camp.content.ctaAction;
            document.getElementById('camp-cta-url').value = camp.content.ctaUrl || '';
            
            document.getElementById('camp-audience').value = camp.targeting.audience;
            document.getElementById('camp-trigger').value = camp.triggers.event;
            document.getElementById('camp-frequency').value = camp.triggers.frequency || 'once_ever';
            document.getElementById('camp-delay').value = camp.triggers.delay || '5';

            document.getElementById('camp-cta-url-container').classList.toggle('hidden', camp.content.ctaAction !== 'url');
            document.getElementById('camp-delay-container').classList.toggle('hidden', camp.triggers.event !== 'time_delay');

            document.getElementById('campaign-modal-title').innerText = "Edit Campaign";
            document.getElementById('campaign-builder-modal').classList.remove('hidden');
            updateCampaignPreview();
        }

        async function saveCampaign(status) {
            const name = document.getElementById('camp-name').value.trim();
            if (!name) return showToast('Campaign name is required', 'error');

            const id = document.getElementById('camp-id').value || 'camp_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
            
            const newCamp = {
                id,
                name,
                type: document.getElementById('camp-type').value,
                display: {
                    method: document.getElementById('camp-display').value
                },
                content: {
                    title: document.getElementById('camp-title').value,
                    body: document.getElementById('camp-body').value,
                    image: document.getElementById('camp-image').value,
                    color: document.getElementById('camp-color').value,
                    ctaText: document.getElementById('camp-cta-text').value,
                    ctaAction: document.getElementById('camp-cta-action').value,
                    ctaUrl: document.getElementById('camp-cta-url').value
                },
                targeting: {
                    audience: document.getElementById('camp-audience').value
                },
                triggers: {
                    event: document.getElementById('camp-trigger').value,
                    frequency: document.getElementById('camp-frequency').value,
                    delay: document.getElementById('camp-delay').value
                },
                status: status,
                analytics: { views: 0, clicks: 0, dismisses: 0 }
            };

            const existingIndex = marketingCampaigns.findIndex(c => c.id === id);
            if (existingIndex >= 0) {
                // Preserve analytics if editing
                newCamp.analytics = marketingCampaigns[existingIndex].analytics || newCamp.analytics;
                marketingCampaigns[existingIndex] = newCamp;
            } else {
                newCamp.created_at = new Date().toISOString();
                marketingCampaigns.push(newCamp);
            }

            try {
                await supabaseClient.from('settings').upsert({ id: 'marketing_campaigns', value: marketingCampaigns });
                showToast(\`Campaign \${status === 'active' ? 'published' : 'saved'} successfully\`, 'success');
                closeCampaignBuilder();
                renderMarketingCampaigns();
            } catch (err) {
                console.error("Save err:", err);
                showToast("Failed to save campaign", "error");
            }
        }

        async function toggleCampaignStatus(id, newStatus) {
            const camp = marketingCampaigns.find(c => c.id === id);
            if (camp) {
                camp.status = newStatus;
                await supabaseClient.from('settings').upsert({ id: 'marketing_campaigns', value: marketingCampaigns });
                renderMarketingCampaigns();
                showToast("Campaign status updated", "success");
            }
        }

        async function deleteCampaign(id) {
            if (!confirm("Are you sure you want to delete this campaign? All analytics will be lost.")) return;
            marketingCampaigns = marketingCampaigns.filter(c => c.id !== id);
            await supabaseClient.from('settings').upsert({ id: 'marketing_campaigns', value: marketingCampaigns });
            renderMarketingCampaigns();
            showToast("Campaign deleted", "success");
        }

        function updateCampaignPreview() {
            const display = document.getElementById('camp-display').value;
            const title = document.getElementById('camp-title').value || 'Your Headline Here';
            const body = document.getElementById('camp-body').value || 'Your engaging marketing copy goes here...';
            const image = document.getElementById('camp-image').value;
            const color = document.getElementById('camp-color').value;
            const ctaText = document.getElementById('camp-cta-text').value || 'Click Me';
            
            const container = document.getElementById('camp-preview-container');
            
            let html = '';
            const imgHtml = image ? \`<img src="\${image}" class="w-24 h-24 object-cover mx-auto mb-4 rounded-xl shadow-sm">\` : '';
            
            const btnHtml = \`<button class="px-5 py-2.5 text-white font-bold rounded-xl shadow-md w-full" style="background-color: \${color}">\${ctaText}</button>\`;

            if (display === 'modal') {
                html = \`
                    <div class="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center scale-75 origin-center pointer-events-none transform transition-transform">
                        \${imgHtml}
                        <h4 class="text-lg font-bold text-gray-800 mb-2">\${title}</h4>
                        <p class="text-sm text-gray-500 mb-6">\${body}</p>
                        \${btnHtml}
                    </div>
                \`;
            } else if (display === 'toast') {
                html = \`
                    <div class="bg-white rounded-xl shadow-lg p-4 max-w-xs w-full flex items-center gap-3 absolute bottom-4 right-4 pointer-events-none">
                        \${image ? \`<img src="\${image}" class="w-10 h-10 rounded-lg object-cover">\` : \`<div class="w-10 h-10 rounded-lg flex items-center justify-center text-white" style="background-color: \${color}"><i class="fas fa-bell"></i></div>\`}
                        <div class="flex-1">
                            <h4 class="text-sm font-bold text-gray-800">\${title}</h4>
                            <p class="text-xs text-gray-500 line-clamp-1">\${body}</p>
                        </div>
                    </div>
                \`;
            } else if (display === 'bottom_sheet') {
                html = \`
                    <div class="bg-white rounded-t-2xl shadow-2xl p-6 w-full absolute bottom-0 left-0 pointer-events-none">
                        <div class="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4"></div>
                        <div class="flex gap-4 items-center mb-4">
                            \${imgHtml ? \`<img src="\${image}" class="w-16 h-16 rounded-xl object-cover">\` : ''}
                            <div class="flex-1 text-left">
                                <h4 class="text-lg font-bold text-gray-800">\${title}</h4>
                                <p class="text-sm text-gray-500 line-clamp-2">\${body}</p>
                            </div>
                        </div>
                        \${btnHtml}
                    </div>
                \`;
            } else if (display === 'top_banner') {
                html = \`
                    <div class="w-full absolute top-0 left-0 px-4 py-3 text-white flex items-center justify-between pointer-events-none shadow-md" style="background-color: \${color}">
                        <div class="flex items-center gap-2">
                            \${image ? \`<img src="\${image}" class="w-6 h-6 rounded-full object-cover">\` : ''}
                            <div class="text-xs">
                                <span class="font-bold">\${title}</span> - \${body.substring(0,30)}...
                            </div>
                        </div>
                        <button class="bg-white/20 px-3 py-1 text-xs font-bold rounded-lg">\${ctaText}</button>
                    </div>
                \`;
            } else {
                html = \`<div class="bg-white p-4 rounded-xl text-center"><i class="fas fa-layer-group text-3xl mb-2 text-gray-300"></i><p class="text-sm text-gray-500">Preview not available for this format.</p></div>\`;
            }
            
            container.innerHTML = html;
        }
`;

adminHtml = adminHtml.replace('// ==========================================', jsCode + '\n        // ==========================================');
// And add loadMarketingCampaigns to showSection!
adminHtml = adminHtml.replace("} else if (id === 'features') {", "} else if (id === 'features') {\n                loadFeatureConfigs();\n            } else if (id === 'marketing') {\n                loadMarketingCampaigns();\n");

fs.writeFileSync('admin.html', adminHtml);
