import React, { useState, useEffect } from 'react';
import { 
  LogOut, 
  Moon, 
  Sun, 
  Calendar, 
  TrendingUp, 
  Bell,
  BookOpen,
  Clock,
  UserCheck,
  AlertTriangle,
  Award,
  Target,
  Users,
  MapPin,
  QrCode,
  Scan
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useTheme } from './ThemeProvider';
import { DataService } from '@/lib/data-service';
import { StudentAISuggestions } from './StudentAISuggestions';
import type { TimetableEntry } from '@/lib/local-db';

interface StudentDashboardProps {
  user: any;
  language: 'en' | 'hi';
  onLogout: () => void;
}

const translations = {
  en: {
    dashboard: 'My Dashboard',
    welcome: 'Welcome',
    myAttendance: 'My Attendance',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    overall: 'Overall',
    present: 'Present',
    absent: 'Absent',
    late: 'Late',
    attendanceRate: 'Attendance Rate',
    schedule: 'Today\'s Schedule',
    achievements: 'Achievements',
    goals: 'Goals',
    announcements: 'Announcements',
    logout: 'Logout',
    daysPresent: 'Days Present',
    perfectWeek: 'Perfect Week',
    earlyBird: 'Early Bird',
    consistent: 'Consistent Learner',
    viewMore: 'View More',
    noClasses: 'No classes scheduled',
    upcomingEvents: 'Upcoming Events',
    aiSuggestions: 'AI Suggestions',
    personalizedTips: 'Personalized Tips for Better Attendance'
  },
  hi: {
    dashboard: 'मेरा डैशबोर्ड',
    welcome: 'स्वागत',
    myAttendance: 'मेरी उपस्थिति',
    thisWeek: 'इस सप्ताह',
    thisMonth: 'इस महीने',
    overall: 'कुल मिलाकर',
    present: 'उपस्थित',
    absent: 'अनुपस्थित',
    late: 'देरी',
    attendanceRate: 'उपस्थिति दर',
    schedule: 'आज का समय-सारणी',
    achievements: 'उपलब्धियां',
    goals: 'लक्ष्य',
    announcements: 'घोषणाएं',
    logout: 'लॉगआउट',
    daysPresent: 'उपस्थित दिन',
    perfectWeek: 'पूर्ण सप्ताह',
    earlyBird: 'जल्दी आने वाला',
    consistent: 'नियमित छात्र',
    viewMore: 'और देखें',
    noClasses: 'कोई कक्षा निर्धारित नहीं',
    upcomingEvents: 'आगामी कार्यक्रम',
    aiSuggestions: 'AI सुझाव',
    personalizedTips: 'बेहतर उपस्थिति के लिए व्यक्तिगत सुझाव'
  }
};

export function StudentDashboard({ user, language, onLogout }: StudentDashboardProps) {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const t = translations[language];

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (isScannerOpen) {
      setTimeout(() => {
        const element = document.getElementById('student-qr-reader');
        if (element) {
          scanner = new Html5QrcodeScanner(
            "student-qr-reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
          );
          
          scanner.render((decodedText) => {
            try {
              const data = JSON.parse(decodedText);
              if (data && data.classId) {
                // Here we would normally make an API call to mark attendance
                toast.success(language === 'en' ? 'Attendance marked successfully!' : 'उपस्थिति सफलतापूर्वक दर्ज की गई!');
                setIsScannerOpen(false);
              }
            } catch (e) {
              console.error("Invalid QR Code", e);
            }
          }, undefined);
        }
      }, 100);
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [isScannerOpen, language]);

  useEffect(() => {
    loadTimetable();
  }, [user]);

  const loadTimetable = async () => {
    try {
      // Get student's class ID (assuming it's stored in user.class_id)
      if (user.class_id) {
        const classSchedule = await DataService.getTimetable(user.class_id);
        setTimetable(classSchedule);
        
        // Load teachers to get names
        const allTeachers = await DataService.getTeachers();
        setTeachers(allTeachers);
      }
    } catch (error) {
      console.error('Failed to load timetable:', error);
    }
  };

  const attendanceStats = {
    week: { present: 4, absent: 1, rate: 80 },
    month: { present: 18, absent: 2, rate: 90 },
    overall: { present: 142, absent: 8, rate: 95 }
  };

  // Get today's schedule from timetable
  const today = new Date().getDay(); // 0-6 (Sunday-Saturday)
  const todaySchedule = timetable
    .filter(entry => entry.day_of_week === today)
    .sort((a, b) => a.start_time.localeCompare(b.start_time))
    .map(entry => {
      const teacher = teachers.find(t => t.id === entry.teacher_id);
      return {
        time: `${entry.start_time} - ${entry.end_time}`,
        subject: entry.subject,
        teacher: teacher ? `${teacher.first_name} ${teacher.last_name}` : 'TBD',
        room: entry.room || 'TBD'
      };
    });

  const achievements = [
    { name: t.perfectWeek, icon: Award, earned: true, color: 'text-chart-1' },
    { name: t.earlyBird, icon: Clock, earned: true, color: 'text-chart-3' },
    { name: t.consistent, icon: Target, earned: false, color: 'text-muted-foreground' }
  ];

  const announcements = [
    {
      title: language === 'en' ? 'Sports Day - Next Friday' : 'खेल दिवस - अगले शुक्रवार',
      description: language === 'en' ? 'Annual sports day celebration' : 'वार्षिक खेल दिवस उत्सव',
      time: '2 hours ago'
    },
    {
      title: language === 'en' ? 'Parent Teacher Meeting' : 'अभिभावक शिक्षक बैठक',
      description: language === 'en' ? 'Monthly PTM on Saturday' : 'शनिवार को मासिक PTM',
      time: '1 day ago'
    }
  ];

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
                  {user.class} - {user.school}
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
            {user.class} • {new Date().toLocaleDateString(language === 'en' ? 'en-IN' : 'hi-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Attendance Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
          <Card className="p-4 md:p-6 bg-card border-border rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h3 className="text-sm md:text-base font-semibold text-card-foreground">{t.thisWeek}</h3>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs md:text-sm text-muted-foreground">{t.present}</span>
                <span className="text-sm md:text-base font-medium text-chart-1">{attendanceStats.week.present}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs md:text-sm text-muted-foreground">{t.absent}</span>
                <span className="text-sm md:text-base font-medium text-destructive">{attendanceStats.week.absent}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-3">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${attendanceStats.week.rate}%` }}
                ></div>
              </div>
              <p className="text-center text-base md:text-lg font-bold text-primary mt-2">
                {attendanceStats.week.rate}%
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">{t.thisMonth}</h3>
              <div className="p-2 bg-chart-1/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-chart-1" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t.present}</span>
                <span className="font-medium text-chart-1">{attendanceStats.month.present}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t.absent}</span>
                <span className="font-medium text-destructive">{attendanceStats.month.absent}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-3">
                <div 
                  className="bg-chart-1 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${attendanceStats.month.rate}%` }}
                ></div>
              </div>
              <p className="text-center text-lg font-bold text-chart-1 mt-2">
                {attendanceStats.month.rate}%
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-card border-border rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-card-foreground">{t.overall}</h3>
              <div className="p-2 bg-chart-3/10 rounded-lg">
                <Target className="h-5 w-5 text-chart-3" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t.present}</span>
                <span className="font-medium text-chart-1">{attendanceStats.overall.present}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t.absent}</span>
                <span className="font-medium text-destructive">{attendanceStats.overall.absent}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-3">
                <div 
                  className="bg-chart-3 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${attendanceStats.overall.rate}%` }}
                ></div>
              </div>
              <p className="text-center text-lg font-bold text-chart-3 mt-2">
                {attendanceStats.overall.rate}%
              </p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <Card className="p-4 md:p-6 bg-card border-border rounded-2xl shadow-lg">
              <h3 className="text-base md:text-lg font-semibold text-card-foreground mb-4 flex items-center">
                <Clock className="h-4 w-4 md:h-5 md:w-5 text-primary mr-2" />
                {t.schedule}
              </h3>
              <div className="space-y-3 md:space-y-4">
                {todaySchedule.length === 0 ? (
                  <div className="text-center py-6 md:py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t.noClasses}</p>
                  </div>
                ) : (
                  todaySchedule.map((item, index) => (
                    <div key={index} className="flex items-center p-4 bg-muted/50 rounded-xl">
                      <div className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-lg">
                        {item.time}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="font-medium text-card-foreground">{item.subject}</div>
                        <div className="text-sm text-muted-foreground flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {item.teacher}
                          <MapPin className="h-3 w-3 ml-3 mr-1" />
                          {item.room}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* AI Suggestions for Students */}
            <StudentAISuggestions
              studentId={user.id || 1}
              classId={user.class_id || 1}
              language={language}
            />

            {/* Achievements */}
            {/* Mark Attendance via QR Code */}
            <Card className="p-6 bg-card border-border rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center">
                <Scan className="h-5 w-5 text-primary mr-2" />
                {language === 'en' ? 'Mark Attendance' : 'उपस्थिति दर्ज करें'}
              </h3>
              
              {!isScannerOpen ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="p-6 bg-primary/10 rounded-full text-primary mb-2">
                    <QrCode className="h-12 w-12" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    {language === 'en' ? 'Scan the QR code shown by your teacher to mark your attendance for today.' : 'आज की उपस्थिति दर्ज करने के लिए अपने शिक्षक द्वारा दिखाए गए क्यूआर कोड को स्कैन करें।'}
                  </p>
                  <Button 
                    onClick={() => setIsScannerOpen(true)}
                    className="w-full"
                  >
                    <Scan className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Scan QR Code' : 'क्यूआर कोड स्कैन करें'}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div id="student-qr-reader" className="w-full max-w-sm rounded-lg overflow-hidden border border-border bg-card"></div>
                  <Button 
                    variant="outline"
                    onClick={() => setIsScannerOpen(false)}
                    className="w-full"
                  >
                    {language === 'en' ? 'Cancel' : 'रद्द करें'}
                  </Button>
                </div>
              )}
            </Card>

            <Card className="p-6 bg-card border-border rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center">
                <Award className="h-5 w-5 text-chart-3 mr-2" />
                {t.achievements}
              </h3>
              <div className="space-y-3">
                {achievements.map((achievement, index) => {
                  const IconComponent = achievement.icon;
                  return (
                    <div key={index} className="flex items-center p-3 bg-muted/30 rounded-xl">
                      <div className={`p-2 rounded-lg ${achievement.earned ? 'bg-chart-3/10' : 'bg-muted'}`}>
                        <IconComponent className={`h-4 w-4 ${achievement.earned ? achievement.color : 'text-muted-foreground'}`} />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className={`text-sm font-medium ${achievement.earned ? 'text-card-foreground' : 'text-muted-foreground'}`}>
                          {achievement.name}
                        </div>
                      </div>
                      {achievement.earned && (
                        <Badge className="bg-chart-3/10 text-chart-3 text-xs">
                          ✓
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Announcements */}
            <Card className="p-6 bg-card border-border rounded-2xl shadow-lg">
              <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center">
                <Bell className="h-5 w-5 text-primary mr-2" />
                {t.announcements}
              </h3>
              <div className="space-y-4">
                {announcements.map((announcement, index) => (
                  <div key={index} className="p-4 bg-muted/30 rounded-xl">
                    <h4 className="font-medium text-card-foreground text-sm mb-1">
                      {announcement.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {announcement.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {announcement.time}
                    </p>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-primary hover:bg-primary/10">
                {t.viewMore}
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}