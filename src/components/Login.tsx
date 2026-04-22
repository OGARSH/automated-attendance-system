import React, { useState } from 'react';
import { signInWithGoogle } from '@/lib/firebase';
import { GraduationCap, ArrowLeft, Moon, Sun, User, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from './ThemeProvider';

interface LoginProps {
  language: 'en' | 'hi';
  userType: 'teacher' | 'student';
  onLogin: (userData: any) => void;
  onGoBack: () => void;
}

const translations = {
  en: {
    teacherLogin: 'Teacher Login',
    studentLogin: 'Student Login',
    subtitle: 'Quickmark Attendance System',
    signInWithGoogle: 'Sign in with Google',
    signingIn: 'Signing in...',
    loginFailed: 'Login failed. Please try again.',
    popupBlocked: 'Pop-up was blocked. Please allow pop-ups for this site.',
    or: 'Sign in to continue'
  },
  hi: {
    teacherLogin: 'शिक्षक लॉगिन',
    studentLogin: 'छात्र लॉगिन',
    subtitle: 'क्विकमार्क उपस्थिति प्रणाली',
    signInWithGoogle: 'Google से साइन इन करें',
    signingIn: 'साइन इन हो रहा है...',
    loginFailed: 'लॉगिन विफल। कृपया पुनः प्रयास करें।',
    popupBlocked: 'पॉप-अप ब्लॉक किया गया। कृपया इस साइट के लिए पॉप-अप की अनुमति दें।',
    or: 'जारी रखने के लिए साइन इन करें'
  }
};

// Google "G" logo SVG component
function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function Login({ language, userType, onLogin, onGoBack }: LoginProps) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const t = translations[language];

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const firebaseUser = await signInWithGoogle();
      
      const userData = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        role: userType === 'teacher' ? 'Teacher' : 'Student',
        school: language === 'en' ? 'QMA School' : 'क्यूएमए विद्यालय',
        class: userType === 'student' ? (language === 'en' ? 'Class 5B' : 'कक्षा 5ब') : undefined,
        type: userType
      };
      onLogin(userData);
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        // User closed the popup, not an error
        setError('');
      } else if (err?.code === 'auth/popup-blocked') {
        setError(t.popupBlocked);
      } else {
        setError(t.loginFailed);
      }
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
            <div className="mx-auto h-14 w-14 md:h-16 md:w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              {userType === 'teacher' ? (
                <GraduationCap className="h-7 w-7 md:h-8 md:w-8 text-primary" />
              ) : (
                <User className="h-7 w-7 md:h-8 md:w-8 text-primary" />
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-card-foreground mb-2">
              {userType === 'teacher' ? t.teacherLogin : t.studentLogin}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              {t.subtitle}
            </p>
          </div>

          <div className="space-y-5">
            {/* Instruction text */}
            <p className="text-center text-sm text-muted-foreground">
              {t.or}
            </p>

            {/* Google Sign-In Button */}
            <Button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-14 bg-card hover:bg-muted border-2 border-border text-card-foreground rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3"
              variant="outline"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                  <span className="font-medium">{t.signingIn}</span>
                </div>
              ) : (
                <>
                  <GoogleIcon />
                  <span className="font-medium text-base">{t.signInWithGoogle}</span>
                </>
              )}
            </Button>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3">
                <p className="text-destructive text-sm text-center">{error}</p>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              QMA - Quickmark Attendance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}