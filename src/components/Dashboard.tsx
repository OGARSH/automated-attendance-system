import React, { useState } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useTheme } from './ThemeProvider';
import { AttendanceStats } from './AttendanceStats';
import { ClassList } from './ClassList';
import { AiSuggestions } from './AiSuggestions';

interface DashboardProps {
  user: any;
  language: 'en' | 'mr';
  onLogout: () => void;
}

const translations = {
  en: {
    dashboard: 'Dashboard',
    welcome: 'Welcome',
    todayAttendance: "Today's Attendance",
    totalStudents: 'Total Students',
    present: 'Present',
    absent: 'Absent',
    attendanceRate: 'Attendance Rate',
    classes: 'Classes',
    aiSuggestions: 'AI Suggestions',
    notifications: 'Notifications',
    quickActions: 'Quick Actions',
    markAttendance: 'Mark Attendance',
    viewReports: 'View Reports',
    logout: 'Logout'
  },
  mr: {
    dashboard: 'डॅशबोर्ड',
    welcome: 'स्वागत',
    todayAttendance: 'आजची उपस्थिती',
    totalStudents: 'एकूण विद्यार्थी',
    present: 'उपस्थित',
    absent: 'अनुपस्थित',
    attendanceRate: 'उपस्थिती दर',
    classes: 'वर्ग',
    aiSuggestions: 'AI सूचना',
    notifications: 'सूचना',
    quickActions: 'त्वरित क्रिया',
    markAttendance: 'उपस्थिती चिन्हांकित करा',
    viewReports: 'अहवाल पहा',
    logout: 'लॉगआउट'
  }
};

export function Dashboard({ user, language, onLogout }: DashboardProps) {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const t = translations[language];

  const todayStats = {
    total: 145,
    present: 132,
    absent: 13,
    rate: 91
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">QMA</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="p-2"
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </Button>
              
              <Button variant="ghost" size="sm" className="p-2">
                <Bell className="h-5 w-5" />
              </Button>
              
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.school}
                </p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {t.logout}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t.welcome}, {user.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {new Date().toLocaleDateString(language === 'en' ? 'en-IN' : 'mr-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-white dark:bg-gray-800">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.totalStudents}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayStats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-800">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.present}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayStats.present}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-800">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.absent}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayStats.absent}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-gray-800">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.attendanceRate}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayStats.rate}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {t.dashboard}
              </button>
              <button
                onClick={() => setActiveTab('classes')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'classes'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {t.classes}
              </button>
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'suggestions'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {t.aiSuggestions}
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {activeTab === 'overview' && (
            <>
              <div className="lg:col-span-2">
                <AttendanceStats language={language} />
              </div>
              <div>
                <AiSuggestions language={language} />
              </div>
            </>
          )}
          {activeTab === 'classes' && (
            <div className="lg:col-span-3">
              <ClassList language={language} />
            </div>
          )}
          {activeTab === 'suggestions' && (
            <div className="lg:col-span-3">
              <AiSuggestions language={language} expanded />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}