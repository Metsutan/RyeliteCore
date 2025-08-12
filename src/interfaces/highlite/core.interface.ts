/*! 

Copyright (C) 2025  HighLite

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/

import type { HookManager } from '../../managers/highlite/hookManager';
import type { ContextMenuManager } from '../../managers/game/contextMenuManager';
import type { NotificationManager } from '../../managers/highlite/notificationManager';
import type { PluginManager } from '../../managers/highlite/pluginManager';
import type { UIManager } from '../../managers/highlite/uiManager';
import type { PanelManager } from '../../managers/highlite/panelManager';
import type { SettingsManager } from '../../managers/highlite/settingsManager';
import type { DatabaseManager } from '../../managers/highlite/databaseManager';
import type { SoundManager } from '../../managers/highlite/soundsManager';

export interface IHighlite {
    hookManager: HookManager;
    contextMenuManager: ContextMenuManager;
    notificationManager: NotificationManager;
    pluginManager: PluginManager;
    uiManager: UIManager;
    panelManager: PanelManager;
    settingsManager: SettingsManager;
    databaseManager: DatabaseManager;
    soundManager: SoundManager;
}
