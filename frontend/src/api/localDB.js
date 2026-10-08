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

const T = {
  rajesh:  'a0000000-0000-0000-0000-000000000001',
  meena:   'a0000000-0000-0000-0000-000000000002',
  arjun:   'a0000000-0000-0000-0000-000000000003',
  priya:   'a0000000-0000-0000-0000-000000000004',
  suresh:  'a0000000-0000-0000-0000-000000000005',
  kavitha: 'a0000000-0000-0000-0000-000000000006',
  anil:    'a0000000-0000-0000-0000-000000000007',
};
const CL = {
  csA:  'b0000000-0000-0000-0000-000000000001',
  csB:  'b0000000-0000-0000-0000-000000000002',
  itA:  'b0000000-0000-0000-0000-000000000003',
  cseB: 'b0000000-0000-0000-0000-000000000004',
};

const DEMO = {
  staff: [
    { id: T.rajesh,  name: 'Dr. Rajesh Kumar',  subject: 'Mathematics',      dept: 'Science',    email: 'rajesh@college.edu',  availability: ['Monday','Tuesday','Wednesday','Thursday','Friday'], max_hrs_day: 4, prefer_morning: true,  created_at: '2024-01-01T00:00:01Z' },
    { id: T.meena,   name: 'Prof. Meena Iyer',  subject: 'Physics',          dept: 'Science',    email: 'meena@college.edu',   availability: ['Monday','Tuesday','Wednesday','Thursday','Friday'], max_hrs_day: 4, prefer_morning: false, created_at: '2024-01-01T00:00:02Z' },
    { id: T.arjun,   name: 'Dr. Arjun Sharma',  subject: 'Chemistry',        dept: 'Science',    email: 'arjun@college.edu',   availability: ['Monday','Tuesday','Wednesday','Thursday','Friday'], max_hrs_day: 4, prefer_morning: false, created_at: '2024-01-01T00:00:03Z' },
    { id: T.priya,   name: 'Ms. Priya Nair',    subject: 'Computer Science', dept: 'Technology', email: 'priya@college.edu',   availability: ['Monday','Tuesday','Wednesday','Thursday','Friday'], max_hrs_day: 5, prefer_morning: true,  created_at: '2024-01-01T00:00:04Z' },
    { id: T.suresh,  name: 'Mr. Suresh Babu',   subject: 'English',          dept: 'Humanities', email: 'suresh@college.edu',  availability: ['Monday','Tuesday','Thursday','Friday'],            max_hrs_day: 3, prefer_morning: true,  created_at: '2024-01-01T00:00:05Z' },
    { id: T.kavitha, name: 'Dr. Kavitha Rajan', subject: 'Biology',          dept: 'Science',    email: 'kavitha@college.edu', availability: ['Monday','Wednesday','Friday'],                    max_hrs_day: 3, prefer_morning: false, created_at: '2024-01-01T00:00:06Z' },
    { id: T.anil,    name: 'Mr. Anil Menon',    subject: 'Data Structures',  dept: 'Technology', email: 'anil@college.edu',    availability: ['Monday','Tuesday','Wednesday','Thursday','Friday'], max_hrs_day: 4, prefer_morning: false, created_at: '2024-01-01T00:00:07Z' },
  ],
  classes: [
    { id: CL.csA,  name: 'CS-A',  year: 1, section: 'A', dept: 'Computer Science',        capacity: 60, created_at: '2024-01-01T00:01:01Z' },
    { id: CL.csB,  name: 'CS-B',  year: 1, section: 'B', dept: 'Computer Science',        capacity: 60, created_at: '2024-01-01T00:01:02Z' },
    { id: CL.itA,  name: 'IT-A',  year: 2, section: 'A', dept: 'Information Technology',  capacity: 55, created_at: '2024-01-01T00:01:03Z' },
    { id: CL.cseB, name: 'CSE-B', year: 3, section: 'B', dept: 'Computer Science & Eng.', capacity: 50, created_at: '2024-01-01T00:01:04Z' },
  ],
  subjects: [
    { id: 's0000000-0000-0000-0000-000000000001', class_id: CL.csA,  teacher_id: T.rajesh,  name: 'Mathematics',      hours_per_week: 5, is_lab: false, prefer_morning: true,  created_at: '2024-01-01T00:02:01Z' },
    { id: 's0000000-0000-0000-0000-000000000002', class_id: CL.csA,  teacher_id: T.meena,   name: 'Physics',          hours_per_week: 3, is_lab: false, prefer_morning: false, created_at: '2024-01-01T00:02:02Z' },
    { id: 's0000000-0000-0000-0000-000000000003', class_id: CL.csA,  teacher_id: T.priya,   name: 'Computer Science', hours_per_week: 4, is_lab: false, prefer_morning: true,  created_at: '2024-01-01T00:02:03Z' },
    { id: 's0000000-0000-0000-0000-000000000004', class_id: CL.csA,  teacher_id: T.suresh,  name: 'English',          hours_per_week: 3, is_lab: false, prefer_morning: true,  created_at: '2024-01-01T00:02:04Z' },
    { id: 's0000000-0000-0000-0000-000000000005', class_id: CL.csA,  teacher_id: T.priya,   name: 'CS Lab',           hours_per_week: 2, is_lab: true,  prefer_morning: false, created_at: '2024-01-01T00:02:05Z' },
    { id: 's0000000-0000-0000-0000-000000000006', class_id: CL.csB,  teacher_id: T.rajesh,  name: 'Mathematics',      hours_per_week: 5, is_lab: false, prefer_morning: true,  created_at: '2024-01-01T00:02:06Z' },
    { id: 's0000000-0000-0000-0000-000000000007', class_id: CL.csB,  teacher_id: T.arjun,   name: 'Chemistry',        hours_per_week: 3, is_lab: false, prefer_morning: false, created_at: '2024-01-01T00:02:07Z' },
    { id: 's0000000-0000-0000-0000-000000000008', class_id: CL.csB,  teacher_id: T.priya,   name: 'Computer Science', hours_per_week: 3, is_lab: false, prefer_morning: true,  created_at: '2024-01-01T00:02:08Z' },
    { id: 's0000000-0000-0000-0000-000000000009', class_id: CL.csB,  teacher_id: T.suresh,  name: 'English',          hours_per_week: 3, is_lab: false, prefer_morning: true,  created_at: '2024-01-01T00:02:09Z' },
    { id: 's0000000-0000-0000-0000-000000000010', class_id: CL.itA,  teacher_id: T.meena,   name: 'Physics',          hours_per_week: 3, is_lab: false, prefer_morning: false, created_at: '2024-01-01T00:02:10Z' },
    { id: 's0000000-0000-0000-0000-000000000011', class_id: CL.itA,  teacher_id: T.arjun,   name: 'Chemistry',        hours_per_week: 3, is_lab: false, prefer_morning: false, created_at: '2024-01-01T00:02:11Z' },
    { id: 's0000000-0000-0000-0000-000000000012', class_id: CL.itA,  teacher_id: T.anil,    name: 'Data Structures',  hours_per_week: 4, is_lab: false, prefer_morning: false, created_at: '2024-01-01T00:02:12Z' },
    { id: 's0000000-0000-0000-0000-000000000013', class_id: CL.itA,  teacher_id: T.kavitha, name: 'Biology',          hours_per_week: 3, is_lab: false, prefer_morning: false, created_at: '2024-01-01T00:02:13Z' },
    { id: 's0000000-0000-0000-0000-000000000014', class_id: CL.cseB, teacher_id: T.anil,    name: 'Data Structures',  hours_per_week: 4, is_lab: false, prefer_morning: false, created_at: '2024-01-01T00:02:14Z' },
    { id: 's0000000-0000-0000-0000-000000000015', class_id: CL.cseB, teacher_id: T.priya,   name: 'Computer Science', hours_per_week: 4, is_lab: false, prefer_morning: true,  created_at: '2024-01-01T00:02:15Z' },
    { id: 's0000000-0000-0000-0000-000000000016', class_id: CL.cseB, teacher_id: T.priya,   name: 'CS Lab',           hours_per_week: 2, is_lab: true,  prefer_morning: false, created_at: '2024-01-01T00:02:16Z' },
  ],
  rooms: [
    { id: 'r0000000-0000-0000-0000-000000000001', name: 'Room 101',    capacity: 65, is_lab: false, created_at: '2024-01-01T00:03:01Z' },
    { id: 'r0000000-0000-0000-0000-000000000002', name: 'Room 102',    capacity: 65, is_lab: false, created_at: '2024-01-01T00:03:02Z' },
    { id: 'r0000000-0000-0000-0000-000000000003', name: 'Room 201',    capacity: 60, is_lab: false, created_at: '2024-01-01T00:03:03Z' },
    { id: 'r0000000-0000-0000-0000-000000000004', name: 'CS Lab',      capacity: 40, is_lab: true,  created_at: '2024-01-01T00:03:04Z' },
    { id: 'r0000000-0000-0000-0000-000000000005', name: 'Physics Lab', capacity: 40, is_lab: true,  created_at: '2024-01-01T00:03:05Z' },
  ],
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
