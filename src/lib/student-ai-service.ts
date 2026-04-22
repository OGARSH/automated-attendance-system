import { DataService } from './data-service';
import { format, subDays, addDays, differenceInDays, startOfMonth, endOfMonth } from 'date-fns';

export interface StudentAISuggestion {
  id: number;
  title: { en: string; hi: string };
  description: { en: string; hi: string };
  priority: 'high' | 'medium' | 'low';
  category: 'attendance' | 'improvement' | 'motivation' | 'health' | 'academic';
  icon: string;
  color: string;
  bgColor: string;
  actionable: boolean;
  tips?: { en: string[]; hi: string[] };
  progress?: {
    current: number;
    target: number;
    unit: string;
  };
}

export class StudentAIService {
  private static readonly TARGET_ATTENDANCE = 75; // Minimum required attendance
  private static readonly EXCELLENT_ATTENDANCE = 90; // Excellent attendance benchmark
  private static readonly DAYS_IN_ACADEMIC_YEAR = 200; // Typical academic year

  static async generateStudentSuggestions(
    studentId: number, 
    classId: number, 
    language: 'en' | 'hi' = 'en'
  ): Promise<StudentAISuggestion[]> {
    const suggestions: StudentAISuggestion[] = [];
    
    try {
      // Get student's attendance data
      const attendanceHistory = await this.getStudentAttendanceHistory(studentId, classId);
      const currentAttendance = this.calculateAttendancePercentage(attendanceHistory);
      const recentTrend = this.calculateRecentTrend(attendanceHistory);
      
      // 1. Attendance Maintenance Suggestions
      const attendanceSuggestions = this.generateAttendanceSuggestions(
        currentAttendance, 
        attendanceHistory.length,
        recentTrend
      );
      suggestions.push(...attendanceSuggestions);
      
      // 2. Improvement Strategies
      const improvementSuggestions = this.generateImprovementSuggestions(
        currentAttendance,
        recentTrend
      );
      suggestions.push(...improvementSuggestions);
      
      // 3. Health and Wellness Tips
      const healthSuggestions = this.generateHealthSuggestions(attendanceHistory);
      suggestions.push(...healthSuggestions);
      
      // 4. Motivational Suggestions
      const motivationalSuggestions = this.generateMotivationalSuggestions(
        currentAttendance,
        attendanceHistory.length
      );
      suggestions.push(...motivationalSuggestions);
      
      // 5. Academic Performance Connection
      const academicSuggestions = this.generateAcademicSuggestions(currentAttendance);
      suggestions.push(...academicSuggestions);
      
      // 6. Time Management and Routine Suggestions
      const routineSuggestions = this.generateRoutineSuggestions(attendanceHistory);
      suggestions.push(...routineSuggestions);
      
      // 7. Seasonal and Weather-based Tips
      const seasonalSuggestions = this.generateSeasonalSuggestions();
      suggestions.push(...seasonalSuggestions);
      
      // Sort by priority and limit to top suggestions
      return suggestions
        .sort((a, b) => this.getPriorityWeight(a.priority) - this.getPriorityWeight(b.priority))
        .slice(0, 8);
        
    } catch (error) {
      console.error('Error generating student AI suggestions:', error);
      return this.getFallbackSuggestions();
    }
  }
  
  private static async getStudentAttendanceHistory(studentId: number, classId: number) {
    try {
      // Try to get real attendance data from DataService
      const today = new Date();
      const thirtyDaysAgo = subDays(today, 30);
      
      // For now, we'll simulate realistic data based on common patterns
      // In a real implementation, this would fetch from the database
      const mockHistory = [];
      const attendancePatterns = [0.95, 0.85, 0.75, 0.65]; // Different student performance levels
      const baseAttendance = attendancePatterns[studentId % attendancePatterns.length];
      
      for (let i = 0; i < 25; i++) { // 25 school days in last month
        const date = subDays(today, i);
        const dayOfWeek = date.getDay();
        
        // Skip weekends
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;
        
        // Add some randomness but maintain the overall pattern
        let isPresent = Math.random() < baseAttendance;
        
        // Make Mondays slightly more likely to be absent
        if (dayOfWeek === 1) {
          isPresent = Math.random() < (baseAttendance * 0.9);
        }
        
        // Make Fridays more likely to be present (weekend excitement)
        if (dayOfWeek === 5) {
          isPresent = Math.random() < (baseAttendance * 1.1);
        }
        
        mockHistory.push({
          date: format(date, 'yyyy-MM-dd'),
          status: isPresent ? 'present' : 'absent'
        });
      }
      
      return mockHistory.reverse(); // Return in chronological order
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      return [];
    }
  }
  
  private static calculateAttendancePercentage(history: any[]): number {
    if (history.length === 0) return 100;
    const presentDays = history.filter(h => h.status === 'present').length;
    return Math.round((presentDays / history.length) * 100);
  }
  
  private static calculateRecentTrend(history: any[]): 'improving' | 'declining' | 'stable' {
    if (history.length < 10) return 'stable';
    
    const recent = history.slice(0, 5);
    const older = history.slice(5, 10);
    
    const recentAttendance = this.calculateAttendancePercentage(recent);
    const olderAttendance = this.calculateAttendancePercentage(older);
    
    if (recentAttendance > olderAttendance + 5) return 'improving';
    if (recentAttendance < olderAttendance - 5) return 'declining';
    return 'stable';
  }
  
  private static generateAttendanceSuggestions(
    currentAttendance: number,
    totalDays: number,
    trend: string
  ): StudentAISuggestion[] {
    const suggestions: StudentAISuggestion[] = [];
    
    if (currentAttendance < this.TARGET_ATTENDANCE) {
      // Critical: Below 75%
      suggestions.push({
        id: 1,
        title: {
          en: `🚨 Attendance Alert: ${currentAttendance}%`,
          hi: `🚨 उपस्थिति चेतावनी: ${currentAttendance}%`
        },
        description: {
          en: `Your attendance is below the required 75%. You need to attend ${Math.ceil((this.TARGET_ATTENDANCE * (totalDays + 10)) / 100) - Math.ceil((currentAttendance * totalDays) / 100)} more classes.`,
          hi: `आपकी उपस्थिति आवश्यक 75% से कम है। आपको ${Math.ceil((this.TARGET_ATTENDANCE * (totalDays + 10)) / 100) - Math.ceil((currentAttendance * totalDays) / 100)} और कक्षाओं में उपस्थित होना होगा।`
        },
        priority: 'high',
        category: 'attendance',
        icon: 'AlertTriangle',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        actionable: true,
        progress: {
          current: currentAttendance,
          target: this.TARGET_ATTENDANCE,
          unit: '%'
        },
        tips: {
          en: [
            "Set daily alarms for each class",
            "Prepare everything the night before",
            "Find a study buddy for accountability",
            "Talk to your teacher about your situation"
          ],
          hi: [
            "हर कक्षा के लिए दैनिक अलार्म सेट करें",
            "रात को सब कुछ तैयार रखें",
            "जवाबदेही के लिए एक अध्ययन मित्र ढूंढें",
            "अपने शिक्षक से अपनी स्थिति के बारे में बात करें"
          ]
        }
      });
    } else if (currentAttendance < this.EXCELLENT_ATTENDANCE) {
      // Good but can improve
      suggestions.push({
        id: 2,
        title: {
          en: `📈 Keep It Up! ${currentAttendance}%`,
          hi: `📈 इसे जारी रखें! ${currentAttendance}%`
        },
        description: {
          en: `You're above the minimum requirement! Aim for ${this.EXCELLENT_ATTENDANCE}% to achieve excellent attendance.`,
          hi: `आप न्यूनतम आवश्यकता से ऊपर हैं! उत्कृष्ट उपस्थिति प्राप्त करने के लिए ${this.EXCELLENT_ATTENDANCE}% का लक्ष्य रखें।`
        },
        priority: 'medium',
        category: 'improvement',
        icon: 'TrendingUp',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        actionable: true,
        progress: {
          current: currentAttendance,
          target: this.EXCELLENT_ATTENDANCE,
          unit: '%'
        }
      });
    }
    
    return suggestions;
  }
  
  private static generateImprovementSuggestions(
    currentAttendance: number,
    trend: string
  ): StudentAISuggestion[] {
    const suggestions: StudentAISuggestion[] = [];
    
    if (trend === 'declining') {
      suggestions.push({
        id: 3,
        title: {
          en: "📉 Declining Trend Detected",
          hi: "📉 गिरावट की प्रवृत्ति का पता चला"
        },
        description: {
          en: "Your attendance has been decreasing lately. Let's identify and address the causes.",
          hi: "आपकी उपस्थिति हाल ही में कम हो रही है। आइए कारणों की पहचान करें और उन्हें हल करें।"
        },
        priority: 'high',
        category: 'improvement',
        icon: 'TrendingDown',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        actionable: true,
        tips: {
          en: [
            "Review your recent schedule changes",
            "Check if health issues are affecting attendance",
            "Evaluate transportation reliability",
            "Consider time management improvements"
          ],
          hi: [
            "अपने हाल के शेड्यूल परिवर्तनों की समीक्षा करें",
            "जांचें कि क्या स्वास्थ्य समस्याएं उपस्थिति को प्रभावित कर रही हैं",
            "परिवहन की विश्वसनीयता का मूल्यांकन करें",
            "समय प्रबंधन में सुधार पर विचार करें"
          ]
        }
      });
    }
    
    return suggestions;
  }
  
  private static generateHealthSuggestions(history: any[]): StudentAISuggestion[] {
    const suggestions: StudentAISuggestion[] = [];
    
    // Check for frequent absences
    const recentAbsences = history.slice(0, 7).filter(h => h.status === 'absent').length;
    
    if (recentAbsences >= 2) {
      suggestions.push({
        id: 4,
        title: {
          en: "💊 Health & Wellness Focus",
          hi: "💊 स्वास्थ्य और कल्याण पर ध्यान"
        },
        description: {
          en: "Recent absences suggest health might be a factor. Prioritize your wellbeing!",
          hi: "हाल की अनुपस्थिति से पता चलता है कि स्वास्थ्य एक कारक हो सकता है। अपनी भलाई को प्राथमिकता दें!"
        },
        priority: 'medium',
        category: 'health',
        icon: 'Heart',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        actionable: true,
        tips: {
          en: [
            "Maintain a regular sleep schedule",
            "Eat nutritious breakfast daily",
            "Stay hydrated throughout the day",
            "Exercise regularly to boost immunity"
          ],
          hi: [
            "नियमित नींद का कार्यक्रम बनाए रखें",
            "रोजाना पौष्टिक नाश्ता करें",
            "दिन भर हाइड्रेटेड रहें",
            "प्रतिरक्षा बढ़ाने के लिए नियमित व्यायाम करें"
          ]
        }
      });
    }
    
    return suggestions;
  }
  
  private static generateMotivationalSuggestions(
    currentAttendance: number,
    totalDays: number
  ): StudentAISuggestion[] {
    const suggestions: StudentAISuggestion[] = [];
    
    if (currentAttendance >= this.EXCELLENT_ATTENDANCE) {
      suggestions.push({
        id: 5,
        title: {
          en: "🌟 Attendance Superstar!",
          hi: "🌟 उपस्थिति सुपरस्टार!"
        },
        description: {
          en: "Excellent work! Your consistent attendance is setting you up for academic success.",
          hi: "उत्कृष्ट काम! आपकी निरंतर उपस्थिति आपको शैक्षणिक सफलता के लिए तैयार कर रही है।"
        },
        priority: 'low',
        category: 'motivation',
        icon: 'Star',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        actionable: false
      });
    }
    
    // Achievement-based motivation
    if (totalDays >= 10) {
      suggestions.push({
        id: 6,
        title: {
          en: `🎯 ${totalDays} Days Tracked!`,
          hi: `🎯 ${totalDays} दिन ट्रैक किए गए!`
        },
        description: {
          en: "Every day you attend brings you closer to your academic goals. Keep building that momentum!",
          hi: "जिस दिन आप उपस्थित होते हैं, वह आपको अपने शैक्षणिक लक्ष्यों के करीब लाता है। उस गति को बनाए रखें!"
        },
        priority: 'low',
        category: 'motivation',
        icon: 'Target',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
        actionable: false
      });
    }
    
    return suggestions;
  }
  
  private static generateAcademicSuggestions(currentAttendance: number): StudentAISuggestion[] {
    const suggestions: StudentAISuggestion[] = [];
    
    if (currentAttendance >= this.TARGET_ATTENDANCE) {
      suggestions.push({
        id: 7,
        title: {
          en: "📚 Academic Success Connection",
          hi: "📚 शैक्षणिक सफलता कनेक्शन"
        },
        description: {
          en: "Studies show that 75%+ attendance correlates with better grades and understanding.",
          hi: "अध्ययन बताते हैं कि 75%+ उपस्थिति बेहतर ग्रेड और समझ से जुड़ी है।"
        },
        priority: 'low',
        category: 'academic',
        icon: 'BookOpen',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
        actionable: true,
        tips: {
          en: [
            "Active participation improves learning",
            "Regular attendance builds study habits",
            "Classroom discussions enhance understanding",
            "Teacher interaction boosts performance"
          ],
          hi: [
            "सक्रिय भागीदारी सीखने में सुधार करती है",
            "नियमित उपस्थिति अध्ययन की आदतें बनाती है",
            "कक्षा चर्चा समझ को बढ़ाती है",
            "शिक्षक बातचीत प्रदर्शन को बढ़ाती है"
          ]
        }
      });
    }
    
    return suggestions;
  }
  
  private static generateRoutineSuggestions(history: any[]): StudentAISuggestion[] {
    const suggestions: StudentAISuggestion[] = [];
    
    // Analyze patterns
    const mondayAbsences = history.filter(h => {
      const date = new Date(h.date);
      return date.getDay() === 1 && h.status === 'absent';
    }).length;
    
    if (mondayAbsences >= 2) {
      suggestions.push({
        id: 8,
        title: {
          en: "⏰ Monday Morning Motivation",
          hi: "⏰ सोमवार सुबह प्रेरणा"
        },
        description: {
          en: "You've missed a few Mondays. Let's make Monday mornings easier with better preparation!",
          hi: "आपने कुछ सोमवार छोड़े हैं। बेहतर तैयारी के साथ सोमवार की सुबह आसान बनाते हैं!"
        },
        priority: 'medium',
        category: 'improvement',
        icon: 'Clock',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        actionable: true,
        tips: {
          en: [
            "Prepare school bag on Sunday evening",
            "Set clothes out the night before",
            "Go to bed 30 minutes earlier on Sunday",
            "Set a motivating Monday morning playlist"
          ],
          hi: [
            "रविवार शाम को स्कूल बैग तैयार करें",
            "रात को पहले कपड़े निकाल कर रखें",
            "रविवार को 30 मिनट पहले सोएं",
            "प्रेरणादायक सोमवार सुबह प्लेलिस्ट सेट करें"
          ]
        }
      });
    }
    
    return suggestions;
  }
  
  private static generateSeasonalSuggestions(): StudentAISuggestion[] {
    const suggestions: StudentAISuggestion[] = [];
    const currentMonth = new Date().getMonth();
    
    // Winter months (Dec, Jan, Feb)
    if ([11, 0, 1].includes(currentMonth)) {
      suggestions.push({
        id: 9,
        title: {
          en: "❄️ Winter Attendance Tips",
          hi: "❄️ सर्दियों की उपस्थिति टिप्स"
        },
        description: {
          en: "Cold weather can make it tempting to stay in bed. Beat the winter blues with these strategies!",
          hi: "ठंड के मौसम में बिस्तर में रहने का मन करता है। इन रणनीतियों से सर्दियों की उदासी को हराएं!"
        },
        priority: 'low',
        category: 'health',
        icon: 'Heart',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        actionable: true,
        tips: {
          en: [
            "Keep warm clothes ready the night before",
            "Eat a warm, nutritious breakfast",
            "Use a sunrise alarm clock",
            "Pack hot snacks for energy"
          ],
          hi: [
            "रात को पहले गर्म कपड़े तैयार रखें",
            "गर्म, पौष्टिक नाश्ता करें",
            "सूर्योदय अलार्म क्लॉक का उपयोग करें",
            "ऊर्जा के लिए गर्म स्नैक्स पैक करें"
          ]
        }
      });
    }
    
    // Monsoon months (Jun, Jul, Aug, Sep)
    if ([5, 6, 7, 8].includes(currentMonth)) {
      suggestions.push({
        id: 10,
        title: {
          en: "🌧️ Rainy Day Readiness",
          hi: "🌧️ बारिश के दिन तैयारी"
        },
        description: {
          en: "Don't let rain dampen your attendance! Stay prepared for monsoon challenges.",
          hi: "बारिश आपकी उपस्थिति को कम न करने दें! मानसून की चुनौतियों के लिए तैयार रहें।"
        },
        priority: 'medium',
        category: 'health',
        icon: 'Heart',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        actionable: true,
        tips: {
          en: [
            "Keep extra clothes and socks in bag",
            "Check weather forecast daily",
            "Have backup transportation plans",
            "Waterproof your school materials"
          ],
          hi: [
            "बैग में अतिरिक्त कपड़े और मोज़े रखें",
            "रोजाना मौसम पूर्वानुमान जांचें",
            "बैकअप परिवहन योजना रखें",
            "अपनी स्कूल सामग्री को वाटरप्रूफ करें"
          ]
        }
      });
    }
    
    return suggestions;
  }
  
  private static getPriorityWeight(priority: string): number {
    switch (priority) {
      case 'high': return 1;
      case 'medium': return 2;
      case 'low': return 3;
      default: return 4;
    }
  }
  
  private static getFallbackSuggestions(): StudentAISuggestion[] {
    return [{
      id: 999,
      title: {
        en: "📊 Building Your Attendance Profile",
        hi: "📊 अपनी उपस्थिति प्रोफ़ाइल बनाना"
      },
      description: {
        en: "Keep attending classes regularly to unlock personalized AI suggestions for your academic success!",
        hi: "अपनी शैक्षणिक सफलता के लिए व्यक्तिगत AI सुझावों को अनलॉक करने के लिए नियमित रूप से कक्षाओं में भाग लेते रहें!"
      },
      priority: 'medium',
      category: 'motivation',
      icon: 'Brain',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      actionable: false
    }];
  }
}