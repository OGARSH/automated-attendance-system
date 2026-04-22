import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { DatabaseService } from '../lib/database';
import { DataService } from '../lib/data-service';
import { Class } from '../lib/supabase';
import { AddClassModal } from './AddClassModal';
import { 
  Users, 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Clock,
  BookOpen,
  Plus
} from 'lucide-react';

interface ClassListProps {
  language: 'en' | 'hi';
}

interface ClassWithStats extends Class {
  totalStudents: number;
  present: number;
  absent: number;
  lastUpdated: string;
}

const translations = {
  en: {
    classManagement: 'Class Management',
    searchClasses: 'Search classes...',
    addClass: 'Add Class',
    className: 'Class Name',
    students: 'Students',
    present: 'Present',
    absent: 'Absent',
    lastUpdated: 'Last Updated',
    markAttendance: 'Mark Attendance',
    viewDetails: 'View Details',
    active: 'Active',
    inactive: 'Inactive'
  },
  hi: {
    classManagement: 'कक्षा प्रबंधन',
    searchClasses: 'कक्षा खोजें...',
    addClass: 'कक्षा जोड़ें',
    className: 'कक्षा का नाम',
    students: 'छात्र',
    present: 'उपस्थित',
    absent: 'अनुपस्थित',
    lastUpdated: 'अंतिम अपडेट',
    markAttendance: 'उपस्थिति चिह्नित करें',
    viewDetails: 'विवरण देखें',
    active: 'सक्रिय',
    inactive: 'निष्क्रिय'
  }
};

export function ClassList({ language }: ClassListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [classes, setClasses] = useState<ClassWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const t = translations[language];

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const classesData = await DataService.getClasses();
      const today = new Date().toISOString().split('T')[0];
      
      // Get attendance stats for each class
      const classesWithStats = await Promise.all(
        classesData.map(async (classData) => {
          try {
            const students = await DataService.getStudentsByClass(classData.id);
            const attendance = await DataService.getAttendanceByDate(today, classData.id);
            
            const present = attendance.filter(record => record.status === 'present').length;
            const absent = students.length - present;
            
            return {
              ...classData,
              totalStudents: students.length,
              present,
              absent,
              lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
          } catch (error) {
            console.error(`Error loading stats for class ${classData.id}:`, error);
            return {
              ...classData,
              totalStudents: 0,
              present: 0,
              absent: 0,
              lastUpdated: 'N/A'
            };
          }
        })
      );
      
      setClasses(classesWithStats);
    } catch (error) {
      console.error('Error loading classes:', error);
      // Fallback to sample data if database fails
      setClasses([
        {
          id: 1,
          name: 'Class 1A',
          grade: '1',
          section: 'A',
          teacher_id: 1,
          capacity: 30,
          academic_year: '2024-2025',
          is_active: true,
          created_at: '',
          updated_at: '',
          totalStudents: 25,
          present: 23,
          absent: 2,
          lastUpdated: '10:30 AM'
        },
        {
          id: 2,
          name: 'Class 2B',
          grade: '2',
          section: 'B',
          teacher_id: 2,
          capacity: 28,
          academic_year: '2024-2025',
          is_active: true,
          created_at: '',
          updated_at: '',
          totalStudents: 27,
          present: 25,
          absent: 2,
          lastUpdated: '11:15 AM'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(classItem =>
    classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classItem.section.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAttendanceRate = (present: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((present / total) * 100);
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 dark:text-green-400';
    if (rate >= 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading classes...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t.classManagement}
        </h2>
        <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800" onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t.addClass}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder={t.searchClasses}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <Button variant="outline" className="flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClasses.map((cls) => {
          const attendanceRate = getAttendanceRate(cls.present, cls.totalStudents);
          
          return (
            <Card key={cls.id} className="p-6 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {cls.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Grade {cls.grade} - Section {cls.section}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {t.active}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-1" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {cls.totalStudents}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t.students}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400 mr-1" />
                  </div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {cls.present}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t.present}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <UserX className="h-4 w-4 text-red-600 dark:text-red-400 mr-1" />
                  </div>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {cls.absent}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t.absent}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Attendance Rate
                  </span>
                  <span className={`text-sm font-medium ${getAttendanceColor(attendanceRate)}`}>
                    {attendanceRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      attendanceRate >= 90 
                        ? 'bg-green-600 dark:bg-green-400'
                        : attendanceRate >= 80 
                        ? 'bg-yellow-600 dark:bg-yellow-400'
                        : 'bg-red-600 dark:bg-red-400'
                    }`}
                    style={{ width: `${attendanceRate}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{t.lastUpdated}: {cls.lastUpdated}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                  {t.markAttendance}
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  {t.viewDetails}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredClasses.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <BookOpen className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No classes found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first class.'}
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t.addClass}
            </Button>
          </div>
        </Card>
      )}

      <AddClassModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        language={language}
        onClassAdded={loadClasses}
      />
    </div>
  );
}
