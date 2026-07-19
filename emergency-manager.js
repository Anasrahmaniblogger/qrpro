/**
 * EMERGENCY LOCAL MODE - DISASTER RECOVERY SYSTEM
 * This script handles local storage fallback when Supabase is unavailable or emergency mode is active.
 */

(function() {
    const CONFIG_ID = 'emergency_config';
    const DB_NAME = 'EmergencyLocalDB';
    const DB_VERSION = 1;
    const STORE_PROJECTS = 'projects';
    const STORE_QUEUE = 'sync_queue';

    window.EmergencyManager = {
        config: null,
        db: null,
        isInitialized: false,

        async init() {
            if (this.isInitialized) return;
            try {
                await this.initDB();
            } catch (err) {
                console.warn("IndexedDB initialization failed. Falling back to local storage/memory:", err);
                this.db = null;
            }
            try {
                await this.fetchConfig();
            } catch (err) {
                console.error("Emergency Manager: config fetch failed:", err);
            }
            this.isInitialized = true;
            try {
                this.renderNotification();
            } catch (err) {}
            console.log("Emergency Manager Initialized. Mode:", this.isActive() ? "ACTIVE" : "INACTIVE");
        },

        async initDB() {
            return new Promise((resolve, reject) => {
                try {
                    if (typeof indexedDB === 'undefined' || !indexedDB) {
                        return reject(new Error("IndexedDB not supported or is blocked"));
                    }
                    const request = indexedDB.open(DB_NAME, DB_VERSION);
                    request.onerror = (e) => reject(e);
                    request.onsuccess = (e) => {
                        this.db = e.target.result;
                        resolve();
                    };
                    request.onupgradeneeded = (e) => {
                        const db = e.target.result;
                        if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
                            db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
                        }
                        if (!db.objectStoreNames.contains(STORE_QUEUE)) {
                            db.createObjectStore(STORE_QUEUE, { keyPath: 'id' });
                        }
                    };
                } catch (err) {
                    reject(err);
                }
            });
        },

        async fetchConfig() {
            try {
                if (window.supabaseClient) {
                    const { data, error } = await window.supabaseClient
                        .from('settings')
                        .select('value')
                        .eq('id', CONFIG_ID)
                        .maybeSingle();
                    
                    if (data && data.value) {
                        this.config = data.value;
                        localStorage.setItem('cached_emergency_config', JSON.stringify(data.value));
                    } else {
                        this.config = JSON.parse(localStorage.getItem('cached_emergency_config')) || this.getDefaultConfig();
                    }
                } else {
                    this.config = JSON.parse(localStorage.getItem('cached_emergency_config')) || this.getDefaultConfig();
                }
            } catch (e) {
                console.error("Emergency Manager: Failed to fetch config", e);
                this.config = JSON.parse(localStorage.getItem('cached_emergency_config')) || this.getDefaultConfig();
            }
        },

        getDefaultConfig() {
            return {
                active: false,
                reason: "System Maintenance",
                maintenanceMessage: "Cloud Workspace is temporarily unavailable. Your projects are being safely stored on this device. Cloud synchronization will resume automatically when the service is restored.",
                estimatedRecovery: "TBA",
                readOnly: false,
                disableCloudUploads: true,
                disableCloudSync: true,
                disableCloudBackup: true,
                forceLocalStorage: true,
                allowExistingCloudAccess: true,
                autoReturn: false,
                notification: {
                    title: "Emergency Local Mode",
                    icon: "fas fa-shield-alt",
                    bgColor: "bg-indigo-600",
                    textColor: "text-white"
                }
            };
        },

        isActive() {
            return this.config && this.config.active;
        },

        shouldForceLocal() {
            return this.isActive() && this.config.forceLocalStorage;
        },

        async saveProject(table, project) {
            if (this.shouldForceLocal()) {
                console.log(`Emergency Manager: Saving ${table} locally`, project.id);
                const localProject = { ...project, _table: table };
                await this.dbOp(STORE_PROJECTS, 'put', localProject);
                
                // Add to sync queue if sync is disabled or if it's a new local project
                if (this.config.disableCloudSync) {
                    await this.dbOp(STORE_QUEUE, 'put', {
                        id: project.id || ('local_' + Date.now()),
                        table: table,
                        project_id: project.id,
                        status: 'pending',
                        timestamp: new Date().toISOString(),
                        project_data: project
                    });
                }
                return { data: localProject, error: null };
            }
            return null; // Fallback to normal flow
        },

        async getLocalProjects() {
            return await this.dbOp(STORE_PROJECTS, 'getAll');
        },

        async getQueue() {
            return await this.dbOp(STORE_QUEUE, 'getAll');
        },

        async dbOp(storeName, method, data) {
            if (!this.db) {
                // LocalStorage Fallback
                const key = `emergency_local_${storeName}`;
                let items = [];
                try {
                    items = JSON.parse(localStorage.getItem(key)) || [];
                } catch (e) {}
                
                if (method === 'getAll') {
                    return items;
                } else if (method === 'put') {
                    const idx = items.findIndex(item => item.id === data.id);
                    if (idx > -1) {
                        items[idx] = data;
                    } else {
                        items.push(data);
                    }
                    localStorage.setItem(key, JSON.stringify(items));
                    return data;
                } else if (method === 'get') {
                    return items.find(item => item.id === data);
                } else if (method === 'delete') {
                    items = items.filter(item => item.id !== data);
                    localStorage.setItem(key, JSON.stringify(items));
                    return data;
                } else if (method === 'clear') {
                    localStorage.removeItem(key);
                    return null;
                }
                return null;
            }
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                let request;
                if (method === 'put') request = store.put(data);
                else if (method === 'get') request = store.get(data);
                else if (method === 'getAll') request = store.getAll();
                else if (method === 'delete') request = store.delete(data);
                else if (method === 'clear') request = store.clear();

                request.onsuccess = (e) => resolve(e.target.result);
                request.onerror = (e) => reject(e);
            });
        },

        renderNotification() {
            if (!this.isActive()) {
                const existing = document.getElementById('emergency-banner');
                if (existing) existing.remove();
                return;
            }

            const bannerId = 'emergency-banner';
            let banner = document.getElementById(bannerId);
            if (!banner) {
                banner = document.createElement('div');
                banner.id = bannerId;
                document.body.prepend(banner);
            }

            const { title, icon, bgColor, textColor } = this.config.notification;
            
            banner.className = `fixed top-0 left-0 right-0 z-[9999] px-4 py-3 flex items-center justify-between shadow-lg animate-fade-in-down ${bgColor} ${textColor}`;
            banner.innerHTML = `
                <div class="flex items-center gap-4 max-w-7xl mx-auto w-full">
                    <div class="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-white/20 rounded-full">
                        <i class="${icon} text-xl"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-bold text-sm uppercase tracking-wider">${title}</h4>
                        <p class="text-xs opacity-90 leading-tight">${this.config.maintenanceMessage}</p>
                    </div>
                    <div class="hidden md:flex flex-col items-end text-right border-l border-white/20 pl-6 ml-6">
                        <span class="text-[10px] uppercase opacity-70">Estimated Recovery</span>
                        <span class="font-bold text-sm">${this.config.estimatedRecovery}</span>
                    </div>
                </div>
            `;
            
            // Add margin to body to prevent overlap
            document.body.style.marginTop = banner.offsetHeight + 'px';
        },

        // Sync local projects to cloud
        async syncToCloud() {
            if (!window.supabaseClient || !window.currentUser) {
                console.warn("Emergency Manager: Cannot sync without auth/client");
                return;
            }

            const queue = await this.getQueue();
            const results = { success: 0, failed: 0 };

            for (const item of queue) {
                try {
                    const { data, error } = await window.supabaseClient
                        .from('projects')
                        .upsert(item.project_data);
                    
                    if (error) throw error;
                    
                    await this.dbOp(STORE_QUEUE, 'delete', item.id);
                    results.success++;
                } catch (e) {
                    console.error("Emergency Manager: Sync failed for item", item.id, e);
                    results.failed++;
                }
            }
            return results;
        }
    };

    // Auto-init on load
    window.addEventListener('load', () => {
        window.EmergencyManager.init();
    });
})();
