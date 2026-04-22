import React, { useState, useEffect } from 'react';
import { 
  LogOut, 
  Moon, 
  Sun, 
  Users, 
  Calendar, 
  TrendingUp, 
  Bell,
  BookOpen,
  Clock,
  UserCheck,
  AlertTriangle,
  Plus,
  Search
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { useTheme } from './ThemeProvider';
import { AttendanceStats } from './AttendanceStats';
import { ClassList } from './ClassList';
import { AiSuggestions } from './AiSuggestions';
import { MarkAttendanceModal } from './MarkAttendanceModal';
import { AddStudentModal } from './AddStudentModal';
import { AddClassModal } from './AddClassModal';
import { SendNotificationModal } from './SendNotificationModal';
import { ViewReportsModal } from './ViewReportsModal';
import { DataService } from '@/lib/data-service';
import type { TimetableEntry } from '@/lib/local-db';

interface TeacherDashboardProps {
  user: any;
  language: 'en' | 'hi';
  onLogout: () => void;
}

const translations = {
  en: {
    dashboard: 'Teacher Dashboard',
    welcome: 'Welcome',
    todayAttendance: "Today's Attendance",
    totalStudents: 'Total Students',
    present: 'Present',
    absent: 'Absent',
    attendanceRate: 'Attendance Rate',
    classes: 'My Classes',
    aiSuggestions: 'AI Suggestions',
    notifications: 'Notifications',
    quickActions: 'Quick Actions',
    markAttendance: 'Mark Attendance',
    viewReports: 'View Reports',
    addStudent: 'Add Student',
    addClass: 'Add Class',
    sendNotifications: 'Send Notifications',
    logout: 'Logout',
    searchClasses: 'Search classes...',
    timetable: 'My Timetable',
    noSchedule: 'No classes scheduled for today'
  },
  hi: {
    dashboard: 'शिक्षक डैशबोर्ड',
    welcome: 'स्वागत',
    todayAttendance: 'आज की उपस्थिति',
    totalStudents: 'कुल छात्र',
    present: 'उपस्थित',
    absent: 'अनुपस्थित',
    attendanceRate: 'उपस्थिति दर',
    classes: 'मेरी कक्षाएं',
    aiSuggestions: 'AI सुझाव',
    notifications: 'सूचनाएं',
    quickActions: 'त्वरित कार्य',
    markAttendance: 'उपस्थिति चिह्नित करें',
    viewReports: 'रिपोर्ट देखें',
    addStudent: 'छात्र जोड़ें',
    addClass: 'कक्षा जोड़ें',
    sendNotifications: 'सूचनाएं भेजें',
    logout: 'लॉगआउट',
    searchClasses: 'कक्षा खोजें...',
    timetable: 'मेरा समय-सारणी',
    noSchedule: 'आज कोई कक्षा निर्धारित नहीं है'
  }
};

export function TeacherDashboard({ user, language, onLogout }: TeacherDashboardProps) {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [modals, setModals] = useState({
    markAttendance: false,
    addStudent: false,
    addClass: false,
    sendNotification: false,
    viewReports: false
  });
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const t = translations[language];

  useEffect(() => {
    loadTeacherTimetable();
  }, [user]);

  const loadTeacherTimetable = async () => {
    try {
      // Get all timetable entries for this teacher
      const allTimetable = await DataService.getTimetable();
      const teacherSchedule = allTimetable.filter(entry => entry.teacher_id === user.id);
      setTimetable(teacherSchedule);
      
      // Load classes to get class names
      const allClasses = await DataService.getClasses();
      setClasses(allClasses);
    } catch (error) {
      console.error('Failed to load teacher timetable:', error);
    }
  };

  const openModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  };

  const todayStats = {
    total: 145,
    present: 132,
    absent: 13,
    rate: 91
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            <div className="flex items-center">
              <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-primary mr-2 md:mr-3" />
              <h1 className="text-lg md:text-xl font-bold text-card-foreground">QMA</h1>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2 hover:bg-muted rounded-xl"
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4 md:h-5 md:w-5" />
                ) : (
                  <Sun className="h-4 w-4 md:h-5 md:w-5" />
                )}
              </Button>
              
              <Button variant="ghost" size="sm" className="p-2 hover:bg-muted rounded-xl">
                <Bell className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-card-foreground">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.school}
                </p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="flex items-center bg-destructive/10 border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-xl text-xs md:text-sm"
              >
                <LogOut className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">{t.logout}</span>
                <span className="sm:hidden">Exit</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-card-foreground mb-2">
            {t.welcome}, {user.name}
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            {new Date().toLocaleDateString(language === 'en' ? 'en-IN' : 'hi-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="p-4 md:p-6 bg-card border-border rounded-2xl shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center">
              <div className="p-2 md:p-3 bg-primary/10 rounded-xl mb-2 sm:mb-0">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div className="sm:ml-4">
                <p className="text-xs md:text-sm text-muted-foreground">{t.totalStudents}</p>
                <p className="text-lg md:text-2xl font-bold text-card-foreground">{todayStats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6 bg-card border-border rounded-2xl shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center">
              <div className="p-2 md:p-3 bg-chart-1/10 rounded-xl mb-2 sm:mb-0">
                <UserCheck className="h-5 w-5 md:h-6 md:w-6 text-chart-1" />
              </div>
              <div className="sm:ml-4">
                <p className="text-xs md:text-sm text-muted-foreground">{t.present}</p>
                <p className="text-lg md:text-2xl font-bold text-card-foreground">{todayStats.present}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6 bg-card border-border rounded-2xl shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center">
              <div className="p-2 md:p-3 bg-destructive/10 rounded-xl mb-2 sm:mb-0">
                <AlertTriangle className="h-5 w-5 md:h-6 md:w-6 text-destructive" />
              </div>
              <div className="sm:ml-4">
                <p className="text-xs md:text-sm text-muted-foreground">{t.absent}</p>
                <p className="text-lg md:text-2xl font-bold text-card-foreground">{todayStats.absent}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 md:p-6 bg-card border-border rounded-2xl shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center">
              <div className="p-2 md:p-3 bg-chart-3/10 rounded-xl mb-2 sm:mb-0">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-chart-3" />
              </div>
              <div className="sm:ml-4">
                <p className="text-xs md:text-sm text-muted-foreground">{t.attendanceRate}</p>
                <p className="text-lg md:text-2xl font-bold text-card-foreground">{todayStats.rate}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 md:mb-8">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">{t.quickActions}</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Button 
              onClick={() => openModal('markAttendance')}
              className="h-14 md:h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl flex flex-col items-center justify-center space-y-1 shadow-lg text-xs md:text-sm"
            >
              <UserCheck className="h-5 w-5 md:h-6 md:w-6" />
              <span>{t.markAttendance}</span>
            </Button>
            <Button 
              onClick={() => openModal('addStudent')}
              className="h-14 md:h-16 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-2xl flex flex-col items-center justify-center space-y-1 shadow-lg text-xs md:text-sm"
            >
              <Plus className="h-5 w-5 md:h-6 md:w-6" />
              <span>{t.addStudent}</span>
            </Button>
            <Button 
              onClick={() => openModal('addClass')}
              className="h-14 md:h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex flex-col items-center justify-center space-y-1 shadow-lg text-xs md:text-sm"
            >
              <BookOpen className="h-5 w-5 md:h-6 md:w-6" />
              <span>{t.addClass}</span>
            </Button>
            <Button 
              onClick={() => openModal('sendNotification')}
              className="h-14 md:h-16 bg-accent hover:bg-accent/90 text-accent-foreground rounded-2xl flex flex-col items-center justify-center space-y-1 shadow-lg text-xs md:text-sm"
            >
              <Bell className="h-5 w-5 md:h-6 md:w-6" />
              <span>{t.sendNotifications}</span>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-3 md:gap-4 mt-3 md:mt-4">
            <Button 
              onClick={() => openModal('viewReports')}
              className="h-14 md:h-16 bg-chart-2/20 hover:bg-chart-2/30 text-chart-2 rounded-2xl flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 shadow-lg text-xs md:text-sm"
            >
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />
              <span>{t.viewReports}</span>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-border">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-1 border-b-2 font-medium text-sm rounded-t-lg ${
                  activeTab === 'overview'
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-card-foreground hover:bg-muted/50'
                }`}
              >
                {t.dashboard}
              </button>
              <button
                onClick={() => setActiveTab('classes')}
                className={`py-3 px-1 border-b-2 font-medium text-sm rounded-t-lg ${
                  activeTab === 'classes'
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-card-foreground hover:bg-muted/50'
                }`}
              >
                {t.classes}
              </button>
              <button
                onClick={() => setActiveTab('timetable')}
                className={`py-3 px-1 border-b-2 font-medium text-sm rounded-t-lg ${
                  activeTab === 'timetable'
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-card-foreground hover:bg-muted/50'
                }`}
              >
                {t.timetable}
              </button>
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`py-3 px-1 border-b-2 font-medium text-sm rounded-t-lg ${
                  activeTab === 'suggestions'
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-card-foreground hover:bg-muted/50'
                }`}
              >
                {t.aiSuggestions}
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <AttendanceStats language={language} />
            <AiSuggestions 
              language={language} 
              onViewAll={() => setActiveTab('suggestions')}
            />
          </div>
        )}
        {activeTab === 'classes' && (
          <ClassList language={language} />
        )}
        {activeTab === 'timetable' && (
          <div className="space-y-6">
            <Card className="p-6 bg-card border-border rounded-2xl shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-card-foreground">{t.timetable}</h2>
                    <p className="text-sm text-muted-foreground">Your weekly teaching schedule</p>
                  </div>
                </div>
              </div>
              
              {timetable.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No schedule assigned</p>
                  <p className="text-sm">Contact the admin to set up your teaching schedule</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((dayName, dayIndex) => {
                    const dayNum = dayIndex === 6 ? 0 : dayIndex + 1; // Convert to 0-6 format
                    const daySchedule = timetable
                      .filter(entry => entry.day_of_week === dayNum)
                      .sort((a, b) => a.start_time.localeCompare(b.start_time));
                    
                    if (daySchedule.length === 0) return null;
                    
                    return (
                      <div key={dayName} className="border border-border rounded-lg p-4">
                        <h3 className="font-semibold text-card-foreground mb-3 flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-primary" />
                          {dayName}
                        </h3>
                        <div className="space-y-2">
                          {daySchedule.map((entry) => {
                            const classInfo = classes.find(c => c.id === entry.class_id);
                            return (
                              <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center space-x-4">
                                  <div className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                                    {entry.start_time} - {entry.end_time}
                                  </div>
                                  <div>
                                    <div className="font-medium text-card-foreground">{entry.subject}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {classInfo ? `${classInfo.grade} - ${classInfo.section}` : 'Class TBD'}
                                      {entry.room && ` • ${entry.room}`}
                                    </div>
                                  </div>
                                </div>
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
            
            {/* Today's Schedule Quick View */}
            <Card className="p-6 bg-card border-border rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center">
                <Clock className="h-5 w-5 text-primary mr-2" />
                Today's Classes
              </h3>
              {(() => {
                const today = new Date().getDay();
                const todaySchedule = timetable
                  .filter(entry => entry.day_of_week === today)
                  .sort((a, b) => a.start_time.localeCompare(b.start_time));
                
                if (todaySchedule.length === 0) {
                  return (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{t.noSchedule}</p>
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-3">
                    {todaySchedule.map((entry) => {
                      const classInfo = classes.find(c => c.id === entry.class_id);
                      return (
                        <div key={entry.id} className="flex items-center p-4 bg-primary/5 rounded-xl border border-primary/20">
                          <div className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-lg">
                            {entry.start_time} - {entry.end_time}
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="font-medium text-card-foreground">{entry.subject}</div>
                            <div className="text-sm text-muted-foreground">
                              {classInfo ? `${classInfo.grade} - ${classInfo.section}` : 'Class TBD'}
                              {entry.room && ` • ${entry.room}`}
                            </div>
                          </div>
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </Card>
          </div>
        )}
        {activeTab === 'suggestions' && (
          <AiSuggestions language={language} expanded />
        )}
      </main>

      {/* Modals */}
      <MarkAttendanceModal
        isOpen={modals.markAttendance}
        onClose={() => closeModal('markAttendance')}
        language={language}
      />
      <AddStudentModal
        isOpen={modals.addStudent}
        onClose={() => closeModal('addStudent')}
        language={language}
      />
      <AddClassModal
        isOpen={modals.addClass}
        onClose={() => closeModal('addClass')}
        language={language}
      />
      <SendNotificationModal
        isOpen={modals.sendNotification}
        onClose={() => closeModal('sendNotification')}
        language={language}
      />
      <ViewReportsModal
        isOpen={modals.viewReports}
        onClose={() => closeModal('viewReports')}
        language={language}
      />
    </div>
  );
}