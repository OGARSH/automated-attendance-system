import React, { useState } from 'react';
import { LocalAuth } from '@/lib/auth-local';
import { UserCheck, Lock, Eye, EyeOff, User, GraduationCap, ArrowLeft, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useTheme } from './ThemeProvider';

interface LoginProps {
  language: 'en' | 'hi';
  userType: 'teacher' | 'student';
  onLogin: (userData: any) => void;
  onGoBack: () => void;
}

const translations = {
  en: {
    loginTitle: 'Login',
    teacherLogin: 'Teacher Login',
    studentLogin: 'Student Login',
    subtitle: 'Quickmark Attendance System',
    staffId: 'Staff ID',
    studentId: 'Student ID',
    password: 'Password',
    login: 'Login',
    invalidCredentials: 'Invalid ID or Password',
    enterStaffId: 'Enter your Staff ID',
    enterStudentId: 'Enter your Student ID',
    enterPassword: 'Enter your password'
  },
  hi: {
    loginTitle: 'लॉगिन',
    teacherLogin: 'शिक्षक लॉगिन',
    studentLogin: 'छात्र लॉगिन',
    subtitle: 'क्विकमार्क उपस्थिति प्रणाली',
    staffId: 'कर्मचारी आईडी',
    studentId: 'छात्र आईडी',
    password: 'पासवर्ड',
    login: 'लॉगिन',
    invalidCredentials: 'गलत आईडी या पासवर्ड',
    enterStaffId: 'अपना कर्मचारी आईडी दर्ज करें',
    enterStudentId: 'अपना छात्र आईडी दर्ज करें',
    enterPassword: 'अपना पासवर्ड दर्ज करें'
  }
};

export function Login({ language, userType, onLogin, onGoBack }: LoginProps) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const useLocal = import.meta.env.VITE_USE_LOCAL_DB === 'true';
      if (useLocal && userType === 'teacher') {
        const u = await LocalAuth.login(userId, password);
        if (u && u.role === 'teacher') {
          onLogin({ id: u.username, name: u.username, role: u.role, type: userType });
          return;
        }
        // fallthrough to demo creds if not found
      }
      // Demo login credentials
      if (userType === 'teacher' && userId === 'TEACHER001' && password === 'password123') {
        const userData = {
          id: 'TEACHER001',
          name: language === 'en' ? 'Priya Sharma' : 'प्रिया शर्मा',
          role: 'Teacher',
          school: language === 'en' ? 'Govt. Primary School, Wardha' : 'सरकारी प्राथमिक विद्यालय, वर्धा',
          type: 'teacher'
        };
        onLogin(userData);
      } else if (userType === 'student' && userId === 'STU001' && password === 'student123') {
        const userData = {
          id: 'STU001',
          name: language === 'en' ? 'Arjun Patil' : 'अर्जुन पाटिल',
          role: 'Student',
          class: language === 'en' ? 'Class 5B' : 'कक्षा 5ब',
          school: language === 'en' ? 'Govt. Primary School, Wardha' : 'सरकारी प्राथमिक विद्यालय, वर्धा',
          type: 'student'
        };
        onLogin(userData);
      } else {
        setError(t.invalidCredentials);
      }
    } catch (err) {
      setError(t.invalidCredentials);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 to-accent/20 flex flex-col p-4">
      {/* Header with navigation buttons */}
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onGoBack}
          className="p-2 md:p-3 hover:bg-card/80 rounded-xl backdrop-blur-sm shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="p-2 md:p-3 hover:bg-card/80 rounded-xl backdrop-blur-sm shadow-sm"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4 md:h-5 md:w-5" />
          ) : (
            <Sun className="h-4 w-4 md:h-5 md:w-5" />
          )}
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-card rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-md border border-border">
          <div className="text-center mb-6 md:mb-8">
            <div className="mx-auto h-12 w-12 md:h-16 md:w-16 bg-primary/10 rounded-full flex items-center justify-center mb-3 md:mb-4">
              {userType === 'teacher' ? (
                <GraduationCap className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              ) : (
                <User className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-card-foreground mb-2">
              {userType === 'teacher' ? t.teacherLogin : t.studentLogin}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              {t.subtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div>
              <Label htmlFor="userId" className="text-card-foreground text-sm md:text-base">
                {userType === 'teacher' ? t.staffId : t.studentId}
              </Label>
              <Input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={userType === 'teacher' ? t.enterStaffId : t.enterStudentId}
                className="mt-1 h-12 bg-input-background border-border rounded-xl"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-card-foreground">
                {t.password}
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.enterPassword}
                  className="h-12 pr-12 bg-input-background border-border rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-card-foreground"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                  {t.login}
                </div>
              ) : (
                t.login
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}