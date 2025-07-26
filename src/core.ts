import { ContextMenuManager } from './managers/game/contextMenuManager';
import { HookManager } from './managers/highlite/hookManager';
import { NotificationManager } from './managers/highlite/notificationManager';
import { PanelManager } from './managers/highlite/panelManager';
import { PluginManager } from './managers/highlite/pluginManger';
import { UIManager } from './managers/highlite/uiManager';
import { SettingsManager } from './managers/highlite/settingsManager';
import { DatabaseManager } from './managers/highlite/databaseManager';
import { SoundManager } from './managers/highlite/soundsManager';
import { Reflector } from './reflector/reflector';

export class Highlite {
    hookManager: HookManager;
    contextMenuManager: ContextMenuManager;
    notificationManager: NotificationManager;
    pluginManager: PluginManager;
    uiManager: UIManager;
    panelManager: PanelManager;
    settingsManager: SettingsManager;
    databaseManager: DatabaseManager;
    soundManager: SoundManager;

    constructor() {
        console.info('[Highlite] Core Initializing!');

        document.highlite = {
            managers: {},
            gameHooks: {},
            gameLookups: {},
            plugins: [],
        };

        this.hookManager = new HookManager();
        this.contextMenuManager = new ContextMenuManager();
        this.notificationManager = new NotificationManager();
        this.pluginManager = new PluginManager();
        this.uiManager = new UIManager();
        this.panelManager = new PanelManager();
        this.soundManager = new SoundManager();
        this.settingsManager = new SettingsManager();
        this.databaseManager = new DatabaseManager();

        // Bind the classes from the hook manager (registerClass)
        // Read all the found signature binding 
        Reflector.bindClassHooks(this.hookManager);

        // Bind the enums to the hook manager (registerEnum)
        // These are the lookup tables
        Reflector.bindEnumHooks(this.hookManager);

        this.initialize();
    }


    // NOTE: The login screen buttons attempt to open up in the highlite window without these.
    async loginHooks(fnName: string, ...args: any[]) {
        if (fnName === 'LoginScreen_handleRegisterButtonClicked') {
            window.open('https://highspell.com/register', '_blank');
        }
        if (fnName === 'LoginScreen_handleHomeButtonClicked') {
            window.open('https://highspell.com/', '_blank');
        }
    }

    // NOTE: This is used to delay plugin-starting until after the login is complete.
    // This is because we want to associate user-settings with the user account.
    async startHook(fnName: string, ...args: any[]) {
        this.settingsManager.init();
        await this.settingsManager.registerPlugins();
        this.pluginManager.initAll();
        this.pluginManager.postInitAll();
        this.pluginManager.startAll();
    }

    async stopHook(fnName: string, ...args: any[]) {
        console.warn(`[Highlite] Stopping all plugins due to: ${fnName}`);
        this.settingsManager.deinit();
        this.pluginManager.stopAll();
    }

    initialize() {
        console.info("[Highlite] Core Initializing")

        // Function Hook-ins
        this.hookManager.registerClassOverrideHook('LoginScreen', '_handleRegisterButtonClicked', this.loginHooks);
        this.hookManager.registerClassOverrideHook('LoginScreen', '_handleHomeButtonClicked', this.loginHooks);



        // Start Plugins and Settings after Login
        this.hookManager.registerClassHook('SocketManager', '_loggedIn', this.startHook.bind(this));

        // Stop Plugins and Settings during logout events
        this.hookManager.registerClassHook('SocketManager', '_handleLostConnection', this.stopHook.bind(this));
        this.hookManager.registerClassHook('SocketManager', '_handleReconnectFailed', this.stopHook.bind(this));
        this.hookManager.registerClassHook('SocketManager', '_handleConnectFailed', this.stopHook.bind(this));
        this.hookManager.registerClassHook('SocketManager', '_handleLoggedOut', this.stopHook.bind(this));
        this.hookManager.registerClassHook('SocketManager', '_loginFailed', this.stopHook.bind(this));
    }

    async start() {
        console.info('[Highlite] Core Started!');
        await this.databaseManager.initDB();
        if (!this.databaseManager.database) {
            console.error('[Highlite] Database not initialized!');
            return;
        } else {
            console.info('[Highlite] Database initialized!');
        }
        await this.notificationManager.askNotificationPermission();
    }

    stop() {
        console.info('[Highlite] Core Stopped!');
        this.pluginManager.stopAll();
    }

    reload() {
        console.info('[Highlite] Core Reloading');
        this.stop();
        this.start();
    }
}
