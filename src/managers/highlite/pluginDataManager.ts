import { Plugin } from "../../interfaces/highlite/plugin/plugin.class";
import { DatabaseManager } from "./databaseManager";

export class PluginDataManager {
    private static instance: PluginDataManager;

    private databaseManager!: DatabaseManager;
    private username!: string;

    private proxyMap = new WeakMap<object, object>();          // proxy -> original
    private originalToProxy = new WeakMap<object, object>();   // original -> proxy
    private nestedProxyCache = new WeakMap<object, object>();  // cache nested proxies per target

    private inMemoryCache: Record<string, any> = {};
    private pendingWrites: Record<string, any> = {};
    private writeTimeout: ReturnType<typeof setTimeout> | null = null;

    private initialized = false;

    constructor() {
        // Singleton: prevent multiple instances
        if (PluginDataManager.instance) {
            return PluginDataManager.instance;
        }
        PluginDataManager.instance = this;
    }

    /** Must be awaited before addPlugin is used */
    public async initialize() {
        this.databaseManager = new DatabaseManager();

        // Ensure this path is valid in your environment
        this.username = document.highlite.gameHooks.EntityManager.Instance._mainPlayer._nameLowerCase;

        const data = await this.databaseManager.database.get('data', this.username);
        this.inMemoryCache = data || {};

        this.initialized = true;
    }

    public async addPlugin(plugin: Plugin) {
        if (!this.initialized) {
            throw new Error('PluginDataManager must be initialized before adding plugins');
        }

        const originalData = plugin.data;

        // If already proxied, just reuse the existing proxy
        if (this.originalToProxy.has(originalData)) {
            plugin.data = this.originalToProxy.get(originalData)!;
            return;
        }

        // Use saved data for plugin if available, else clone original data
        const savedData = this.inMemoryCache[plugin.pluginName];
        const dataToUse = savedData
            ? deepClone(savedData)
            : deepClone(originalData);

        // Create a reactive proxy around the data
        const proxy = this.createReactiveData(plugin.pluginName, dataToUse);

        this.proxyMap.set(proxy, dataToUse);
        this.originalToProxy.set(dataToUse, proxy);

        plugin.data = proxy;
    }

    private createReactiveData(pluginName: string, data: any): any {
        if (typeof data !== 'object' || data === null) {
            return data;
        }

        // Avoid double proxying
        if (this.originalToProxy.has(data)) {
            return this.originalToProxy.get(data);
        }

        // Cache nested proxies per object to avoid multiple proxies on same object
        if (this.nestedProxyCache.has(data)) {
            return this.nestedProxyCache.get(data);
        }

        const manager = this;

        const handler: ProxyHandler<any> = {
            get(target, prop, receiver) {
                const value = Reflect.get(target, prop, receiver);

                // Automatically wrap nested objects in proxies
                if (typeof value === 'object' && value !== null) {
                    // Return cached proxy if exists
                    if (manager.nestedProxyCache.has(value)) {
                        return manager.nestedProxyCache.get(value);
                    }
                    // Create and cache nested proxy
                    const nestedProxy = manager.createReactiveData(pluginName, value);
                    manager.nestedProxyCache.set(value, nestedProxy);
                    return nestedProxy;
                }

                return value;
            },

            set(target, prop, value, receiver) {
                // Wrap objects in proxies to track nested changes
                if (typeof value === 'object' && value !== null) {
                    if (!manager.originalToProxy.has(value)) {
                        value = manager.createReactiveData(pluginName, value);
                    }
                }

                const result = Reflect.set(target, prop, value, receiver);

                if (!manager.inMemoryCache[pluginName]) {
                    manager.inMemoryCache[pluginName] = {};
                }

                // Store deep clone to keep cache proxy-free
                manager.inMemoryCache[pluginName][String(prop)] = deepClone(value);

                // Schedule write to DB
                manager.scheduleWrite(pluginName);

                return result;
            },

            deleteProperty(target, prop) {
                const result = Reflect.deleteProperty(target, prop);

                if (!manager.inMemoryCache[pluginName]) {
                    manager.inMemoryCache[pluginName] = {};
                }

                // Reflect deletion in cache
                delete manager.inMemoryCache[pluginName][String(prop)];

                manager.scheduleWrite(pluginName);

                return result;
            }
        };

        const proxy = new Proxy(data, handler);

        // Cache proxy references for this data
        this.nestedProxyCache.set(data, proxy);
        this.originalToProxy.set(data, proxy);
        this.proxyMap.set(proxy, data);

        return proxy;
    }

    private scheduleWrite(pluginName: string) {
        this.pendingWrites[pluginName] = this.inMemoryCache[pluginName];

        if (this.writeTimeout) clearTimeout(this.writeTimeout);

        this.writeTimeout = setTimeout(async () => {
            try {
                await this.databaseManager.database.put('data', this.inMemoryCache, this.username);
                // Clear pending writes after successful write
                this.pendingWrites = {};
            } catch (error) {
                console.error('Failed to write plugin data:', error);
            } finally {
                this.writeTimeout = null;
            }
        }, 200);
    }
}

/**
 * Deep clone helper using structuredClone if available or fallback to JSON.
 * Note: structuredClone preserves Dates, Maps, Sets, etc.
 */
function deepClone<T>(obj: T): T {
    if (typeof structuredClone === 'function') {
        return structuredClone(obj);
    }
    return JSON.parse(JSON.stringify(obj));
}
