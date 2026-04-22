import React, { useState, useEffect } from 'react';
import { Splash } from './components/Splash';
import { LanguageSelection } from './components/LanguageSelection';
import { UserTypeSelection } from './components/UserTypeSelection';
import { Login } from './components/Login';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { ThemeProvider } from './components/ThemeProvider';
import { AdminDashboard } from './components/AdminDashboard';
import { Toaster } from './components/ui/sonner';

type Language = 'en' | 'hi';
type UserType = 'teacher' | 'student';
type Screen = 'splash' | 'language' | 'userType' | 'login' | 'dashboard' | 'admin';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [language, setLanguage] = useState<Language>('en');
  const [userType, setUserType] = useState<UserType>('teacher');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Auto-advance from splash screen after 3 seconds
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        setCurrentScreen('language');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setCurrentScreen('userType');
  };

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setCurrentScreen('login');
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('language');
  };

  const handleGoBack = () => {
    switch (currentScreen) {
      case 'userType':
        setCurrentScreen('language');
        break;
      case 'login':
        setCurrentScreen('userType');
        break;
      case 'admin':
        setCurrentScreen('language');
        break;
      default:
        break;
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <Toaster />
        {currentScreen === 'splash' && <Splash />}
        {currentScreen === 'language' && (
          <LanguageSelection onSelectLanguage={handleLanguageSelect} />
        )}
        {currentScreen === 'userType' && (
          <UserTypeSelection 
            language={language} 
            onSelectUserType={handleUserTypeSelect}
            onGoBack={handleGoBack}
            onOpenAdmin={() => setCurrentScreen('admin')}
          />
        )}
        {currentScreen === 'login' && (
          <Login 
            language={language} 
            userType={userType}
            onLogin={handleLogin}
            onGoBack={handleGoBack}
          />
        )}
        {currentScreen === 'admin' && (
          <AdminDashboard onExit={() => setCurrentScreen('language')} />
        )}
        {currentScreen === 'dashboard' && userType === 'teacher' && (
          <TeacherDashboard 
            user={user} 
            language={language} 
            onLogout={handleLogout} 
          />
        )}
        {currentScreen === 'dashboard' && userType === 'student' && (
          <StudentDashboard 
            user={user} 
            language={language} 
            onLogout={handleLogout} 
          />
        )}
      </div>
    </ThemeProvider>
  );
}