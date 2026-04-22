import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { AIService, AISuggestion } from '../lib/ai-service';
import { 
  Brain, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  Star,
  ArrowRight
} from 'lucide-react';

interface AiSuggestionsProps {
  language: 'en' | 'hi';
  expanded?: boolean;
  onViewAll?: () => void;
}

const translations = {
  en: {
    aiSuggestions: 'AI Suggestions',
    viewAll: 'View All',
    priority: 'Priority',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    implement: 'Implement',
    dismiss: 'Dismiss',
    basedOnData: 'Based on attendance patterns and historical data',
    loading: 'Analyzing attendance data...',
    noSuggestions: 'No suggestions available at this time.',
    aiInsights: 'AI Insights',
    aiInsightsDesc: 'The system analyzes attendance patterns, weather data, and student behavior to generate actionable insights for improving school attendance rates.'
  },
  hi: {
    aiSuggestions: 'AI सुझाव',
    viewAll: 'सभी देखें',
    priority: 'प्राथमिकता',
    high: 'उच्च',
    medium: 'मध्यम',
    low: 'कम',
    implement: 'लागू करें',
    dismiss: 'नजरअंदाज करें',
    basedOnData: 'उपस्थिति पैटर्न और ऐतिहासिक डेटा के आधार पर',
    loading: 'उपस्थिति डेटा का विश्लेषण कर रहे हैं...',
    noSuggestions: 'इस समय कोई सुझाव उपलब्ध नहीं है।',
    aiInsights: 'AI अंतर्दृष्टि',
    aiInsightsDesc: 'यह प्रणाली स्कूल की उपस्थिति दर में सुधार के लिए उपस्थिति पैटर्न, मौसम डेटा और छात्र व्यवहार का विश्लेषण करती है।'
  }
};

const iconMap = {
  'AlertTriangle': AlertTriangle,
  'Users': Users,
  'Star': Star,
  'CheckCircle': CheckCircle,
  'TrendingDown': TrendingDown,
  'Clock': Clock
};

export function AiSuggestions({ language, expanded = false, onViewAll }: AiSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const t = translations[language];

  useEffect(() => {
    loadSuggestions();
  }, [language]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const aiSuggestions = await AIService.generateSuggestions(language);
      setSuggestions(aiSuggestions);
    } catch (error) {
      console.error('Error loading AI suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleImplement = async (suggestionId: number) => {
    try {
      await AIService.implementSuggestion(suggestionId);
      // Show success message or refresh suggestions
      await loadSuggestions();
    } catch (error) {
      console.error('Error implementing suggestion:', error);
    }
  };

  const handleDismiss = async (suggestionId: number) => {
    try {
      await AIService.dismissSuggestion(suggestionId);
      // Remove suggestion from list
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    } catch (error) {
      console.error('Error dismissing suggestion:', error);
    }
  };
  
  const displayedSuggestions = expanded ? suggestions : suggestions.slice(0, 3);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
      case 'low': return 'bg-chart-1/10 text-chart-1 border-chart-1/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-card border-border rounded-2xl shadow-lg">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">{t.loading}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-card-foreground">
            {t.aiSuggestions}
          </h3>
        </div>
        {!expanded && onViewAll && suggestions.length > 3 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onViewAll}
            className="text-primary hover:text-primary/90 hover:bg-primary/10 rounded-xl"
          >
            {t.viewAll}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        {t.basedOnData}
      </p>

      {displayedSuggestions.length === 0 ? (
        <div className="text-center py-8">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t.noSuggestions}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedSuggestions.map((suggestion) => {
            const IconComponent = iconMap[suggestion.icon as keyof typeof iconMap] || AlertTriangle;
            
            return (
              <div key={suggestion.id} className="border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 ${suggestion.bgColor} rounded-xl shrink-0`}>
                    <IconComponent className={`h-5 w-5 ${suggestion.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="font-medium text-card-foreground text-sm leading-5 flex-1">
                        {suggestion.title[language]}
                      </h4>
                      <Badge className={`text-xs shrink-0 ${getPriorityColor(suggestion.priority)}`}>
                        {t[suggestion.priority as keyof typeof t]}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 leading-5">
                      {suggestion.description[language]}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {suggestion.category}
                        </span>
                        <span>Impact: {suggestion.impact}</span>
                      </div>
                      
                      {suggestion.actionable && (
                        <div className="flex space-x-2 shrink-0">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDismiss(suggestion.id)}
                            className="text-xs h-8 px-2 min-w-0 bg-card hover:bg-muted border-border rounded-lg whitespace-nowrap text-left"
                          >
                            {t.dismiss}
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleImplement(suggestion.id)}
                            className="text-xs h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
                          >
                            {t.implement}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {expanded && (
        <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-chart-2/5 rounded-xl border border-primary/10">
          <div className="flex items-center space-x-2 mb-2">
            <Brain className="h-5 w-5 text-primary" />
            <span className="font-medium text-card-foreground">
              {t.aiInsights}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {t.aiInsightsDesc}
          </p>
        </div>
      )}
    </Card>
  );
}
