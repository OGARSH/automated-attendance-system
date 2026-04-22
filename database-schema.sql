-- Automated Attendance System Database Schema
-- This script creates the necessary tables for the attendance system

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    subject VARCHAR(100),
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    grade VARCHAR(10) NOT NULL,
    section VARCHAR(10) NOT NULL,
    teacher_id INTEGER REFERENCES teachers(id),
    room_number VARCHAR(20),
    capacity INTEGER DEFAULT 30,
    academic_year VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(grade, section, academic_year)
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    class_id INTEGER REFERENCES classes(id),
    date_of_birth DATE,
    email VARCHAR(100),
    phone VARCHAR(20),
    guardian_name VARCHAR(100) NOT NULL,
    guardian_phone VARCHAR(20) NOT NULL,
    guardian_email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    class_id INTEGER REFERENCES classes(id),
    date DATE NOT NULL,
    status VARCHAR(20) CHECK (status IN ('present', 'absent', 'late', 'excused')) NOT NULL,
    marked_by INTEGER REFERENCES teachers(id),
    notes TEXT,
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_class ON attendance_records(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing

-- Sample teachers
INSERT INTO teachers (first_name, last_name, employee_id, email, phone, subject, department) VALUES
('John', 'Smith', 'TCH001', 'john.smith@school.edu', '+1234567890', 'Mathematics', 'Science'),
('Mary', 'Johnson', 'TCH002', 'mary.johnson@school.edu', '+1234567891', 'English', 'Languages'),
('David', 'Wilson', 'TCH003', 'david.wilson@school.edu', '+1234567892', 'Science', 'Science'),
('Sarah', 'Brown', 'TCH004', 'sarah.brown@school.edu', '+1234567893', 'Social Studies', 'Social Sciences'),
('Mike', 'Davis', 'TCH005', 'mike.davis@school.edu', '+1234567894', 'Physical Education', 'Sports')
ON CONFLICT (employee_id) DO NOTHING;

-- Sample classes
INSERT INTO classes (name, grade, section, teacher_id, room_number, capacity, academic_year) VALUES
('Class 1A', '1', 'A', 1, '101', 30, '2024-2025'),
('Class 2B', '2', 'B', 2, '201', 28, '2024-2025'),
('Class 3C', '3', 'C', 3, '301', 32, '2024-2025'),
('Class 4A', '4', 'A', 4, '401', 35, '2024-2025'),
('Class 5B', '5', 'B', 5, '501', 25, '2024-2025')
ON CONFLICT (grade, section, academic_year) DO NOTHING;

-- Sample students
INSERT INTO students (first_name, last_name, student_id, class_id, date_of_birth, guardian_name, guardian_phone, guardian_email) VALUES
-- Class 1A students
('Alex', 'Anderson', 'STU001', 1, '2018-03-15', 'Robert Anderson', '+1234567800', 'robert.anderson@email.com'),
('Emma', 'Johnson', 'STU002', 1, '2018-05-22', 'Lisa Johnson', '+1234567801', 'lisa.johnson@email.com'),
('Noah', 'Williams', 'STU003', 1, '2018-01-10', 'Michael Williams', '+1234567802', 'michael.williams@email.com'),
('Olivia', 'Brown', 'STU004', 1, '2018-07-08', 'Jennifer Brown', '+1234567803', 'jennifer.brown@email.com'),
('Liam', 'Jones', 'STU005', 1, '2018-04-18', 'David Jones', '+1234567804', 'david.jones@email.com'),

-- Class 2B students
('Sophia', 'Garcia', 'STU006', 2, '2017-02-14', 'Maria Garcia', '+1234567805', 'maria.garcia@email.com'),
('Mason', 'Miller', 'STU007', 2, '2017-06-25', 'James Miller', '+1234567806', 'james.miller@email.com'),
('Isabella', 'Davis', 'STU008', 2, '2017-09-12', 'Amanda Davis', '+1234567807', 'amanda.davis@email.com'),
('William', 'Rodriguez', 'STU009', 2, '2017-11-03', 'Carlos Rodriguez', '+1234567808', 'carlos.rodriguez@email.com'),
('Ava', 'Martinez', 'STU010', 2, '2017-08-20', 'Ana Martinez', '+1234567809', 'ana.martinez@email.com'),

-- Class 3C students
('James', 'Hernandez', 'STU011', 3, '2016-12-05', 'Luis Hernandez', '+1234567810', 'luis.hernandez@email.com'),
('Charlotte', 'Lopez', 'STU012', 3, '2016-10-30', 'Carmen Lopez', '+1234567811', 'carmen.lopez@email.com'),
('Benjamin', 'Gonzalez', 'STU013', 3, '2016-03-17', 'Juan Gonzalez', '+1234567812', 'juan.gonzalez@email.com'),
('Amelia', 'Wilson', 'STU014', 3, '2016-05-28', 'Patricia Wilson', '+1234567813', 'patricia.wilson@email.com'),
('Lucas', 'Anderson', 'STU015', 3, '2016-07-11', 'Mark Anderson', '+1234567814', 'mark.anderson@email.com'),

-- Class 4A students
('Harper', 'Thomas', 'STU016', 4, '2015-04-02', 'Susan Thomas', '+1234567815', 'susan.thomas@email.com'),
('Henry', 'Taylor', 'STU017', 4, '2015-01-19', 'Richard Taylor', '+1234567816', 'richard.taylor@email.com'),
('Evelyn', 'Moore', 'STU018', 4, '2015-08-07', 'Michelle Moore', '+1234567817', 'michelle.moore@email.com'),
('Alexander', 'Jackson', 'STU019', 4, '2015-11-14', 'Christopher Jackson', '+1234567818', 'christopher.jackson@email.com'),
('Abigail', 'Martin', 'STU020', 4, '2015-06-26', 'Sarah Martin', '+1234567819', 'sarah.martin@email.com'),

-- Class 5B students
('Michael', 'Lee', 'STU021', 5, '2014-09-08', 'Kevin Lee', '+1234567820', 'kevin.lee@email.com'),
('Emily', 'Perez', 'STU022', 5, '2014-12-21', 'Rosa Perez', '+1234567821', 'rosa.perez@email.com'),
('Ethan', 'White', 'STU023', 5, '2014-02-13', 'Brian White', '+1234567822', 'brian.white@email.com'),
('Elizabeth', 'Harris', 'STU024', 5, '2014-05-04', 'Karen Harris', '+1234567823', 'karen.harris@email.com'),
('Daniel', 'Clark', 'STU025', 5, '2014-10-16', 'Paul Clark', '+1234567824', 'paul.clark@email.com')
ON CONFLICT (student_id) DO NOTHING;

-- Sample attendance records for the last few days
INSERT INTO attendance_records (student_id, class_id, date, status, marked_by) VALUES
-- Today's attendance
(1, 1, CURRENT_DATE, 'present', 1),
(2, 1, CURRENT_DATE, 'present', 1),
(3, 1, CURRENT_DATE, 'absent', 1),
(4, 1, CURRENT_DATE, 'present', 1),
(5, 1, CURRENT_DATE, 'late', 1),

(6, 2, CURRENT_DATE, 'present', 2),
(7, 2, CURRENT_DATE, 'present', 2),
(8, 2, CURRENT_DATE, 'present', 2),
(9, 2, CURRENT_DATE, 'absent', 2),
(10, 2, CURRENT_DATE, 'absent', 2),

-- Yesterday's attendance
(1, 1, CURRENT_DATE - INTERVAL '1 day', 'present', 1),
(2, 1, CURRENT_DATE - INTERVAL '1 day', 'absent', 1),
(3, 1, CURRENT_DATE - INTERVAL '1 day', 'present', 1),
(4, 1, CURRENT_DATE - INTERVAL '1 day', 'present', 1),
(5, 1, CURRENT_DATE - INTERVAL '1 day', 'present', 1),

(6, 2, CURRENT_DATE - INTERVAL '1 day', 'present', 2),
(7, 2, CURRENT_DATE - INTERVAL '1 day', 'late', 2),
(8, 2, CURRENT_DATE - INTERVAL '1 day', 'present', 2),
(9, 2, CURRENT_DATE - INTERVAL '1 day', 'absent', 2),
(10, 2, CURRENT_DATE - INTERVAL '1 day', 'present', 2)
ON CONFLICT (student_id, date) DO NOTHING;

-- Create a view for attendance statistics
CREATE OR REPLACE VIEW attendance_stats AS
SELECT 
    c.id as class_id,
    c.name as class_name,
    ar.date,
    COUNT(ar.student_id) as total_students,
    COUNT(CASE WHEN ar.status = 'present' THEN 1 END) as present_count,
    COUNT(CASE WHEN ar.status = 'absent' THEN 1 END) as absent_count,
    COUNT(CASE WHEN ar.status = 'late' THEN 1 END) as late_count,
    COUNT(CASE WHEN ar.status = 'excused' THEN 1 END) as excused_count,
    ROUND(
        (COUNT(CASE WHEN ar.status = 'present' THEN 1 END)::decimal / COUNT(ar.student_id)) * 100, 
        2
    ) as attendance_rate
FROM classes c
LEFT JOIN attendance_records ar ON c.id = ar.class_id
WHERE c.is_active = true
GROUP BY c.id, c.name, ar.date
ORDER BY ar.date DESC, c.name;
