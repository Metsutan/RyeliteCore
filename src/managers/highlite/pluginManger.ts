import type { Plugin } from '../../interfaces/highlite/plugin/plugin.class';
import { PanelManager } from './panelManager';
import { DatabaseManager, SettingsManager } from '../..';

const PLUGIN_HUB_REPOSITORY = "https://api.github.com/repos/Highl1te/Plugin-Hub/releases/latest"

interface PluginConfig {
    repository_owner : string
    repository_name : string
    asset_sha : string
    display_name? : string
    display_author? : string
    display_description? : string
}

export interface ManagedPlugin {
    config: PluginConfig | undefined;
    class: (new () => Plugin) | undefined;
    instance: Plugin | undefined;
    blob?: Blob | undefined;
}


export class PluginManager {
    private static instance: PluginManager;
    private panelManager : PanelManager = new PanelManager;
    private databaseManager : DatabaseManager = new DatabaseManager;
    private settingsManager : SettingsManager = new SettingsManager;
    private panelContent! : HTMLDivElement;
    private managedPlugins: ManagedPlugin[] = [];

    public get plugins() : ManagedPlugin[] {
        return this.managedPlugins;
    }
    
    constructor() {
        if (PluginManager.instance) {
            return PluginManager.instance;
        }

        if (document.highlite.managers.PluginManager) {
            PluginManager.instance = document.highlite.managers.PluginManager;
            return document.highlite.managers.PluginManager;
        }

        PluginManager.instance = this;
        document.highlite.managers.PluginManager = this;
    }


    async initialize() {
        this.panelContent = this.panelManager.requestMenuItem("🗃️", "Plugin Hub")[1] as HTMLDivElement;
        
        // Apply consistent panel styling
        this.panelContent.style.display = 'flex';
        this.panelContent.style.flexDirection = 'column';
        this.panelContent.style.padding = '8px';
        this.panelContent.style.gap = '8px';
        this.panelContent.style.background = 'var(--theme-background)';
        this.panelContent.style.overflowY = 'auto';
        this.panelContent.style.overflowX = 'hidden';
        this.panelContent.style.width = "-webkit-fill-available";

        const pluginConfigs = await this.obtainPluginConfigs();
        for (const pluginConfig of pluginConfigs) {
            const managedPlugin: ManagedPlugin = {
                config: pluginConfig,
                class: undefined,
                instance: undefined
            };
            this.managedPlugins.push(managedPlugin);
        }
        await this.populatePluginHub();
    }

    async obtainPluginConfigs() : Promise<PluginConfig[]> {
        let pluginConfigs : PluginConfig[] = [];
        try {
            const githubManifestURL = (await (await fetch(PLUGIN_HUB_REPOSITORY)).json())['assets'][0]['url']
            const githubManifest = (await (await fetch(githubManifestURL, {headers: {'Accept': 'application/octet-stream'}})).json())

            for (const configuration of githubManifest) {
                configuration.installed = false;
                pluginConfigs.push(configuration as PluginConfig);
            }
        } catch {
            // TODO: Should we allow resolution to some sort of error code to communicate to the user an error occured?
            return Promise.resolve(pluginConfigs);
        }
        return Promise.resolve(pluginConfigs);    
    }

    async populatePluginHub() {
        this.panelContent.innerHTML = ''; // Clear panel content

        if (this.managedPlugins.length === 0) {
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

        for (const plugin of this.managedPlugins) {
            if (!plugin.config) continue;

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
            title.textContent = plugin.config.display_name ?? plugin.config.repository_name;
            title.style.margin = '0 0 4px 0';
            title.style.fontSize = '16px';
            title.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
            title.style.fontWeight = '600';
            title.style.color = 'var(--theme-text-primary)';
            title.style.letterSpacing = '0.025em';

            const author = document.createElement('p');
            author.textContent = `By ${plugin.config.display_author ?? plugin.config.repository_owner}`;
            author.style.margin = '0 0 8px 0';
            author.style.fontStyle = 'italic';
            author.style.fontSize = '12px';
            author.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
            author.style.fontWeight = '400';
            author.style.color = 'var(--theme-text-muted)';
            author.style.letterSpacing = '0.025em';

            const description = document.createElement('p');
            description.textContent = plugin.config.display_description ?? 'No description provided.';
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
                try {
                    if (!plugin.config) return;
                    const releasesUrl = `https://api.github.com/repos/${plugin.config.repository_owner}/${plugin.config.repository_name}/releases`;
                    const releasesResponse = await fetch(releasesUrl);
                    if (!releasesResponse.ok) throw new Error("Failed to fetch releases");
                    const releases = await releasesResponse.json();

                    let matchingAssetUrl: string | null = null;

                    for (const release of releases) {
                        for (const asset of release.assets) {
                            // Only check asset.digest for matches
                            if (asset.digest === plugin.config?.asset_sha) {
                                // Download the asset to create a blob URL
                                const assetApiUrl = asset.url;
                                const assetResp = await fetch(assetApiUrl, {
                                    headers: { 'Accept': 'application/octet-stream' }
                                });
                                
                                if (assetResp.ok) {
                                    const buffer = await assetResp.arrayBuffer();
                                    plugin.blob = new Blob([buffer], { type: 'application/javascript' });
                                    matchingAssetUrl = URL.createObjectURL(plugin.blob);
                                }
                                break;
                            }
                        }
                        if (matchingAssetUrl) break;
                    }

                    if (!matchingAssetUrl) {
                        throw new Error(`No asset matched SHA: ${plugin.config.asset_sha}`);
                    }

                    const pluginModule = await import(/* @vite-ignore */ matchingAssetUrl);
                    const PluginClass = pluginModule.default;
                    plugin.class = PluginClass;

                    if (typeof PluginClass !== 'function') {
                        throw new Error('Default export is not a valid plugin class');
                    }

                    this.registerPlugin(PluginClass)
                    this.databaseManager.database.put('plugins', {
                        config: plugin.config,
                        blob: plugin.blob!
                    }, plugin.config.display_name ?? plugin.config.repository_name);
                    await this.settingsManager.refresh();
                    uninstallButton.disabled = false;
                    card.removeChild(installBtn);
                    card.appendChild(uninstallButton);
                } catch (error) {
                    console.error(`[Highlite] Failed to install plugin:`, error);
                    installBtn.textContent = 'Failed';
                    installBtn.style.background = 'var(--theme-danger)';
                    installBtn.style.color = 'white';
                    installBtn.style.border = '1px solid var(--theme-danger-dark)';
                    installBtn.style.boxShadow = '0 2px 4px var(--theme-danger-transparent-30)';
                }
            };

            const uninstallButton = document.createElement('button');
            uninstallButton.textContent = 'Uninstall';
            uninstallButton.style.padding = '8px 16px';
            uninstallButton.style.background = 'var(--theme-danger)';
            uninstallButton.style.color = 'white';
            uninstallButton.style.border = '1px solid var(--theme-danger-dark)';
            uninstallButton.style.borderRadius = '6px';
            uninstallButton.style.cursor = 'pointer';
            uninstallButton.style.fontSize = '14px';
            uninstallButton.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
            uninstallButton.style.fontWeight = '500';
            uninstallButton.style.transition = 'all 0.2s ease';
            uninstallButton.style.boxShadow = '0 2px 4px var(--theme-danger-transparent-30)';
            uninstallButton.style.letterSpacing = '0.025em';

            // Add hover effect for uninstall button
            uninstallButton.addEventListener('mouseenter', () => {
                uninstallButton.style.background = 'var(--theme-danger-light)';
                uninstallButton.style.boxShadow = '0 4px 8px var(--theme-danger-transparent-40)';
                uninstallButton.style.transform = 'translateY(-1px)';
            });
            uninstallButton.addEventListener('mouseleave', () => {
                uninstallButton.style.background = 'var(--theme-danger)';
                uninstallButton.style.boxShadow = '0 2px 4px var(--theme-danger-transparent-30)';
                uninstallButton.style.transform = 'translateY(0)';
            });

            uninstallButton.onclick = async () => {
                try {
                    if (!plugin.config) return;
                    await this.databaseManager.database.delete('plugins', plugin.config.display_name ?? plugin.config.repository_name);
                    let installedPlugin: Plugin | undefined;
                    if (plugin.class) {
                        installedPlugin = this.findPluginByClass(plugin.class);
                        if (installedPlugin) {
                            this.unregisterPlugin(installedPlugin);
                        }
                    }

                    // Remove uninstall button, add install button
                    await this.settingsManager.refresh();
                    installBtn.disabled = false;
                    card.removeChild(uninstallButton);
                    card.appendChild(installBtn);
                } catch (error) {
                    console.error(`[Highlite] Failed to uninstall plugin:`, error);
                    uninstallButton.textContent = 'Failed';
                    uninstallButton.style.background = 'var(--theme-danger)';
                    uninstallButton.style.color = 'white';
                    uninstallButton.style.border = '1px solid var(--theme-danger-dark)';
                    uninstallButton.style.boxShadow = '0 2px 4px var(--theme-danger-transparent-30)';
                }
            };

            card.appendChild(title);
            card.appendChild(author);
            card.appendChild(description);
            

            const isInstalled = await this.syncPluginState(plugin.config);

            // If isInstalled, show uninstall button
            if (isInstalled) {
                card.appendChild(uninstallButton);
                plugin.blob = isInstalled;
            } else {
                card.appendChild(installBtn);
                plugin.blob = undefined;
            }

            this.panelContent.appendChild(card);
        }
    }

    async syncPluginState(plugin: PluginConfig) : Promise<Blob | undefined> {
        const installedPlugin = await this.databaseManager.database.get('plugins', plugin.display_name ?? plugin.repository_name);

        if (installedPlugin) {
            // If the plugin is "installed", go ahead and register it

            // installedPlugin.data is a Blob
            const pluginModule = await import(URL.createObjectURL(installedPlugin.blob));
            const pluginClass = pluginModule.default;
            this.registerPlugin(pluginClass);

            return installedPlugin.blob;
        } else {
            return undefined;
        }
    }


    registerPlugin<T extends Plugin>(pluginClass: new () => T): boolean {
        const pluginInstance = new pluginClass();
        console.info(
            `[Highlite] New plugin ${pluginInstance.pluginName} registered`
        );

        // Find the managedPlugin entry for this class
        let managedPlugin = this.managedPlugins.find(mp => mp.class === pluginClass);
        if (!managedPlugin) {
            // If not found, create a new ManagedPlugin entry
            managedPlugin = {
                config: undefined,
                class: pluginClass,
                instance: pluginInstance
            };
            this.managedPlugins.push(managedPlugin);
        } else {
            managedPlugin.class = pluginClass;
            managedPlugin.instance = pluginInstance;
        }
        return true;
    }

    initAll(): void {
        for (const plugin of this.plugins) {
            try {
                plugin.instance?.init();
            } catch (error) {
                console.error(
                    `[Highlite] Error initializing plugin ${plugin.instance?.pluginName}:`,
                    error
                );
            }
        }
    }

    postInitAll(): void {
        for (const plugin of this.plugins) {
            try {
                if (plugin.instance?.postInit) {
                    plugin.instance.postInit();
                }
            } catch (error) {
                console.error(
                    `[Highlite] Error post-initializing plugin ${plugin.instance?.pluginName}:`,
                    error
                );
            }
        }
    }

    startAll(): void {
        for (const plugin of this.plugins) {
            if (plugin.instance?.settings.enable.value) {
                try {
                    plugin.instance?.start();
                } catch (error) {
                    console.error(
                        `[Highlite] Error starting plugin ${plugin.instance?.pluginName}:`,
                        error
                    );
                }
            }
        }
    }

    stopAll(): void {
        for (const plugin of this.plugins) {
            if (plugin.instance?.settings.enable.value) {
                try {
                    plugin.instance?.stop();
                } catch (error) {
                    console.error(
                        `[Highlite] Error stopping plugin ${plugin.instance?.pluginName}:`,
                        error
                    );
                }
            }
        }
    }

    findPluginByName(pluginName: string): Plugin | undefined {
        return this.plugins.find(managedPlugin => {
            return managedPlugin.instance?.pluginName === pluginName;
        })?.instance;
    }

    findPluginByClass(pluginClass: new () => Plugin): Plugin | undefined {
        // Find by constructor, not instance
        return this.plugins.find(managedPlugin => {
            return managedPlugin.class && managedPlugin.instance && managedPlugin.instance.constructor === pluginClass;
        })?.instance;
    }

    unregisterPlugin(plugin: Plugin): boolean {
        try {
            plugin.stop();

            const index = this.managedPlugins.findIndex(mp => mp.instance === plugin);
            
            // We can destory the instance and class and set them to undefined
            if (index !== -1) {
                this.managedPlugins[index].instance = undefined;
                this.managedPlugins[index].class = undefined;
            }


        } catch (error) {
            console.error(
                `[Highlite] Error unregistering plugin ${plugin.pluginName}:`,
                error
            );
        }
        return false;
    }
}
