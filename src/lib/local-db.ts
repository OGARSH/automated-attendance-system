import { Dexie, Table } from 'dexie';
import type { Student, Class, Teacher, AttendanceRecord } from './supabase';

export interface TimetableEntry {
  id?: number;
  class_id: number;
  subject: string;
  teacher_id: number;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string;
  end_time: string;
  room?: string;
}

class LocalDB extends Dexie {
  students!: Table<Student, number>;
  classes!: Table<Class, number>;
  teachers!: Table<Teacher, number>;
  attendance_records!: Table<AttendanceRecord, number>;
  timetable!: Table<TimetableEntry, number>;

  constructor() {
    super('attendance_local_db');
    this.version(1).stores({
      students: '++id, student_id, class_id, first_name, last_name',
      classes: '++id, grade, section, is_active',
      teachers: '++id, first_name, last_name, is_active',
      attendance_records: '++id, student_id, class_id, date, status',
    });
    this.version(2).stores({
      students: '++id, student_id, class_id, first_name, last_name',
      classes: '++id, grade, section, is_active',
      teachers: '++id, first_name, last_name, is_active',
      attendance_records: '++id, student_id, class_id, date, status',
      users: '++id, username, role',
    });
    this.version(3).stores({
      students: '++id, student_id, class_id, first_name, last_name',
      classes: '++id, grade, section, is_active',
      teachers: '++id, first_name, last_name, is_active',
      attendance_records: '++id, student_id, class_id, date, status',
      users: '++id, username, role',
      timetable: '++id, class_id, teacher_id, day_of_week, start_time, end_time',
    });
  }
}

export const localDB = new LocalDB();
