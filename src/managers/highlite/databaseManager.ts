import { openDB, type IDBPDatabase } from 'idb';
import type { HighliteSchema } from '../../interfaces/highlite/database/database.schema';

export class DatabaseManager {
    private static instance: DatabaseManager;
    database!: IDBPDatabase<HighliteSchema>;

    constructor() {
        if (DatabaseManager.instance) {
            return DatabaseManager.instance;
        }
        DatabaseManager.instance = this;
        document.highlite.managers.DatabaseManager = this;
    }

    async initDB() {
        this.database = await openDB<HighliteSchema>('HighliteDatabase', 3, {
            upgrade(db, oldVersion) {
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings');
                }
                if (
                    oldVersion < 2 &&
                    !db.objectStoreNames.contains('drop_logs')
                ) {
                    db.createObjectStore('drop_logs');
                }
                if (oldVersion < 3) {
                    db.createObjectStore("data");
                    if (db.objectStoreNames.contains('settings')) {
                        // Clear the settings store if it exists
                        db.deleteObjectStore('settings');
                        db.createObjectStore('settings');
                    }
                }
            },
        });
    }
}
