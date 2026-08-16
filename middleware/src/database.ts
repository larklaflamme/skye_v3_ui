import initSqlJs, {
  Database as SqlJsDatabase,
  SqlJsStatic,
  BindParams,
} from 'sql.js';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { config } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(__dirname, '..', config.sqlite.path);

// Ensure data directory exists
mkdirSync(resolve(__dirname, '..', 'data'), { recursive: true });

let SQL: SqlJsStatic | null = null;
let _db: SqlJsDatabase | null = null;

// ── Statement Wrapper ──────────────────────────────────────────────
// Mimics better-sqlite3's Statement API on top of sql.js

class StatementWrapper {
  private stmt: any; // sql.js Statement
  private columnNames: string[];

  constructor(stmt: any) {
    this.stmt = stmt;
    this.columnNames = stmt.getColumnNames();
  }

  /**
   * Get the first row as an object, or undefined if no rows.
   * Accepts the same argument patterns as better-sqlite3:
   *   .get()           — no params
   *   .get(val)        — single positional param
   *   .get(v1, v2, v3) — multiple positional params
   */
  get(...params: any[]): any {
    const bindParams: BindParams | null = this._toBindParams(params);
    if (bindParams !== null) {
      this.stmt.bind(bindParams);
    }
    // step() returns true only when a row exists. getAsObject() alone is
    // unreliable: on zero rows it returns an object with all column names
    // as keys (values undefined), so Object.keys().length is always > 0.
    if (this.stmt.step()) {
      const row = this.stmt.getAsObject();
      this.stmt.reset();
      return row;
    }
    this.stmt.reset();
    return undefined;
  }

  /**
   * Get all rows as an array of objects.
   * Same argument patterns as get().
   */
  all(...params: any[]): any[] {
    const bindParams: BindParams | null = this._toBindParams(params);
    if (bindParams !== null) {
      this.stmt.bind(bindParams);
    }
    const results: any[] = [];
    while (this.stmt.step()) {
      results.push(this.stmt.getAsObject());
    }
    this.stmt.reset();
    return results;
  }

  /**
   * Execute the statement (INSERT/UPDATE/DELETE).
   * Same argument patterns as get().
   */
  run(...params: any[]): void {
    const bindParams: BindParams | null = this._toBindParams(params);
    this.stmt.run(bindParams);
    scheduleSave();
  }

  free(): void {
    this.stmt.free();
  }

  private _toBindParams(params: any[]): BindParams | null {
    if (params.length === 0) return null;
    // If a single array is passed, use it directly
    if (params.length === 1 && Array.isArray(params[0])) return params[0];
    return params;
  }
}

// ── Database Wrapper ───────────────────────────────────────────────

class DbWrapper {
  prepare(sql: string): StatementWrapper {
    if (!_db) throw new Error('Database not initialized');
    const stmt = _db.prepare(sql);
    return new StatementWrapper(stmt);
  }

  exec(sql: string): void {
    if (!_db) throw new Error('Database not initialized');
    _db.exec(sql);
    scheduleSave();
  }

  pragma(pragma: string): void {
    if (!_db) throw new Error('Database not initialized');
    _db.exec(`PRAGMA ${pragma}`);
  }
}

const dbWrapper = new DbWrapper();

// ── Persistence ────────────────────────────────────────────────────
// Debounced save: batches writes within 50ms into a single disk write.
// Unlike the old savePending boolean, this never drops a write —
// each call resets the timer, and the save always fires after the
// last write in the burst.

let saveTimer: NodeJS.Immediate | null = null;

function scheduleSave(): void {
  if (!_db) return;
  if (saveTimer) clearImmediate(saveTimer);
  saveTimer = setImmediate(() => {
    saveTimer = null;
    try {
      const data = _db!.export();
      writeFileSync(dbPath, Buffer.from(data));
    } catch (err) {
      console.error('[db] Failed to save database:', err);
    }
  });
}

// ── Initialization ─────────────────────────────────────────────────

export async function initDatabase(): Promise<void> {
  SQL = await initSqlJs();

  // Try to load existing database
  try {
    const buffer = readFileSync(dbPath);
    _db = new SQL.Database(buffer);
    console.log('[db] Loaded existing database');
  } catch {
    _db = new SQL.Database();
    console.log('[db] Created new database');
  }

  // Enable WAL mode and foreign keys
  _db.exec('PRAGMA journal_mode=WAL');
  _db.exec('PRAGMA foreign_keys=ON');

  // Create schema
  _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'guest' CHECK(role IN ('admin', 'trusted', 'guest')),
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
      created_at TEXT NOT NULL,
      last_active TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS threads (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activation_codes (
      code TEXT PRIMARY KEY,
      recipient_email TEXT,
      role TEXT NOT NULL DEFAULT 'trusted' CHECK(role IN ('admin', 'trusted', 'guest')),
      status TEXT NOT NULL DEFAULT 'unused' CHECK(status IN ('unused', 'used', 'expired')),
      created_at TEXT NOT NULL,
      expires_at TEXT,
      used_at TEXT,
      used_by TEXT REFERENCES users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_threads_user ON threads(user_id);
    CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id);
    CREATE INDEX IF NOT EXISTS idx_codes_status ON activation_codes(status);
  `);

  // Persist initial schema
  scheduleSave();

  // Seed default admin check
  const row = dbWrapper.prepare(
    'SELECT COUNT(*) as count FROM users WHERE role = ?'
  ).get('admin');

  if (!row || row.count === 0) {
    console.log('[db] No admin user found. Admin account must be created via signup with an admin activation code.');
  }
}

export function getDb(): DbWrapper {
  if (!_db) throw new Error('Database not initialized — call initDatabase() first');
  return dbWrapper;
}

export default dbWrapper;
