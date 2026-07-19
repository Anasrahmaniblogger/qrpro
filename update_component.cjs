const fs = require('fs');
let content = fs.readFileSync('user.html', 'utf8');

const componentScript = `
        // Reusable Branding Status Indicator Component
        class BrandingStatusIndicator extends HTMLElement {
            constructor() {
                super();
            }

            connectedCallback() {
                this.render();
                window.addEventListener('branding-updated', () => this.updateState());
                this.fetchData();
            }

            async fetchData() {
                try {
                    if (window.supabaseClient) {
                        const { data } = await window.supabaseClient.from('settings').select('*').eq('id', 'branding_settings').single();
                        if (data && data.value) {
                            window.brandingSettings = { ...window.brandingSettings, ...data.value };
                            window.dispatchEvent(new Event('branding-updated'));
                        }
                    } else {
                        const local = localStorage.getItem('branding_settings');
                        if (local) {
                            window.brandingSettings = { ...window.brandingSettings, ...JSON.parse(local) };
                            window.dispatchEvent(new Event('branding-updated'));
                        }
                    }
                } catch(e) {
                    console.error("Error fetching branding settings", e);
                }
            }
            
            updateState() {
                const badgeEl = this.querySelector('#branding-badge');
                if (!badgeEl) return;
                
                if (!window.brandingSettings || !window.brandingSettings.enable) {
                    badgeEl.innerHTML = \`<i class="fas fa-check-circle mr-1"></i> Branding Disabled\`;
                    badgeEl.className = "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200 cursor-default";
                    badgeEl.onclick = null;
                    return;
                }
                
                if (window.isBrandingRemoved && window.isBrandingRemoved()) {
                    badgeEl.innerHTML = \`<i class="fas fa-shield-alt mr-1"></i> Branding Removed\`;
                    badgeEl.className = "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-default shadow-sm";
                    badgeEl.onclick = null;
                } else {
                    badgeEl.innerHTML = \`<i class="fas fa-water mr-1"></i> Branding Enabled\`;
                    
                    if (window.brandingSettings.allow_removal && (window.brandingSettings.unlock_method !== 'subscription' || !window.userProfile || window.userProfile.subscription_tier !== 'PRO')) {
                        badgeEl.className = "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 cursor-pointer shadow-sm hover:bg-amber-200 hover:shadow transition-all";
                        badgeEl.title = "Click to remove branding";
                        badgeEl.onclick = () => {
                            if (window.handleRemoveBranding) window.handleRemoveBranding();
                        };
                    } else {
                        badgeEl.className = "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 cursor-default";
                        badgeEl.onclick = null;
                    }
                }
            }

            render() {
                this.innerHTML = \`
                    <div id="branding-badge" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200 cursor-wait">
                        <i class="fas fa-spinner fa-spin mr-1"></i> Loading Branding Status...
                    </div>
                \`;
                this.updateState();
            }
        }
        
        if (!customElements.get('branding-status-indicator')) {
            customElements.define('branding-status-indicator', BrandingStatusIndicator);
        }
`;

// Replace the old component script
const regex = /\/\/ Reusable Branding Status Indicator Component[\s\S]*?customElements\.define\('branding-status-indicator', BrandingStatusIndicator\);/;
content = content.replace(regex, componentScript.trim());

// Move the component next to the Dashboard Title
// Let's find:
// <h2 class="text-3xl font-bold text-slate-900">My Workspace</h2>
// <p class="text-slate-500">Welcome back! Here's your creative overview.</p>
// And insert it right after the H2.
content = content.replace(
    /(<h2 class="text-3xl font-bold text-slate-900">My Workspace<\/h2>)/, 
    `$1\n                            <branding-status-indicator class="mt-2 block"></branding-status-indicator>`
);

// Remove the old <branding-status-indicator> usage that was placed before Tabs
content = content.replace(/                    <!-- Reusable Branding Status Component -->\s*<branding-status-indicator><\/branding-status-indicator>\s*/, '');

fs.writeFileSync('user.html', content);
