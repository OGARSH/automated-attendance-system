import { DatabaseService } from './database';
import { format, subDays, getDay, startOfWeek, endOfWeek } from 'date-fns';

export interface AISuggestion {
  id: number;
  title: { en: string; hi: string };
  description: { en: string; hi: string };
  priority: 'high' | 'medium' | 'low';
  impact: string;
  category: string;
  icon: string;
  color: string;
  bgColor: string;
  data?: any; // Additional data for context
  actionable: boolean;
}

export class AIService {
  private static readonly ATTENDANCE_THRESHOLD = 85; // Below this is considered low attendance
  private static readonly CHRONIC_ABSENCE_DAYS = 3; // Missing 3+ days in a week
  private static readonly LOW_ENGAGEMENT_THRESHOLD = 75;

  static async generateSuggestions(language: 'en' | 'hi' = 'en'): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = [];
    
    try {
      // Get data for analysis
      const classes = await DatabaseService.getClasses();
      const today = format(new Date(), 'yyyy-MM-dd');
      const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
      
      // Analyze each class
      for (const classData of classes) {
        const classHistory = await DatabaseService.getClassAttendanceHistory(classData.id, 30);
        const weeklyData = await DatabaseService.getClassAttendanceHistory(classData.id, 7);
        
        // 1. Check for low attendance classes
        const lowAttendanceSuggestion = await this.analyzeLowAttendance(classData, classHistory);
        if (lowAttendanceSuggestion) suggestions.push(lowAttendanceSuggestion);
        
        // 2. Check for chronically absent students
        const chronicAbsenceSuggestion = await this.analyzeChronicAbsence(classData, weeklyData);
        if (chronicAbsenceSuggestion) suggestions.push(chronicAbsenceSuggestion);
        
        // 3. Check for day-specific patterns
        const dayPatternSuggestion = await this.analyzeDayPatterns(classData, classHistory);
        if (dayPatternSuggestion) suggestions.push(dayPatternSuggestion);
      }
      
      // 4. Generate weather-based suggestions
      const weatherSuggestion = this.generateWeatherSuggestion();
      if (weatherSuggestion) suggestions.push(weatherSuggestion);
      
      // 5. Generate reward system suggestions
      const rewardSuggestion = await this.generateRewardSuggestion();
      if (rewardSuggestion) suggestions.push(rewardSuggestion);
      
      // Sort by priority (high first) and return top 10
      return suggestions
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
        .slice(0, 10);
        
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      return this.getFallbackSuggestions();
    }
  }

  private static async analyzeLowAttendance(classData: any, attendanceHistory: any[]): Promise<AISuggestion | null> {
    if (!attendanceHistory.length) return null;

    const totalRecords = attendanceHistory.length;
    const presentRecords = attendanceHistory.filter(record => record.status === 'present').length;
    const attendanceRate = (presentRecords / totalRecords) * 100;

    if (attendanceRate < this.ATTENDANCE_THRESHOLD) {
      return {
        id: Date.now() + Math.random(),
        title: {
          en: `Send SMS reminders to parents of ${classData.name} students`,
          hi: `${classData.name} के छात्रों के अभिभावकों को SMS रिमाइंडर भेजें`
        },
        description: {
          en: `${classData.name} has ${Math.round(attendanceRate)}% attendance rate. Automated SMS reminders could improve punctuality.`,
          hi: `${classData.name} में ${Math.round(attendanceRate)}% उपस्थिति दर है। स्वचालित SMS रिमाइंडर समय की पाबंदी में सुधार कर सकते हैं।`
        },
        priority: 'high',
        impact: 'High',
        category: 'Communication',
        icon: 'AlertTriangle',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900',
        data: { classId: classData.id, attendanceRate },
        actionable: true
      };
    }

    return null;
  }

  private static async analyzeChronicAbsence(classData: any, weeklyData: any[]): Promise<AISuggestion | null> {
    const studentAbsences: { [key: number]: number } = {};
    
    weeklyData.forEach(record => {
      if (record.status === 'absent') {
        studentAbsences[record.student_id] = (studentAbsences[record.student_id] || 0) + 1;
      }
    });

    const chronicAbsentees = Object.entries(studentAbsences)
      .filter(([_, absences]) => absences >= this.CHRONIC_ABSENCE_DAYS)
      .length;

    if (chronicAbsentees > 0) {
      return {
        id: Date.now() + Math.random(),
        title: {
          en: `Schedule parent-teacher meetings for frequent absentees in ${classData.name}`,
          hi: `${classData.name} में बार-बार अनुपस्थित रहने वाले छात्रों के लिए अभिभावक-शिक्षक बैठक का आयोजन करें`
        },
        description: {
          en: `${chronicAbsentees} students have missed ${this.CHRONIC_ABSENCE_DAYS}+ days this week. Early intervention may prevent chronic absenteeism.`,
          hi: `${chronicAbsentees} छात्रों ने इस सप्ताह ${this.CHRONIC_ABSENCE_DAYS}+ दिन की छुट्टी ली है। जल्दी हस्तक्षेप से पुरानी अनुपस्थिति को रोका जा सकता है।`
        },
        priority: 'medium',
        impact: 'Medium',
        category: 'Intervention',
        icon: 'Users',
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-100 dark:bg-orange-900',
        data: { classId: classData.id, chronicAbsentees },
        actionable: true
      };
    }

    return null;
  }

  private static async analyzeDayPatterns(classData: any, attendanceHistory: any[]): Promise<AISuggestion | null> {
    const dayStats: { [key: number]: { total: number; absent: number } } = {};
    
    attendanceHistory.forEach(record => {
      const dayOfWeek = getDay(new Date(record.date));
      if (!dayStats[dayOfWeek]) {
        dayStats[dayOfWeek] = { total: 0, absent: 0 };
      }
      dayStats[dayOfWeek].total++;
      if (record.status === 'absent') {
        dayStats[dayOfWeek].absent++;
      }
    });

    // Find the day with highest absence rate
    let worstDay = -1;
    let worstRate = 0;
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayNamesHi = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

    Object.entries(dayStats).forEach(([day, stats]) => {
      const absenceRate = (stats.absent / stats.total) * 100;
      if (absenceRate > worstRate && absenceRate > 20) { // Only if > 20% absence
        worstRate = absenceRate;
        worstDay = parseInt(day);
      }
    });

    if (worstDay !== -1) {
      return {
        id: Date.now() + Math.random(),
        title: {
          en: `${classData.name} has low attendance on ${dayNames[worstDay]}s`,
          hi: `${classData.name} में ${dayNamesHi[worstDay]} को कम उपस्थिति है`
        },
        description: {
          en: `${classData.name} has ${Math.round(worstRate)}% absence rate on ${dayNames[worstDay]}s. Consider special activities or incentives.`,
          hi: `${classData.name} में ${dayNamesHi[worstDay]} को ${Math.round(worstRate)}% अनुपस्थिति दर है। विशेष गतिविधियों या प्रोत्साहन पर विचार करें।`
        },
        priority: 'low',
        impact: 'Medium',
        category: 'Planning',
        icon: 'TrendingDown',
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-100 dark:bg-purple-900',
        data: { classId: classData.id, worstDay, worstRate },
        actionable: true
      };
    }

    return null;
  }

  private static generateWeatherSuggestion(): AISuggestion {
    // This is a placeholder - in real implementation, you'd integrate with weather API
    return {
      id: Date.now() + Math.random(),
      title: {
        en: 'Weather-based attendance predictions',
        hi: 'मौसम आधारित उपस्थिति पूर्वानुमान'
      },
      description: {
        en: 'Rainy days correlate with 20% lower attendance. Prepare indoor activities and parent notifications.',
        hi: 'बारिश के दिनों में 20% कम उपस्थिति देखी जाती है। इनडोर गतिविधियों और अभिभावक सूचनाओं की तैयारी करें।'
      },
      priority: 'medium',
      impact: 'Medium',
      category: 'Planning',
      icon: 'TrendingDown',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
      actionable: true
    };
  }

  private static async generateRewardSuggestion(): Promise<AISuggestion> {
    return {
      id: Date.now() + Math.random(),
      title: {
        en: 'Implement morning assembly attendance rewards',
        hi: 'सुबह की सभा में उपस्थिति के लिए पुरस्कार लागू करें'
      },
      description: {
        en: 'Students arriving before 8:30 AM show 95% weekly attendance. Consider incentive programs.',
        hi: '8:30 बजे से पहले आने वाले छात्र 95% साप्ताहिक उपस्थिति दिखाते हैं। प्रोत्साहन कार्यक्रमों पर विचार करें।'
      },
      priority: 'low',
      impact: 'Medium',
      category: 'Motivation',
      icon: 'Star',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900',
      actionable: true
    };
  }

  private static getFallbackSuggestions(): AISuggestion[] {
    return [
      {
        id: 1,
        title: {
          en: 'Setup automated SMS system for attendance',
          hi: 'उपस्थिति के लिए स्वचालित SMS सिस्टम सेटअप करें'
        },
        description: {
          en: 'Automated SMS notifications can improve attendance by 15-20%. Consider implementing parent notification system.',
          hi: 'स्वचालित SMS सूचनाएं उपस्थिति में 15-20% सुधार कर सकती हैं। अभिभावक सूचना प्रणाली लागू करने पर विचार करें।'
        },
        priority: 'high',
        impact: 'High',
        category: 'Communication',
        icon: 'AlertTriangle',
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900',
        actionable: true
      },
      {
        id: 2,
        title: {
          en: 'Create attendance analytics dashboard',
          hi: 'उपस्थिति विश्लेषण डैशबोर्ड बनाएं'
        },
        description: {
          en: 'Real-time attendance analytics help identify patterns and improve decision making.',
          hi: 'वास्तविक समय उपस्थिति विश्लेषण पैटर्न की पहचान करने और निर्णय लेने में सुधार करने में मदद करता है।'
        },
        priority: 'medium',
        impact: 'Medium',
        category: 'Analytics',
        icon: 'Users',
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-100 dark:bg-orange-900',
        actionable: true
      }
    ];
  }

  static async implementSuggestion(suggestionId: number): Promise<boolean> {
    // This would handle implementing a suggestion
    // For now, just return success
    console.log(`Implementing suggestion ${suggestionId}`);
    return true;
  }

  static async dismissSuggestion(suggestionId: number): Promise<boolean> {
    // This would handle dismissing a suggestion
    // For now, just return success
    console.log(`Dismissing suggestion ${suggestionId}`);
    return true;
  }
}
