const fs = require('fs');

let adminHtml = fs.readFileSync('admin.html', 'utf8');

const marketingSection = `
            <!-- Marketing Automation Section -->
            <section id="marketing" class="section hidden">
                <div class="glass-panel p-6">
                    <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                        <div>
                            <h3 class="text-xl font-bold text-gray-800">Marketing Automation</h3>
                            <p class="text-sm text-gray-500">Create, schedule and manage dynamic marketing campaigns, popups, and banners.</p>
                        </div>
                        <button onclick="openCampaignBuilder()" class="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2">
                            <i class="fas fa-plus"></i> Create New Campaign
                        </button>
                    </div>

                    <!-- Campaigns Stats -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div class="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                            <p class="text-xs text-indigo-500 font-bold uppercase mb-1">Active Campaigns</p>
                            <h4 class="text-2xl font-bold text-indigo-700" id="stat-active-campaigns">0</h4>
                        </div>
                        <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <p class="text-xs text-blue-500 font-bold uppercase mb-1">Total Views</p>
                            <h4 class="text-2xl font-bold text-blue-700" id="stat-campaign-views">0</h4>
                        </div>
                        <div class="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                            <p class="text-xs text-emerald-500 font-bold uppercase mb-1">Total Conversions</p>
                            <h4 class="text-2xl font-bold text-emerald-700" id="stat-campaign-conversions">0</h4>
                        </div>
                        <div class="bg-purple-50 rounded-xl p-4 border border-purple-100">
                            <p class="text-xs text-purple-500 font-bold uppercase mb-1">Avg. CTR</p>
                            <h4 class="text-2xl font-bold text-purple-700" id="stat-campaign-ctr">0%</h4>
                        </div>
                    </div>

                    <!-- Campaigns Table -->
                    <div class="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
                        <table class="w-full text-left border-collapse">
                            <thead>
                                <tr class="bg-gray-50 border-b border-gray-100">
                                    <th class="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Campaign</th>
                                    <th class="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Targeting & Trigger</th>
                                    <th class="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Performance</th>
                                    <th class="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th class="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="campaigns-table-body" class="divide-y divide-gray-50">
                                <tr><td colspan="5" class="p-8 text-center text-gray-500">Loading campaigns...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
`;

adminHtml = adminHtml.replace('            <!-- User Management Section -->', marketingSection + '\n            <!-- User Management Section -->');

const marketingModal = `
    <!-- Campaign Builder Modal -->
    <div id="campaign-builder-modal" class="fixed inset-0 bg-black/60 hidden flex items-center justify-center z-[100] backdrop-blur-sm p-4 overflow-y-auto">
        <div class="bg-slate-50 w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div class="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
                <div>
                    <h3 class="text-xl font-bold text-gray-800" id="campaign-modal-title">Create Campaign</h3>
                    <p class="text-sm text-gray-500">Design, target, and automate marketing</p>
                </div>
                <button type="button" onclick="closeCampaignBuilder()" class="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>
            
            <div class="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
                
                <!-- Left: Form -->
                <div class="flex-1 space-y-6">
                    <!-- General -->
                    <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h4 class="font-bold text-gray-800 mb-4 border-b pb-2"><i class="fas fa-info-circle text-blue-500 mr-2"></i>General Info</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Campaign Name</label>
                                <input type="text" id="camp-name" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="e.g. Black Friday Promo" required>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Campaign Type</label>
                                <select id="camp-type" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                                    <option value="promo">Promotional Offer</option>
                                    <option value="welcome">Welcome/Onboarding</option>
                                    <option value="upgrade">Upgrade Reminder</option>
                                    <option value="announcement">Feature Announcement</option>
                                    <option value="retention">Retention/Recovery</option>
                                    <option value="custom">Custom Automation</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Display & Content -->
                    <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h4 class="font-bold text-gray-800 mb-4 border-b pb-2"><i class="fas fa-paint-brush text-pink-500 mr-2"></i>Display & Content</h4>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Display Method</label>
                                <select id="camp-display" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" onchange="updateCampaignPreview()">
                                    <option value="modal">Center Modal (High Interruption)</option>
                                    <option value="bottom_sheet">Bottom Sheet (Mobile Friendly)</option>
                                    <option value="toast">Toast Notification (Low Interruption)</option>
                                    <option value="floating_card">Floating Card (Bottom Right)</option>
                                    <option value="top_banner">Top Sticky Banner</option>
                                    <option value="hero">Hero Injection</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Headline</label>
                                <input type="text" id="camp-title" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="Unlock Premium Features!" onkeyup="updateCampaignPreview()">
                            </div>

                            <div>
                                <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Body Text (HTML supported)</label>
                                <textarea id="camp-body" rows="3" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="Get 50% off for the next 24 hours..." onkeyup="updateCampaignPreview()"></textarea>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Image/Icon URL</label>
                                    <input type="text" id="camp-image" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" placeholder="https://..." onchange="updateCampaignPreview()">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Theme Color</label>
                                    <div class="flex gap-2">
                                        <input type="color" id="camp-color" value="#4f46e5" class="h-9 w-12 rounded cursor-pointer" onchange="updateCampaignPreview()">
                                        <input type="text" id="camp-color-hex" value="#4f46e5" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" onchange="document.getElementById('camp-color').value=this.value; updateCampaignPreview()">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Primary CTA Text</label>
                                    <input type="text" id="camp-cta-text" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" value="Upgrade Now" onkeyup="updateCampaignPreview()">
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Primary CTA Action</label>
                                    <select id="camp-cta-action" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                                        <option value="checkout_pro">Open Pro Checkout</option>
                                        <option value="checkout_lifetime">Open Lifetime Checkout</option>
                                        <option value="url">Open Custom URL</option>
                                        <option value="dismiss">Just Dismiss</option>
                                    </select>
                                </div>
                            </div>
                            <div id="camp-cta-url-container" class="hidden">
                                <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Custom URL</label>
                                <input type="url" id="camp-cta-url" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="https://...">
                            </div>
                        </div>
                    </div>

                    <!-- Targeting -->
                    <div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                        <h4 class="font-bold text-gray-800 mb-4 border-b pb-2"><i class="fas fa-crosshairs text-emerald-500 mr-2"></i>Targeting & Triggers</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Audience</label>
                                <select id="camp-audience" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                                    <option value="all">All Users & Guests</option>
                                    <option value="logged_in">Logged In Users Only</option>
                                    <option value="free_only">Free Plan Users Only</option>
                                    <option value="pro_only">Pro Plan Users Only</option>
                                    <option value="lifetime_only">Lifetime Plan Users Only</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Trigger Event</label>
                                <select id="camp-trigger" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                                    <option value="on_load">On App Load</option>
                                    <option value="on_qr_generate">After QR Generation</option>
                                    <option value="on_logo_generate">After Logo Generation</option>
                                    <option value="on_qr_download">After QR Download</option>
                                    <option value="exit_intent">Exit Intent (Mouse Leaves Viewport)</option>
                                    <option value="time_delay">Time Delay (e.g. 30s)</option>
                                </select>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Frequency</label>
                                <select id="camp-frequency" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
                                    <option value="once_ever">Show Once per User (Ever)</option>
                                    <option value="once_session">Show Once per Session</option>
                                    <option value="once_day">Show Once a Day</option>
                                    <option value="always">Always Show on Trigger</option>
                                </select>
                            </div>
                            <div id="camp-delay-container" class="hidden">
                                <label class="block text-xs font-bold text-gray-600 uppercase mb-1">Delay (seconds)</label>
                                <input type="number" id="camp-delay" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" value="5">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right: Preview -->
                <div class="w-full md:w-1/3 flex flex-col">
                    <h4 class="font-bold text-gray-800 mb-4 uppercase text-xs tracking-wider">Live Preview</h4>
                    <div class="bg-slate-200 rounded-xl flex-1 flex items-center justify-center relative overflow-hidden border-2 border-slate-300 border-dashed p-4" id="camp-preview-container">
                        <!-- Preview will be rendered here -->
                    </div>
                </div>
            </div>

            <div class="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                <button type="button" onclick="closeCampaignBuilder()" class="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
                <button type="button" onclick="saveCampaign('draft')" class="px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-xl shadow-md transition-all">Save as Draft</button>
                <button type="button" onclick="saveCampaign('active')" class="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"><i class="fas fa-paper-plane"></i> Publish Campaign</button>
            </div>
            <input type="hidden" id="camp-id" value="">
        </div>
    </div>
`;

adminHtml = adminHtml.replace('    <!-- End Content -->', marketingModal + '\n    <!-- End Content -->');

fs.writeFileSync('admin.html', adminHtml);
