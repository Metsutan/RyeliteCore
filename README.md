# @highlite/plugin-api

TypeScript type definitions for the Highlite Core Plugin Development Framework.

## Installation

```bash
npm install @highlite/plugin-api
# or
yarn add @highlite/plugin-api
```

## Usage

This package provides TypeScript type definitions for developing Highlite plugins. Import the types you need:

```typescript
import { Plugin, IHighlite, PluginSettings } from '@highlite/plugin-api';

export class MyPlugin extends Plugin {
    pluginName = 'MyAwesomePlugin';
    author = 'Your Name';

    init(): void {
        // Plugin initialization
    }

    start(): void {
        // Plugin startup logic
    }

    stop(): void {
        // Plugin cleanup
    }
}
```

## Available Types

### Core Interfaces
- `IHighlite` - Main Highlite core interface
- `Plugin` - Base plugin class to extend
- `PluginSettings` - Plugin configuration interface

### Managers
- `HookManager` - Game hook management
- `NotificationManager` - In-game notifications
- `UIManager` - User interface management
- `PanelManager` - UI panel management
- `SettingsManager` - Plugin settings management
- `DatabaseManager` - Data persistence
- `SoundManager` - Audio management
- `ContextMenuManager` - Context menu handling

### Utilities
- Various utility functions for value formatting and lookups
