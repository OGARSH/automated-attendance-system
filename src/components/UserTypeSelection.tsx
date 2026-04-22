import React from 'react';
import { User, GraduationCap, ArrowRight, ArrowLeft, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from './ThemeProvider';

interface UserTypeSelectionProps {
  language: 'en' | 'hi';
  onSelectUserType: (userType: 'teacher' | 'student') => void;
  onGoBack: () => void;
  onOpenAdmin?: () => void;
}

const translations = {
  en: {
    title: 'Who are you?',
    subtitle: 'Select your account type',
    teacher: 'Teacher',
    student: 'Student',
    teacherDesc: 'Manage classes and mark attendance',
    studentDesc: 'View your attendance and schedule'
  },
  hi: {
    title: 'आप कौन हैं?',
    subtitle: 'अपना खाता प्रकार चुनें',
    teacher: 'शिक्षक',
    student: 'छात्र',
    teacherDesc: 'कक्षाओं का प्रबंधन करें और उपस्थिति चिह्नित करें',
    studentDesc: 'अपनी उपस्थिति और समय सारणी देखें'
  }
};

export function UserTypeSelection({ language, onSelectUserType, onGoBack, onOpenAdmin }: UserTypeSelectionProps) {
  const t = translations[language];
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 to-accent/20 flex flex-col p-4">
      {/* Header with navigation buttons */}
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onGoBack}
          className="p-3 hover:bg-card/80 rounded-xl backdrop-blur-sm shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="p-3 hover:bg-card/80 rounded-xl backdrop-blur-sm shadow-sm"
        >
          {theme === 'light' ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-card rounded-3xl shadow-2xl p-8 w-full max-w-md border border-border">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-card-foreground mb-2">
              {t.title}
            </h1>
            <p className="text-muted-foreground">
              {t.subtitle}
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => onSelectUserType('teacher')}
              className="w-full h-20 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl flex items-center justify-between px-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary-foreground/20 rounded-xl">
                  <GraduationCap className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-lg">{t.teacher}</div>
                  <div className="text-sm opacity-90">{t.teacherDesc}</div>
                </div>
              </div>
              <ArrowRight className="h-6 w-6" />
            </Button>

            <Button
              onClick={() => onSelectUserType('student')}
              className="w-full h-20 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-2xl flex items-center justify-between px-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-secondary-foreground/20 rounded-xl">
                  <User className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-lg">{t.student}</div>
                  <div className="text-sm opacity-90">{t.studentDesc}</div>
                </div>
              </div>
              <ArrowRight className="h-6 w-6" />
            </Button>

            <Button
              onClick={() => onOpenAdmin && onOpenAdmin()}
              variant="outline"
              className="w-full h-12 rounded-2xl"
            >
              Admin
            </Button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              QMA - Quickmark Attendance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}