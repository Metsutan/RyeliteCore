import type { Plugin } from '../../interfaces/highlite/plugin/plugin.class';
import { PanelManager } from './panelManager';

const PLUGIN_HUB_REPOSITORY = "https://api.github.com/repos/Highl1te/Plugin-Hub/releases/latest"

interface PluginConfig {
    repository_owner : string
    repository_name : string
    asset_sha : string
    display_name? : string
    display_author? : string
    display_description? : string
}


export class PluginManager {
    private static instance: PluginManager;
    private panelManager : PanelManager = new PanelManager;
    private panelContent! : HTMLDivElement;
    plugins: Array<Plugin> = [];

    constructor() {
        if (PluginManager.instance) {
            return PluginManager.instance;
        }
        PluginManager.instance = this;
        document.highlite.managers.PluginManager = this;
        document.highlite.plugins = this.plugins;
        this.panelContent = this.panelManager.requestMenuItem("🏛️", "Plugin Hub")[1] as HTMLDivElement;
        
        // Apply consistent panel styling
        this.panelContent.style.display = 'flex';
        this.panelContent.style.flexDirection = 'column';
        this.panelContent.style.padding = '8px';
        this.panelContent.style.gap = '8px';
        this.panelContent.style.background = 'var(--theme-background)';
        this.panelContent.style.overflowY = 'auto';
        this.panelContent.style.width = '--webkit-fill-available';
        this.panelContent.style.overflowX = 'hidden';
        
        this.populatePluginHub();
    }

    async obtainPluginListings() : Promise<PluginConfig[]> {
        let pluginConfigs : PluginConfig[] = [];
        try {
            const githubManifestURL = (await (await fetch(PLUGIN_HUB_REPOSITORY)).json())['assets'][0]['url']
            const githubManifest = (await (await fetch(githubManifestURL, {headers: {'Accept': 'application/octet-stream'}})).json())

            for (const configuration of githubManifest) {
                pluginConfigs.push(configuration as PluginConfig);
            }
        } catch {
            // TODO: Should we allow resolution to some sort of error code to communicate to the user an error occured?
            return Promise.resolve(pluginConfigs);
        }
        return Promise.resolve(pluginConfigs);
    }

    async populatePluginHub() {
        const availablePlugins = await this.obtainPluginListings();

        this.panelContent.innerHTML = ''; // Clear panel content

        if (availablePlugins.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.textContent = "No plugins available.";
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.color = 'var(--theme-text-muted)';
            emptyMessage.style.fontStyle = 'italic';
            emptyMessage.style.padding = '40px 20px';
            emptyMessage.style.background = 'var(--theme-background-soft)';
            emptyMessage.style.border = '1px solid var(--theme-border)';
            emptyMessage.style.borderRadius = '8px';
            emptyMessage.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
            this.panelContent.appendChild(emptyMessage);
            return;
        }

        for (const plugin of availablePlugins) {
            const card = document.createElement('div');
            card.style.border = '1px solid var(--theme-border)';
            card.style.borderRadius = '8px';
            card.style.padding = '16px';
            card.style.marginBottom = '8px';
            card.style.background = 'var(--theme-background-mute)';
            card.style.color = 'var(--theme-text-primary)';
            card.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
            card.style.transition = 'all 0.2s ease';

            // Add hover effect for cards
            card.addEventListener('mouseenter', () => {
                card.style.background = 'var(--theme-background-light)';
                card.style.border = '1px solid var(--theme-divider)';
                card.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.4)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.background = 'var(--theme-background-mute)';
                card.style.border = '1px solid var(--theme-border)';
                card.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.3)';
            });

            const title = document.createElement('h3');
            title.textContent = plugin.display_name ?? plugin.repository_name;
            title.style.margin = '0 0 4px 0';
            title.style.fontSize = '16px';
            title.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
            title.style.fontWeight = '600';
            title.style.color = 'var(--theme-text-primary)';
            title.style.letterSpacing = '0.025em';

            const author = document.createElement('p');
            author.textContent = `By ${plugin.display_author ?? plugin.repository_owner}`;
            author.style.margin = '0 0 8px 0';
            author.style.fontStyle = 'italic';
            author.style.fontSize = '12px';
            author.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
            author.style.fontWeight = '400';
            author.style.color = 'var(--theme-text-muted)';
            author.style.letterSpacing = '0.025em';

            const description = document.createElement('p');
            description.textContent = plugin.display_description ?? 'No description provided.';
            description.style.margin = '0 0 12px 0';
            description.style.fontSize = '14px';
            description.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
            description.style.fontWeight = '400';
            description.style.color = 'var(--theme-text-secondary)';
            description.style.lineHeight = '1.4';
            description.style.letterSpacing = '0.025em';

            const installBtn = document.createElement('button');
            installBtn.textContent = 'Install';
            installBtn.style.padding = '8px 16px';
            installBtn.style.background = 'var(--theme-accent)';
            installBtn.style.color = 'var(--theme-text-dark)';
            installBtn.style.border = '1px solid var(--theme-accent-dark)';
            installBtn.style.borderRadius = '6px';
            installBtn.style.cursor = 'pointer';
            installBtn.style.fontSize = '14px';
            installBtn.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
            installBtn.style.fontWeight = '500';
            installBtn.style.transition = 'all 0.2s ease';
            installBtn.style.boxShadow = '0 2px 4px var(--theme-accent-transparent-30)';
            installBtn.style.letterSpacing = '0.025em';

            // Add hover effect for install button
            installBtn.addEventListener('mouseenter', () => {
                installBtn.style.background = 'var(--theme-accent-light)';
                installBtn.style.boxShadow = '0 4px 8px var(--theme-accent-transparent-40)';
                installBtn.style.transform = 'translateY(-1px)';
            });
            installBtn.addEventListener('mouseleave', () => {
                installBtn.style.background = 'var(--theme-accent)';
                installBtn.style.boxShadow = '0 2px 4px var(--theme-accent-transparent-30)';
                installBtn.style.transform = 'translateY(0)';
            });

            installBtn.onclick = async () => {
                installBtn.disabled = true;
                installBtn.textContent = 'Installing...';
                installBtn.style.background = 'var(--theme-background-light)';
                installBtn.style.color = 'var(--theme-text-secondary)';
                installBtn.style.border = '1px solid var(--theme-border)';
                installBtn.style.cursor = 'not-allowed';
                installBtn.style.boxShadow = 'none';
                installBtn.style.transform = 'none';

                try {
                    const releasesUrl = `https://api.github.com/repos/${plugin.repository_owner}/${plugin.repository_name}/releases`;
                    const releasesResponse = await fetch(releasesUrl);
                    if (!releasesResponse.ok) throw new Error("Failed to fetch releases");
                    const releases = await releasesResponse.json();

                    let matchingAssetUrl: string | null = null;

                    for (const release of releases) {
                        for (const asset of release.assets) {
                            // Only check asset.digest for matches
                            if (asset.digest === plugin.asset_sha) {
                                // Download the asset to create a blob URL
                                const assetApiUrl = asset.url;
                                const assetResp = await fetch(assetApiUrl, {
                                    headers: { 'Accept': 'application/octet-stream' }
                                });
                                
                                if (assetResp.ok) {
                                    const buffer = await assetResp.arrayBuffer();
                                    matchingAssetUrl = URL.createObjectURL(new Blob([buffer], { type: 'application/javascript' }));
                                }
                                break;
                            }
                        }
                        if (matchingAssetUrl) break;
                    }

                    if (!matchingAssetUrl) {
                        throw new Error(`No asset matched SHA: ${plugin.asset_sha}`);
                    }

                    const pluginModule = await import(/* @vite-ignore */ matchingAssetUrl);
                    const PluginClass = pluginModule.default;

                    if (typeof PluginClass !== 'function') {
                        throw new Error('Default export is not a valid plugin class');
                    }

                    this.registerPlugin(PluginClass);

                    installBtn.textContent = 'Installed!';
                    installBtn.style.background = 'var(--theme-success)';
                    installBtn.style.color = 'white';
                    installBtn.style.border = '1px solid var(--theme-success-dark)';
                    installBtn.style.boxShadow = '0 2px 4px var(--theme-success-transparent-30)';
                } catch (error) {
                    console.error(`[Highlite] Failed to install plugin:`, error);
                    installBtn.textContent = 'Failed';
                    installBtn.style.background = 'var(--theme-danger)';
                    installBtn.style.color = 'white';
                    installBtn.style.border = '1px solid var(--theme-danger-dark)';
                    installBtn.style.boxShadow = '0 2px 4px var(--theme-danger-transparent-30)';
                }
            };

            card.appendChild(title);
            card.appendChild(author);
            card.appendChild(description);
            card.appendChild(installBtn);

            this.panelContent.appendChild(card);
        }
    }


    registerPlugin<T extends Plugin>(pluginClass: new () => T): boolean {
        const pluginInstance = new pluginClass();
        console.info(
            `[Highlite] New plugin ${pluginInstance.pluginName} registered`
        );

        this.plugins.push(pluginInstance);
        return true;
    }

    initAll(): void {
        for (const plugin of this.plugins) {
            try {
                plugin.init();
            } catch (error) {
                console.error(
                    `[Highlite] Error initializing plugin ${plugin.pluginName}:`,
                    error
                );
            }
        }
    }

    postInitAll(): void {
        for (const plugin of this.plugins) {
            try {
                if (plugin.postInit) {
                    plugin.postInit();
                }
            } catch (error) {
                console.error(
                    `[Highlite] Error post-initializing plugin ${plugin.pluginName}:`,
                    error
                );
            }
        }
    }

    startAll(): void {
        for (const plugin of this.plugins) {
            if (plugin.settings.enable.value) {
                try {
                    plugin.start();
                } catch (error) {
                    console.error(
                        `[Highlite] Error starting plugin ${plugin.pluginName}:`,
                        error
                    );
                }
            }
        }
    }

    stopAll(): void {
        for (const plugin of this.plugins) {
            if (plugin.settings.enable.value) {
                try {
                    plugin.stop();
                } catch (error) {
                    console.error(
                        `[Highlite] Error stopping plugin ${plugin.pluginName}:`,
                        error
                    );
                }
            }
        }
    }

    findPluginByName(pluginName: string): Plugin | undefined {
        return this.plugins.find(plugin => plugin.pluginName === pluginName);
    }

    findPluginByClass(pluginClass: new () => Plugin): Plugin | undefined {
        return this.plugins.find(plugin => plugin.constructor === pluginClass);
    }

    unregisterPlugin(plugin: Plugin): boolean {
        try {
            plugin.stop();
            const index = this.plugins.indexOf(plugin);
            if (index > -1) {
                this.plugins.splice(index, 1);
                console.info(
                    `[Highlite] Plugin ${plugin.pluginName} unregistered`
                );
                return true;
            }
        } catch (error) {
            console.error(
                `[Highlite] Error unregistering plugin ${plugin.pluginName}:`,
                error
            );
        }
        return false;
    }

    hotReloadPlugin<T extends Plugin>(pluginClass: new () => T): boolean {
        try {
            // Create a temporary instance to get the plugin name
            const tempPlugin = new pluginClass();
            const pluginName = tempPlugin.pluginName;

            console.info(`[Highlite] Hot reloading plugin ${pluginName}`);

            // Find and remove old instance by name (more reliable than by class)
            const oldPlugin = this.findPluginByName(pluginName);
            if (oldPlugin) {
                console.info(
                    `[Highlite] Found existing plugin ${pluginName}, removing...`
                );
                this.unregisterPlugin(oldPlugin);
            }

            // Register new instance
            const newPlugin = new pluginClass();
            console.info(
                `[Highlite] Registering new instance of ${newPlugin.pluginName}`
            );

            this.plugins.push(newPlugin);

            // Initialize and start if it was previously enabled (or if no old plugin existed)
            const shouldEnable = oldPlugin
                ? oldPlugin.settings.enable.value
                : newPlugin.settings.enable.value;

            newPlugin.init();
            console.info(`[Highlite] Initialized ${newPlugin.pluginName}`);

            if (newPlugin.postInit) {
                newPlugin.postInit();
                console.info(
                    `[Highlite] Post-initialized ${newPlugin.pluginName}`
                );
            }

            if (shouldEnable) {
                newPlugin.start();
                console.info(`[Highlite] Started ${newPlugin.pluginName}`);
            }

            return true;
        } catch (error) {
            console.error(`[Highlite] Error hot reloading plugin:`, error);
            return false;
        }
    }
}
