import React from 'react';
import { Globe, ArrowRight, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from './ThemeProvider';

interface LanguageSelectionProps {
  onSelectLanguage: (language: 'en' | 'hi') => void;
}

export function LanguageSelection({ onSelectLanguage }: LanguageSelectionProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/30 to-accent/20 flex flex-col p-4">
      {/* Header with theme toggle */}
      <div className="flex justify-end mb-4">
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
              <Globe className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-card-foreground mb-2">
              Select Language
            </h1>
            <p className="text-muted-foreground">
              भाषा चुनें
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => onSelectLanguage('en')}
              className="w-full h-16 text-lg bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl flex items-center justify-between px-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span>English</span>
              <ArrowRight className="h-6 w-6" />
            </Button>

            <Button
              onClick={() => onSelectLanguage('hi')}
              className="w-full h-16 text-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-2xl flex items-center justify-between px-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span>हिंदी</span>
              <ArrowRight className="h-6 w-6" />
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