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
import { onAuthChange, logOut } from './lib/firebase';

type Language = 'en' | 'hi';
type UserType = 'teacher' | 'student';
type Screen = 'splash' | 'language' | 'userType' | 'login' | 'dashboard' | 'admin';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [language, setLanguage] = useState<Language>('en');
  const [userType, setUserType] = useState<UserType>('teacher');
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Auto-advance from splash screen after 3 seconds
    if (currentScreen === 'splash') {
      const timer = setTimeout(() => {
        if (authChecked && user) {
          setCurrentScreen('dashboard');
        } else {
          setCurrentScreen('language');
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, authChecked, user]);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        // Restore session from localStorage
        const savedUserData = localStorage.getItem('qma_user_data');
        if (savedUserData) {
          try {
            const parsed = JSON.parse(savedUserData);
            setUser(parsed);
            setUserType(parsed.type || 'teacher');
          } catch {
            // Invalid stored data, clear it
            localStorage.removeItem('qma_user_data');
          }
        }
      } else {
        setUser(null);
        localStorage.removeItem('qma_user_data');
      }
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

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
    localStorage.setItem('qma_user_data', JSON.stringify(userData));
    setCurrentScreen('dashboard');
  };

  const handleLogout = async () => {
    try {
      await logOut();
    } catch {
      // Even if Firebase logout fails, clear local state
    }
    setUser(null);
    localStorage.removeItem('qma_user_data');
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