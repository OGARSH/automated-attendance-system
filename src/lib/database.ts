import { supabase, Student, Class, Teacher, AttendanceRecord, AttendanceStats } from './supabase';
import { format, startOfDay, endOfDay, subDays, parseISO } from 'date-fns';

export class DatabaseService {
  // Student operations
  static async getStudents(): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('first_name');
    
    if (error) {
      console.error('Error fetching students:', error);
      return [];
    }
    
    return data || [];
  }

  static async getStudentsByClass(classId: number): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', classId)
      .order('first_name');
    
    if (error) {
      console.error('Error fetching students by class:', error);
      return [];
    }
    
    return data || [];
  }

  static async addStudent(student: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student | null> {
    const { data, error } = await supabase
      .from('students')
      .insert([student])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding student:', error);
      return null;
    }
    
    return data;
  }

  // Class operations
  static async getClasses(): Promise<Class[]> {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('is_active', true)
      .order('grade', { ascending: true })
      .order('section', { ascending: true });
    
    if (error) {
      console.error('Error fetching classes:', error);
      return [];
    }
    
    return data || [];
  }

  static async getClassById(id: number): Promise<Class | null> {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching class:', error);
      return null;
    }
    
    return data;
  }

  static async addClass(classData: Omit<Class, 'id' | 'created_at' | 'updated_at'>): Promise<Class | null> {
    const { data, error } = await supabase
      .from('classes')
      .insert([classData])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding class:', error);
      return null;
    }
    
    return data;
  }

  // Teacher operations
  static async getTeachers(): Promise<Teacher[]> {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('is_active', true)
      .order('first_name');
    
    if (error) {
      console.error('Error fetching teachers:', error);
      return [];
    }
    
    return data || [];
  }

  static async getTeacherById(id: number): Promise<Teacher | null> {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching teacher:', error);
      return null;
    }
    
    return data;
  }

  // Attendance operations
  static async markAttendance(records: Omit<AttendanceRecord, 'id' | 'marked_at' | 'created_at' | 'updated_at'>[]): Promise<boolean> {
    const attendanceRecords = records.map(record => ({
      ...record,
      marked_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('attendance_records')
      .insert(attendanceRecords);
    
    if (error) {
      console.error('Error marking attendance:', error);
      return false;
    }
    
    return true;
  }

  static async getAttendanceByDate(date: string, classId?: number): Promise<AttendanceRecord[]> {
    let query = supabase
      .from('attendance_records')
      .select(`
        *,
        students (
          id,
          first_name,
          last_name,
          student_id
        )
      `)
      .eq('date', date);

    if (classId) {
      query = query.eq('class_id', classId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching attendance:', error);
      return [];
    }
    
    return data || [];
  }

  static async getAttendanceStats(date: string, classId?: number): Promise<AttendanceStats[]> {
    // This would be a complex query or a database view
    // For now, we'll calculate it from the attendance records
    const attendanceRecords = await this.getAttendanceByDate(date, classId);
    
    if (!attendanceRecords.length) return [];

    const stats: { [key: number]: AttendanceStats } = {};

    attendanceRecords.forEach(record => {
      if (!stats[record.class_id]) {
        stats[record.class_id] = {
          class_id: record.class_id,
          date: record.date,
          total_students: 0,
          present_count: 0,
          absent_count: 0,
          late_count: 0,
          excused_count: 0,
          attendance_rate: 0
        };
      }

      stats[record.class_id].total_students++;
      
      switch (record.status) {
        case 'present':
          stats[record.class_id].present_count++;
          break;
        case 'absent':
          stats[record.class_id].absent_count++;
          break;
        case 'late':
          stats[record.class_id].late_count++;
          break;
        case 'excused':
          stats[record.class_id].excused_count++;
          break;
      }
    });

    // Calculate attendance rates
    Object.values(stats).forEach(stat => {
      stat.attendance_rate = Math.round((stat.present_count / stat.total_students) * 100);
    });

    return Object.values(stats);
  }

  static async getStudentAttendanceHistory(studentId: number, days: number = 30): Promise<AttendanceRecord[]> {
    const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
    
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('student_id', studentId)
      .gte('date', startDate)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching student attendance history:', error);
      return [];
    }
    
    return data || [];
  }

  static async getClassAttendanceHistory(classId: number, days: number = 30): Promise<AttendanceRecord[]> {
    const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
    
    const { data, error } = await supabase
      .from('attendance_records')
      .select(`
        *,
        students (
          id,
          first_name,
          last_name,
          student_id
        )
      `)
      .eq('class_id', classId)
      .gte('date', startDate)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching class attendance history:', error);
      return [];
    }
    
    return data || [];
  }

  // AI Analysis functions
  static async getAttendancePatterns(classId?: number, days: number = 30): Promise<any> {
    const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
    
    let query = supabase
      .from('attendance_records')
      .select(`
        *,
        students (
          id,
          first_name,
          last_name
        ),
        classes (
          id,
          name,
          grade,
          section
        )
      `)
      .gte('date', startDate);

    if (classId) {
      query = query.eq('class_id', classId);
    }

    const { data, error } = await query.order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching attendance patterns:', error);
      return null;
    }
    
    return data;
  }

  static async getLowAttendanceStudents(threshold: number = 80, days: number = 30): Promise<any[]> {
    const patterns = await this.getAttendancePatterns(undefined, days);
    if (!patterns) return [];

    const studentStats: { [key: number]: any } = {};

    patterns.forEach((record: any) => {
      if (!studentStats[record.student_id]) {
        studentStats[record.student_id] = {
          student: record.students,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0
        };
      }

      studentStats[record.student_id].total++;
      studentStats[record.student_id][record.status]++;
    });

    return Object.values(studentStats)
      .map((stat: any) => ({
        ...stat,
        attendance_rate: Math.round((stat.present / stat.total) * 100)
      }))
      .filter((stat: any) => stat.attendance_rate < threshold)
      .sort((a: any, b: any) => a.attendance_rate - b.attendance_rate);
  }
}
