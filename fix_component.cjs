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
                // Listen for custom event or you can just re-render when needed
                window.addEventListener('branding-updated', () => this.updateState());
            }
            
            updateState() {
                const titleEl = this.querySelector('#branding-status-title');
                const descEl = this.querySelector('#branding-status-desc');
                const btnEl = this.querySelector('#branding-action-btn');
                
                if (!titleEl) return;
                
                if (!brandingSettings.enable) {
                    titleEl.innerText = "Branding Disabled";
                    descEl.innerText = "System-wide branding is currently disabled.";
                    btnEl.style.display = 'none';
                    return;
                }
                
                if (isBrandingRemoved()) {
                    let unlockedBy = "Unlocked";
                    if (userProfile && userProfile.branding_unlocked) unlockedBy = "Unlocked by One-Time Purchase";
                    else if (userProfile && userProfile.subscription_tier === 'PRO') unlockedBy = "Unlocked by Premium";
                    else if (brandingSettings.unlock_method === 'free') unlockedBy = "Free Access";
                    
                    titleEl.innerText = "Branding Removed";
                    descEl.innerText = unlockedBy;
                    btnEl.style.display = 'none';
                } else {
                    titleEl.innerText = "Branding Enabled";
                    descEl.innerText = "QR Pro watermark will be applied to your creations.";
                    
                    if (brandingSettings.allow_removal && (brandingSettings.unlock_method !== 'subscription' || !userProfile || userProfile.subscription_tier !== 'PRO')) {
                        btnEl.style.display = 'block';
                    } else {
                        btnEl.style.display = 'none';
                    }
                }
            }

            render() {
                this.innerHTML = \`
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
                \`;
                this.updateState();
            }
        }
        
        customElements.define('branding-status-indicator', BrandingStatusIndicator);
`;

const replaceUI = `
                    <!-- Reusable Branding Status Component -->
                    <branding-status-indicator></branding-status-indicator>
`;

// replace HTML
content = content.replace(/<!-- Branding Status Card -->[\s\S]*?Remove Branding\s*<\/button>\s*<\/div>\s*<\/div>/m, replaceUI.trim());

// Insert the Web Component definition script somewhere in the <head> or at the top of <script> block
content = content.replace(/(<script>\s*tailwind\.config)/, '<script>' + componentScript + '\n        tailwind.config');

// modify updateBrandingUI to just dispatch event
const newUpdateBrandingUI = `
        function updateBrandingUI() {
            window.dispatchEvent(new Event('branding-updated'));
        }
`;

content = content.replace(/function updateBrandingUI\(\) \{[\s\S]*?\}\n\n        function handleRemoveBranding\(\)/, newUpdateBrandingUI.trim() + '\n\n        function handleRemoveBranding()');

fs.writeFileSync('user.html', content);
