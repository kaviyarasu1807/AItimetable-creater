/**
 * localDB.js - Offline-first localStorage mock of supabase-js
 * Pre-seeded with R.V.S. College demo data.
 */

const uuid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });

const DEMO = {
  staff: [],
  classes: [],
  subjects: [],
  rooms: [],
  timetables: [],
};

function getTable(name) {
  const key = `rvs_${name}`;
  const stored = localStorage.getItem(key);
  if (stored !== null) return JSON.parse(stored);
  const demo = DEMO[name] || [];
  localStorage.setItem(key, JSON.stringify(demo));
  return demo;
}

function setTable(name, data) {
  localStorage.setItem(`rvs_${name}`, JSON.stringify(data));
}

class SupaQuery {
  constructor(table) {
    this._table = table; this._op = 'select'; this._payload = null;
    this._conds = []; this._order = null; this._isSingle = false;
  }
  select()       { return this; }
  order(col, opts = {}) { this._order = { col, asc: opts.ascending !== false }; return this; }
  eq(col, val)   { this._conds.push({ type: 'eq',  col, val }); return this; }
  neq(col, val)  { this._conds.push({ type: 'neq', col, val }); return this; }
  single()       { this._isSingle = true; return this; }
  insert(p)      { this._op = 'insert'; this._payload = p; return this; }
  update(p)      { this._op = 'update'; this._payload = p; return this; }
  delete()       { this._op = 'delete'; return this; }

  _matches(row) {
    return this._conds.every(c =>
      c.type === 'eq'  ? row[c.col] === c.val :
      c.type === 'neq' ? row[c.col] !== c.val : true
    );
  }

  async _run() {
    try {
      const rows = getTable(this._table);
      if (this._op === 'select') {
        let data = rows.filter(r => this._matches(r));
        if (this._order) {
          const { col, asc } = this._order;
          data = [...data].sort((a, b) => {
            const av = a[col] ?? '', bv = b[col] ?? '';
            return asc ? (av < bv ? -1 : av > bv ? 1 : 0) : (bv < av ? -1 : bv > av ? 1 : 0);
          });
        }
        if (this._isSingle) return { data: data[0] ?? null, error: null };
        return { data, error: null };
      }
      if (this._op === 'insert') {
        const now = new Date().toISOString();
        const items = (Array.isArray(this._payload) ? this._payload : [this._payload])
          .map(item => ({ id: uuid(), created_at: now, ...item }));
        setTable(this._table, [...rows, ...items]);
        if (this._isSingle) return { data: items[0], error: null };
        return { data: items, error: null };
      }
      if (this._op === 'update') {
        const updated = rows.map(r => this._matches(r) ? { ...r, ...this._payload } : r);
        setTable(this._table, updated);
        const changed = updated.filter(r => this._matches(r));
        if (this._isSingle) return { data: changed[0] ?? null, error: null };
        return { data: changed, error: null };
      }
      if (this._op === 'delete') {
        setTable(this._table, rows.filter(r => !this._matches(r)));
        return { data: null, error: null };
      }
      return { data: null, error: { message: 'Unknown op' } };
    } catch (e) {
      return { data: null, error: { message: e.message } };
    }
  }
  then(resolve, reject) { return this._run().then(resolve, reject); }
}

const SESSION_KEY = 'rvs_auth_session';
const localAuth = {
  getSession: async () => {
    const stored = localStorage.getItem(SESSION_KEY);
    return { data: { session: stored ? JSON.parse(stored) : null }, error: null };
  },
  onAuthStateChange: (callback) => {
    void callback;
    return { data: { subscription: { unsubscribe: () => {} } } };
  },
  signInWithPassword: async ({ email, password }) => {
    if (!password || password.length < 6)
      return { data: null, error: { message: 'Password must be at least 6 characters' } };
    const session = { user: { email, id: 'local-user' } };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { data: { session }, error: null };
  },
  signUp: async ({ email, password }) => {
    if (!password || password.length < 6)
      return { data: null, error: { message: 'Password must be at least 6 characters' } };
    const session = { user: { email, id: 'local-user' } };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { data: { session }, error: null };
  },
  signOut: async () => {
    localStorage.removeItem(SESSION_KEY);
    return { error: null };
  },
};

export const localClient = {
  from: (table) => new SupaQuery(table),
  auth: localAuth,
};

export function resetLocalDB() {
  ['staff', 'classes', 'subjects', 'rooms', 'timetables'].forEach(name =>
    localStorage.removeItem(`rvs_${name}`)
  );
}
