import type { Plugin } from './interfaces/highlite/plugin/plugin.class';
import { PluginManager } from './managers/highlite/pluginManager';
declare global {
    interface Window {
        [key: string]: any;
    }

    interface Document {
        highlite: {
            managers: {
                [key: string]: any;
            };
            gameHooks: {
                [key: string]: any;
            };
            gameLookups: {
                [key: string]: any;
            };
        };

        client: {
            [key: string]: any;
        };

        game: {
            [key: string]: any;
        };
    }
}