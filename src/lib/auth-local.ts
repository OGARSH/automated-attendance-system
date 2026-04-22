import { localDB } from './local-db';

export type LocalUser = {
  id?: number;
  username: string; // admin or teacher id
  role: 'admin' | 'teacher' | 'student';
  passwordHash: string;
  created_at: string;
};

async function sha256(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const LocalAuth = {
  async ensureDefaultAdmin() {
    // username: admin, password: admin123 (change in UI later)
    const existing = await (localDB as any).table('users').where('username').equals('admin').first();
    if (!existing) {
      const passwordHash = await sha256('admin123');
      await (localDB as any).table('users').add({
        username: 'admin',
        role: 'admin',
        passwordHash,
        created_at: new Date().toISOString(),
      } as LocalUser);
    }
  },

  async login(username: string, password: string): Promise<Omit<LocalUser, 'passwordHash'> | null> {
    const user = await (localDB as any).table('users').where('username').equals(username).first() as LocalUser | undefined;
    if (!user) return null;
    const hash = await sha256(password);
    if (hash !== user.passwordHash) return null;
    const { passwordHash, ...safe } = user;
    return safe;
  },

  async createTeacherAccount(username: string, password: string): Promise<Omit<LocalUser, 'passwordHash'>> {
    const exists = await (localDB as any).table('users').where('username').equals(username).first();
    if (exists) throw new Error('Username already exists');
    const passwordHash = await sha256(password);
    const id = await (localDB as any).table('users').add({
      username,
      role: 'teacher',
      passwordHash,
      created_at: new Date().toISOString(),
    } as LocalUser);
    const saved = await (localDB as any).table('users').get(id) as LocalUser;
    const { passwordHash: _, ...safe } = saved;
    return safe;
  },

  async listTeachers(): Promise<Array<Omit<LocalUser, 'passwordHash'>>> {
    const rows = await (localDB as any).table('users').where('role').equals('teacher').toArray() as LocalUser[];
    return rows.map(({ passwordHash, ...rest }) => rest);
  },

  async listByRole(role: 'admin' | 'teacher' | 'student'): Promise<Array<Omit<LocalUser, 'passwordHash'>>> {
    const rows = await (localDB as any).table('users').where('role').equals(role).toArray() as LocalUser[];
    return rows.map(({ passwordHash, ...rest }) => rest);
  },

  async createStudentAccount(username: string, password: string): Promise<Omit<LocalUser, 'passwordHash'>> {
    const exists = await (localDB as any).table('users').where('username').equals(username).first();
    if (exists) throw new Error('Username already exists');
    const passwordHash = await sha256(password);
    const id = await (localDB as any).table('users').add({
      username,
      role: 'student',
      passwordHash,
      created_at: new Date().toISOString(),
    } as LocalUser);
    const saved = await (localDB as any).table('users').get(id) as LocalUser;
    const { passwordHash: _, ...safe } = saved;
    return safe;
  },

  async deleteUser(id: number): Promise<void> {
    await (localDB as any).table('users').delete(id);
  },

  async resetPassword(id: number, newPassword: string): Promise<void> {
    const passwordHash = await sha256(newPassword);
    await (localDB as any).table('users').update(id, { passwordHash });
  },

  async getPasswordHash(id: number): Promise<string | null> {
    const row = await (localDB as any).table('users').get(id) as LocalUser | undefined;
    return row?.passwordHash ?? null;
  },

  async renameUser(id: number, newUsername: string): Promise<void> {
    const exists = await (localDB as any).table('users').where('username').equals(newUsername).first();
    if (exists && exists.id !== id) throw new Error('Username already exists');
    await (localDB as any).table('users').update(id, { username: newUsername });
  },
};
