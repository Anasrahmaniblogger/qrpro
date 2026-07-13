const fs = require('fs');
let content = fs.readFileSync('admin.html', 'utf8');

const navItem = `                <a class="nav-item" onclick="showSection('branding')">
                    <i class="fas fa-copyright"></i>
                    <span class="sidebar-text">Branding & Monetization</span>
                </a>`;
content = content.replace(/(<a class="nav-item" onclick="showSection\('settings'\)">)/, navItem + '\n                $1');

const sectionContent = `
            <!-- Branding Monetization Section -->
            <section id="branding" class="section">
                <div class="mb-6 flex justify-between items-center">
                    <div>
                        <h2 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Branding Removal</h2>
                        <p class="text-slate-500 mt-1">Manage branding rules, prices, and unlock methods.</p>
                    </div>
                    <button onclick="saveBrandingSettings()" class="btn btn-primary bg-blue-600 text-white px-4 py-2 rounded-lg">
                        <i class="fas fa-save mr-2"></i> Save Settings
                    </button>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <!-- Unlock Methods -->
                    <div class="glass-panel p-6">
                        <h3 class="text-xl font-bold mb-4">Unlock Methods</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium mb-1">Active Unlock Method</label>
                                <select id="branding-unlock-method" class="w-full bg-slate-50 border rounded-lg px-4 py-2">
                                    <option value="subscription">Premium Subscription Only</option>
                                    <option value="one-time">One-Time Payment Only</option>
                                    <option value="both">Both Subscription and One-Time Payment</option>
                                    <option value="free">Completely Free</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Subscription Expiration Rule</label>
                                <select id="branding-sub-expiry" class="w-full bg-slate-50 border rounded-lg px-4 py-2">
                                    <option value="locked_again">Branding becomes locked again</option>
                                    <option value="stays_unlocked">Branding stays unlocked</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Pricing & Offers -->
                    <div class="glass-panel p-6">
                        <h3 class="text-xl font-bold mb-4">Pricing & Offers (One-Time)</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-1">Price</label>
                                <input type="number" id="branding-price" class="w-full bg-slate-50 border rounded-lg px-4 py-2">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Currency</label>
                                <input type="text" id="branding-currency" value="INR" class="w-full bg-slate-50 border rounded-lg px-4 py-2">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Strike Price</label>
                                <input type="number" id="branding-strike-price" class="w-full bg-slate-50 border rounded-lg px-4 py-2">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Offer Price</label>
                                <input type="number" id="branding-offer-price" class="w-full bg-slate-50 border rounded-lg px-4 py-2">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Discount %</label>
                                <input type="number" id="branding-discount" class="w-full bg-slate-50 border rounded-lg px-4 py-2">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Tax %</label>
                                <input type="number" id="branding-tax" class="w-full bg-slate-50 border rounded-lg px-4 py-2">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Offer Start Date</label>
                                <input type="date" id="branding-offer-start" class="w-full bg-slate-50 border rounded-lg px-4 py-2">
                            </div>
                            <div>
                                <label class="block text-sm font-medium mb-1">Offer End Date</label>
                                <input type="date" id="branding-offer-end" class="w-full bg-slate-50 border rounded-lg px-4 py-2">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Feature Settings -->
                    <div class="glass-panel p-6">
                        <h3 class="text-xl font-bold mb-4">Settings</h3>
                        <div class="space-y-3">
                            <label class="flex items-center gap-3">
                                <input type="checkbox" id="branding-enable" class="w-5 h-5 rounded text-blue-600">
                                <span class="font-medium">Enable Branding System</span>
                            </label>
                            <label class="flex items-center gap-3">
                                <input type="checkbox" id="branding-mandatory" class="w-5 h-5 rounded text-blue-600">
                                <span class="font-medium">Mandatory Branding (for Free Users)</span>
                            </label>
                            <label class="flex items-center gap-3">
                                <input type="checkbox" id="branding-allow-removal" class="w-5 h-5 rounded text-blue-600">
                                <span class="font-medium">Allow Branding Removal</span>
                            </label>
                            <label class="flex items-center gap-3">
                                <input type="checkbox" id="branding-allow-white-label" class="w-5 h-5 rounded text-blue-600">
                                <span class="font-medium">Allow White Label</span>
                            </label>
                            <label class="flex items-center gap-3">
                                <input type="checkbox" id="branding-allow-company-logo" class="w-5 h-5 rounded text-blue-600">
                                <span class="font-medium">Allow Company Logo</span>
                            </label>
                            <label class="flex items-center gap-3">
                                <input type="checkbox" id="branding-allow-custom-footer" class="w-5 h-5 rounded text-blue-600">
                                <span class="font-medium">Allow Custom Footer</span>
                            </label>
                            <label class="flex items-center gap-3">
                                <input type="checkbox" id="branding-allow-custom-watermark" class="w-5 h-5 rounded text-blue-600">
                                <span class="font-medium">Allow Custom Watermark</span>
                            </label>
                            <label class="flex items-center gap-3">
                                <input type="checkbox" id="branding-allow-own-brand-name" class="w-5 h-5 rounded text-blue-600">
                                <span class="font-medium">Allow Own Brand Name</span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- Analytics -->
                    <div class="glass-panel p-6">
                        <h3 class="text-xl font-bold mb-4">Analytics</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="bg-blue-50 p-4 rounded-xl">
                                <p class="text-sm text-slate-500 font-medium">Brand Removal Sales</p>
                                <p id="analytic-branding-sales" class="text-2xl font-bold text-slate-800">0</p>
                            </div>
                            <div class="bg-indigo-50 p-4 rounded-xl">
                                <p class="text-sm text-slate-500 font-medium">Revenue</p>
                                <p id="analytic-branding-revenue" class="text-2xl font-bold text-slate-800">0</p>
                            </div>
                            <div class="bg-purple-50 p-4 rounded-xl">
                                <p class="text-sm text-slate-500 font-medium">Premium Unlocks</p>
                                <p id="analytic-branding-premium-unlocks" class="text-2xl font-bold text-slate-800">0</p>
                            </div>
                            <div class="bg-green-50 p-4 rounded-xl">
                                <p class="text-sm text-slate-500 font-medium">One-Time Unlocks</p>
                                <p id="analytic-branding-onetime-unlocks" class="text-2xl font-bold text-slate-800">0</p>
                            </div>
                            <div class="bg-red-50 p-4 rounded-xl">
                                <p class="text-sm text-slate-500 font-medium">Refunds</p>
                                <p id="analytic-branding-refunds" class="text-2xl font-bold text-slate-800">0</p>
                            </div>
                            <div class="bg-orange-50 p-4 rounded-xl">
                                <p class="text-sm text-slate-500 font-medium">Conversion Rate</p>
                                <p id="analytic-branding-conversion" class="text-2xl font-bold text-slate-800">0%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
`;
content = content.replace(/(<!-- Settings Section -->)/, sectionContent + '\n            $1');

fs.writeFileSync('admin.html', content);
