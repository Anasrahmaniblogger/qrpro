const fs = require('fs');
let content = fs.readFileSync('admin.html', 'utf8');

const scripts = `
        async function loadBrandingSettings() {
            let data = {
                unlock_method: 'subscription',
                sub_expiry: 'locked_again',
                price: 49,
                currency: 'INR',
                strike_price: 99,
                offer_price: 49,
                discount: 50,
                tax: 18,
                offer_start: '',
                offer_end: '',
                enable: true,
                mandatory: true,
                allow_removal: true,
                allow_white_label: false,
                allow_company_logo: false,
                allow_custom_footer: false,
                allow_custom_watermark: false,
                allow_own_brand_name: false,
                sales: 145,
                revenue: 7105,
                premium_unlocks: 1102,
                onetime_unlocks: 145,
                refunds: 2,
                conversion: '8.4%'
            };

            if (supabaseClient) {
                const { data: dbData } = await supabaseClient.from('settings').select('*').eq('id', 'branding_settings').single();
                if (dbData && dbData.value) {
                    data = { ...data, ...dbData.value };
                }
            } else {
                const localData = localStorage.getItem('branding_settings');
                if (localData) {
                    data = { ...data, ...JSON.parse(localData) };
                }
            }

            document.getElementById('branding-unlock-method').value = data.unlock_method || 'subscription';
            document.getElementById('branding-sub-expiry').value = data.sub_expiry || 'locked_again';
            document.getElementById('branding-price').value = data.price || 0;
            document.getElementById('branding-currency').value = data.currency || 'INR';
            document.getElementById('branding-strike-price').value = data.strike_price || 0;
            document.getElementById('branding-offer-price').value = data.offer_price || 0;
            document.getElementById('branding-discount').value = data.discount || 0;
            document.getElementById('branding-tax').value = data.tax || 0;
            document.getElementById('branding-offer-start').value = data.offer_start || '';
            document.getElementById('branding-offer-end').value = data.offer_end || '';
            
            document.getElementById('branding-enable').checked = data.enable ?? true;
            document.getElementById('branding-mandatory').checked = data.mandatory ?? true;
            document.getElementById('branding-allow-removal').checked = data.allow_removal ?? true;
            document.getElementById('branding-allow-white-label').checked = data.allow_white_label ?? false;
            document.getElementById('branding-allow-company-logo').checked = data.allow_company_logo ?? false;
            document.getElementById('branding-allow-custom-footer').checked = data.allow_custom_footer ?? false;
            document.getElementById('branding-allow-custom-watermark').checked = data.allow_custom_watermark ?? false;
            document.getElementById('branding-allow-own-brand-name').checked = data.allow_own_brand_name ?? false;

            document.getElementById('analytic-branding-sales').innerText = data.sales || 0;
            document.getElementById('analytic-branding-revenue').innerText = data.currency + " " + (data.revenue || 0);
            document.getElementById('analytic-branding-premium-unlocks').innerText = data.premium_unlocks || 0;
            document.getElementById('analytic-branding-onetime-unlocks').innerText = data.onetime_unlocks || 0;
            document.getElementById('analytic-branding-refunds').innerText = data.refunds || 0;
            document.getElementById('analytic-branding-conversion').innerText = data.conversion || '0%';
        }

        async function saveBrandingSettings() {
            const data = {
                unlock_method: document.getElementById('branding-unlock-method').value,
                sub_expiry: document.getElementById('branding-sub-expiry').value,
                price: parseFloat(document.getElementById('branding-price').value) || 0,
                currency: document.getElementById('branding-currency').value,
                strike_price: parseFloat(document.getElementById('branding-strike-price').value) || 0,
                offer_price: parseFloat(document.getElementById('branding-offer-price').value) || 0,
                discount: parseFloat(document.getElementById('branding-discount').value) || 0,
                tax: parseFloat(document.getElementById('branding-tax').value) || 0,
                offer_start: document.getElementById('branding-offer-start').value,
                offer_end: document.getElementById('branding-offer-end').value,
                enable: document.getElementById('branding-enable').checked,
                mandatory: document.getElementById('branding-mandatory').checked,
                allow_removal: document.getElementById('branding-allow-removal').checked,
                allow_white_label: document.getElementById('branding-allow-white-label').checked,
                allow_company_logo: document.getElementById('branding-allow-company-logo').checked,
                allow_custom_footer: document.getElementById('branding-allow-custom-footer').checked,
                allow_custom_watermark: document.getElementById('branding-allow-custom-watermark').checked,
                allow_own_brand_name: document.getElementById('branding-allow-own-brand-name').checked
            };

            if (supabaseClient) {
                const { error } = await supabaseClient.from('settings').upsert({ id: 'branding_settings', value: data });
                if (error) {
                    alert('Error saving branding settings: ' + error.message);
                } else {
                    alert('Branding settings saved successfully');
                }
            } else {
                localStorage.setItem('branding_settings', JSON.stringify(data));
                alert('Branding settings saved successfully (local storage mock)');
            }
        }
`;

content = content.replace(/(async function loadSettings\(\) \{)/, scripts + '\n        $1');
content = content.replace(/(await loadSettings\(\);)/, '$1\n            await loadBrandingSettings();');

fs.writeFileSync('admin.html', content);
