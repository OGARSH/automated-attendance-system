import { DatabaseService } from './database';
import { localDB, TimetableEntry } from './local-db';
import type { Student, Class, Teacher, AttendanceRecord, AttendanceStats } from './supabase';

const useLocal = import.meta.env.VITE_USE_LOCAL_DB === 'true';

export class DataService {
  // Student operations
  static async getStudents(): Promise<Student[]> {
    if (useLocal) return await localDB.students.orderBy('first_name').toArray();
    return DatabaseService.getStudents();
  }

  static async getStudentsByClass(classId: number): Promise<Student[]> {
    if (useLocal) return await localDB.students.where('class_id').equals(classId).sortBy('first_name');
    return DatabaseService.getStudentsByClass(classId);
  }

  static async addStudent(student: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student | null> {
    if (useLocal) {
      const id = await localDB.students.add({
        ...(student as any),
        id: Math.floor(Math.random() * 1_000_000),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Student);
      const saved = await localDB.students.get(id);
      return saved ?? null;
    }
    return DatabaseService.addStudent(student);
  }

  // Classes
  static async getClasses(): Promise<Class[]> {
    if (useLocal) return await localDB.classes.filter(c => c.is_active === true).sortBy('grade');
    return DatabaseService.getClasses();
  }

  static async addClass(classData: Omit<Class, 'id' | 'created_at' | 'updated_at'>): Promise<Class | null> {
    if (useLocal) {
      const id = await localDB.classes.add({
        ...(classData as any),
        id: Math.floor(Math.random() * 1_000_000),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Class);
      const saved = await localDB.classes.get(id);
      return saved ?? null;
    }
    return DatabaseService.addClass(classData);
  }

  // Teachers
  static async getTeachers(): Promise<Teacher[]> {
    if (useLocal) return await localDB.teachers.filter(t => t.is_active === true).sortBy('first_name');
    return DatabaseService.getTeachers();
  }

  // Attendance
  static async markAttendance(records: Omit<AttendanceRecord, 'id' | 'marked_at' | 'created_at' | 'updated_at'>[]): Promise<boolean> {
    if (useLocal) {
      const now = new Date().toISOString();
      await localDB.attendance_records.bulkAdd(records.map(r => ({
        ...(r as any),
        id: Math.floor(Math.random() * 1_000_000),
        marked_at: now,
        created_at: now,
        updated_at: now,
      })) as AttendanceRecord[]);
      return true;
    }
    return DatabaseService.markAttendance(records);
  }

  static async getAttendanceByDate(date: string, classId?: number): Promise<AttendanceRecord[]> {
    if (useLocal) {
      let q = localDB.attendance_records.where('date').equals(date);
      if (classId) {
        // Dexie compound filtering fallback
        const all = await q.toArray();
        return all
          .filter((r: AttendanceRecord) => r.class_id === classId)
          .sort((a: AttendanceRecord, b: AttendanceRecord) => b.created_at.localeCompare(a.created_at));
      }
      return q.reverse().sortBy('created_at');
    }
    return DatabaseService.getAttendanceByDate(date, classId);
  }

  // Simple local stats (approximate)
  static async getAttendanceStats(date: string, classId?: number): Promise<AttendanceStats[]> {
    if (!useLocal) return DatabaseService.getAttendanceStats(date, classId);
    const records = await this.getAttendanceByDate(date, classId);
    const statsMap = new Map<number, AttendanceStats>();
    for (const r of records) {
      const s = statsMap.get(r.class_id) ?? {
        class_id: r.class_id,
        date: r.date,
        total_students: 0,
        present_count: 0,
        absent_count: 0,
        late_count: 0,
        excused_count: 0,
        attendance_rate: 0,
      } as AttendanceStats;
      s.total_students++;
      if (r.status === 'present') s.present_count++;
      if (r.status === 'absent') s.absent_count++;
      if (r.status === 'late') s.late_count++;
      if (r.status === 'excused') s.excused_count++;
      statsMap.set(r.class_id, s);
    }
    for (const s of statsMap.values()) {
      s.attendance_rate = s.total_students ? Math.round((s.present_count / s.total_students) * 100) : 0;
    }
    return Array.from(statsMap.values());
  }

  // Timetable management
  static async getTimetable(classId?: number): Promise<TimetableEntry[]> {
    if (!useLocal) {
      // If using Supabase, you'd implement this in DatabaseService
      // For now, return empty array
      return [];
    }
    if (classId) {
      return localDB.timetable.where('class_id').equals(classId).toArray();
    }
    return localDB.timetable.orderBy(['day_of_week', 'start_time']).toArray();
  }

  static async addTimetableEntry(entry: Omit<TimetableEntry, 'id'>): Promise<TimetableEntry> {
    if (!useLocal) {
      // If using Supabase, you'd implement this in DatabaseService
      throw new Error('Timetable not implemented for remote database');
    }
    const id = await localDB.timetable.add(entry);
    return { id, ...entry };
  }

  static async updateTimetableEntry(id: number, entry: Partial<TimetableEntry>): Promise<void> {
    if (!useLocal) {
      // If using Supabase, you'd implement this in DatabaseService
      throw new Error('Timetable not implemented for remote database');
    }
    await localDB.timetable.update(id, entry);
  }

  static async deleteTimetableEntry(id: number): Promise<void> {
    if (!useLocal) {
      // If using Supabase, you'd implement this in DatabaseService
      throw new Error('Timetable not implemented for remote database');
    }
    await localDB.timetable.delete(id);
  }
}
