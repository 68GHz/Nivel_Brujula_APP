import * as SQLite from "expo-sqlite";

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await SQLite.openDatabaseAsync("nivel_brujula.db");

  // Crear tablas locales con soporte de sincronización offline-first
  await dbInstance.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS medicion (
      id TEXT PRIMARY KEY,
      tipo TEXT NOT NULL CHECK (tipo IN ('nivel','rumbo','altitud')),
      valor REAL NOT NULL,
      unidad TEXT NOT NULL,
      nota TEXT,
      lat REAL,
      lng REAL,
      medida_en TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      deleted INTEGER DEFAULT 0,
      pending INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS calibracion (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      offset_x REAL NOT NULL DEFAULT 0,
      offset_y REAL NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      pending INTEGER DEFAULT 1
    );

    INSERT OR IGNORE INTO calibracion (id, offset_x, offset_y, updated_at, pending)
    VALUES (1, 0, 0, datetime('now'), 0);
  `);

  return dbInstance;
}
