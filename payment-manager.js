/**
 * PAYMENT GATEWAY ABSTRACTION LAYER (PGAL)
 * Handles dynamic routing between multiple payment gateways based on Admin Config.
 */

window.PaymentManager = {
    config: null,
    isInitialized: false,

    async init() {
        if (this.isInitialized) return;
        await this.fetchConfig();
        this.isInitialized = true;
        console.log("Payment Manager Initialized.");
    },

    async fetchConfig() {
        try {
            if (window.supabaseClient) {
                const { data } = await window.supabaseClient
                    .from('settings')
                    .eq('id', 'payment_gateway_config')
                    .maybeSingle();
                
                if (data && data.value) {
                    this.config = data.value;
                    localStorage.setItem('cached_payment_config', JSON.stringify(data.value));
                } else {
                    this.config = JSON.parse(localStorage.getItem('cached_payment_config')) || this.getDefaultConfig();
                }
            }
        } catch (e) {
            this.config = JSON.parse(localStorage.getItem('cached_payment_config')) || this.getDefaultConfig();
        }
    },

    getDefaultConfig() {
        return {
            gateways: [
                {
                    id: 'cashfree',
                    name: 'Cashfree',
                    enabled: true,
                    priority: 1,
                    type: 'one-time',
                    sandbox: true,
                    config: {
                        appId: '',
                        secretKey: ''
                    }
                },
                {
                    id: 'cashfree_sub',
                    name: 'Cashfree Subscriptions',
                    enabled: false,
                    priority: 2,
                    type: 'recurring',
                    sandbox: true,
                    config: {}
                }
            ],
            defaultGateway: 'cashfree',
            backupGateway: null,
            subscriptionApiEnabled: false,
            routingPolicy: 'priority'
        };
    },

    getEnabledGateways() {
        return (this.config?.gateways || []).filter(g => g.enabled);
    },

    async processPayment(options) {
        const { amount, type, customer } = options;
        const gateway = this.selectGateway(type);

        if (!gateway) {
            throw new Error("No enabled payment gateway found for type: " + type);
        }

        console.log(`Routing payment of ${amount} through ${gateway.name}`);
        
        // This is where we call the specific gateway logic
        if (gateway.id === 'cashfree') {
            return this.executeCashfree(amount, customer, gateway);
        } else if (gateway.id === 'stripe') {
            return this.executeStripe(amount, customer, gateway);
        }
        
        throw new Error("Gateway implementation pending: " + gateway.id);
    },

    selectGateway(type) {
        const enabled = this.getEnabledGateways();
        // Priority based selection
        return enabled.sort((a, b) => a.priority - b.priority)[0];
    },

    async executeCashfree(amount, customer, gateway) {
        // Logic to call your /api/create-order.js or direct SDK
        // This would be updated to use the dynamic config from 'gateway.config'
        console.log("Executing Cashfree with dynamic config...");
        // Placeholder for the actual fetch call to your backend
        return { success: true, gateway: 'cashfree' };
    }
};

window.addEventListener('load', () => window.PaymentManager.init());
