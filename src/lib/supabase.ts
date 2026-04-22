import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lcrxdvjatjzfwgsazymc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjcnhkdmphdGp6Zndnc2F6eW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2NTc2MzIsImV4cCI6MjA3MzIzMzYzMn0.IEbcsVajGahXG6Epe1pwdBcyAHFL965_xQm3d6Ee8kU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  student_id: string;
  class_id: number;
  date_of_birth: string;
  email?: string;
  phone?: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_email?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: number;
  name: string;
  grade: string;
  section: string;
  teacher_id: number;
  room_number?: string;
  capacity: number;
  academic_year: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  employee_id: string;
  email: string;
  phone: string;
  subject?: string;
  department?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: number;
  student_id: number;
  class_id: number;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  marked_by: number; // teacher_id
  notes?: string;
  marked_at: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceStats {
  class_id: number;
  date: string;
  total_students: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  attendance_rate: number;
}
