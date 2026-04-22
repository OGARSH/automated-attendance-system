import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { StudentAIService, StudentAISuggestion } from '../lib/student-ai-service';
import { 
  Brain, 
  TrendingUp,
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Heart,
  Star,
  Target,
  BookOpen,
  Lightbulb,
  ChevronRight,
  ChevronDown,
  RefreshCw
} from 'lucide-react';

interface StudentAISuggestionsProps {
  studentId: number;
  classId: number;
  language: 'en' | 'hi';
  expanded?: boolean;
  onViewAll?: () => void;
}

const iconMap = {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Heart,
  Star,
  Target,
  BookOpen,
  Lightbulb
};

const translations = {
  en: {
    aiSuggestions: 'AI Suggestions for You',
    personalizedTips: 'Personalized Tips',
    attendanceGoals: 'Attendance Goals',
    viewAll: 'View All',
    showTips: 'Show Tips',
    hideTips: 'Hide Tips',
    refresh: 'Refresh',
    priority: 'Priority',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    loading: 'Analyzing your attendance pattern...',
    noSuggestions: 'Great job! Keep up your excellent attendance.',
    basedOnData: 'Based on your attendance pattern and academic goals',
    tipFor: 'Tips for',
    progress: 'Progress',
    target: 'Target',
    current: 'Current',
    daysUntilTarget: 'days until target',
    keepItUp: 'Keep it up!',
    almostThere: 'Almost there!',
    needsAttention: 'Needs attention'
  },
  hi: {
    aiSuggestions: 'आपके लिए AI सुझाव',
    personalizedTips: 'व्यक्तिगत सुझाव',
    attendanceGoals: 'उपस्थिति लक्ष्य',
    viewAll: 'सभी देखें',
    showTips: 'सुझाव दिखाएं',
    hideTips: 'सुझाव छुपाएं',
    refresh: 'रीफ्रेश',
    priority: 'प्राथमिकता',
    high: 'उच्च',
    medium: 'मध्यम',
    low: 'कम',
    loading: 'आपकी उपस्थिति पैटर्न का विश्लेषण कर रहे हैं...',
    noSuggestions: 'बेहतरीन काम! अपनी उत्कृष्ट उपस्थिति बनाए रखें।',
    basedOnData: 'आपकी उपस्थिति पैटर्न और शैक्षणिक लक्ष्यों के आधार पर',
    tipFor: 'के लिए सुझाव',
    progress: 'प्रगति',
    target: 'लक्ष्य',
    current: 'वर्तमान',
    daysUntilTarget: 'लक्ष्य तक दिन',
    keepItUp: 'इसे जारी रखें!',
    almostThere: 'लगभग वहाँ!',
    needsAttention: 'ध्यान देने की जरूरत है'
  }
};

export function StudentAISuggestions({ 
  studentId, 
  classId, 
  language, 
  expanded = false, 
  onViewAll 
}: StudentAISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<StudentAISuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTips, setExpandedTips] = useState<number[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  const t = translations[language];

  useEffect(() => {
    loadSuggestions();
  }, [studentId, classId, language]);

  const loadSuggestions = async () => {
    setLoading(true);
    try {
      const newSuggestions = await StudentAIService.generateStudentSuggestions(
        studentId, 
        classId, 
        language
      );
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Failed to load student AI suggestions:', error);
    }
    setLoading(false);
  };

  const refreshSuggestions = async () => {
    setRefreshing(true);
    await loadSuggestions();
    setRefreshing(false);
  };

  const toggleTips = (suggestionId: number) => {
    setExpandedTips(prev => 
      prev.includes(suggestionId)
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressStatus = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 95) return { status: t.keepItUp, color: 'text-green-600' };
    if (percentage >= 80) return { status: t.almostThere, color: 'text-blue-600' };
    return { status: t.needsAttention, color: 'text-red-600' };
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap] || Brain;
    return IconComponent;
  };

  if (loading) {
    return (
      <Card className="p-6 bg-card border-border rounded-2xl shadow-lg">
        <div className="flex items-center justify-center space-x-3">
          <Brain className="h-6 w-6 text-primary animate-pulse" />
          <span className="text-muted-foreground">{t.loading}</span>
        </div>
      </Card>
    );
  }

  const displaySuggestions = expanded ? suggestions : suggestions.slice(0, 3);

  return (
    <Card className="p-6 bg-card border-border rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <Brain className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">{t.aiSuggestions}</h3>
            <p className="text-sm text-muted-foreground">{t.basedOnData}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshSuggestions}
            disabled={refreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          {!expanded && onViewAll && suggestions.length > 3 && (
            <Button variant="outline" size="sm" onClick={onViewAll}>
              {t.viewAll}
            </Button>
          )}
        </div>
      </div>

      {suggestions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
          <p>{t.noSuggestions}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displaySuggestions.map((suggestion) => {
            const IconComponent = getIcon(suggestion.icon);
            const isExpanded = expandedTips.includes(suggestion.id);
            
            return (
              <div key={suggestion.id} className={`rounded-xl border-2 transition-all duration-200 ${suggestion.bgColor} border-opacity-20`}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg ${suggestion.bgColor}`}>
                        <IconComponent className={`h-5 w-5 ${suggestion.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-card-foreground">
                            {suggestion.title[language]}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(suggestion.priority)}`}
                          >
                            {t[suggestion.priority as keyof typeof t]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {suggestion.description[language]}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar for Attendance Goals */}
                  {suggestion.progress && (
                    <div className="mb-4 p-3 bg-white/50 dark:bg-black/10 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-card-foreground">
                          {t.progress}: {suggestion.progress.current}{suggestion.progress.unit}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {t.target}: {suggestion.progress.target}{suggestion.progress.unit}
                        </span>
                      </div>
                      <Progress 
                        value={(suggestion.progress.current / suggestion.progress.target) * 100} 
                        className="h-2"
                      />
                      <div className={`text-xs mt-1 ${getProgressStatus(suggestion.progress.current, suggestion.progress.target).color}`}>
                        {getProgressStatus(suggestion.progress.current, suggestion.progress.target).status}
                      </div>
                    </div>
                  )}

                  {/* Actionable Tips */}
                  {suggestion.tips && suggestion.actionable && (
                    <div className="mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTips(suggestion.id)}
                        className="h-8 text-xs font-medium text-primary hover:text-primary/80"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronDown className="h-3 w-3 mr-1" />
                            {t.hideTips}
                          </>
                        ) : (
                          <>
                            <ChevronRight className="h-3 w-3 mr-1" />
                            {t.showTips}
                          </>
                        )}
                      </Button>
                      
                      {isExpanded && (
                        <div className="mt-3 space-y-2">
                          <h5 className="text-sm font-medium text-card-foreground mb-2">
                            💡 {t.tipFor} {suggestion.category}:
                          </h5>
                          <ul className="space-y-1">
                            {suggestion.tips[language]?.map((tip, index) => (
                              <li key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
                                <span className="text-primary mt-1">•</span>
                                <span className="leading-relaxed">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}