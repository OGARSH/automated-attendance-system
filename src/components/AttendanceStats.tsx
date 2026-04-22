import React from 'react';
import { Card } from './ui/card';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface AttendanceStatsProps {
  language: 'en' | 'hi';
}

const translations = {
  en: {
    weeklyTrend: 'Weekly Attendance Trend',
    lastWeek: 'Last 7 Days',
    average: 'Average',
    improvement: 'Improvement',
    decline: 'Decline',
    monday: 'Mon',
    tuesday: 'Tue',
    wednesday: 'Wed',
    thursday: 'Thu',
    friday: 'Fri',
    saturday: 'Sat',
    sunday: 'Sun'
  },
  hi: {
    weeklyTrend: 'साप्ताहिक उपस्थिति रुझान',
    lastWeek: 'पिछले 7 दिन',
    average: 'औसत',
    improvement: 'सुधार',
    decline: 'गिरावट',
    monday: 'सोम',
    tuesday: 'मंगल',
    wednesday: 'बुध',
    thursday: 'गुरु',
    friday: 'शुक्र',
    saturday: 'शनि',
    sunday: 'रवि'
  }
};

export function AttendanceStats({ language }: AttendanceStatsProps) {
  const t = translations[language];

  const weekData = [
    { day: t.monday, rate: 88, students: 128 },
    { day: t.tuesday, rate: 92, students: 134 },
    { day: t.wednesday, rate: 85, students: 123 },
    { day: t.thursday, rate: 90, students: 131 },
    { day: t.friday, rate: 91, students: 132 },
    { day: t.saturday, rate: 87, students: 126 },
    { day: t.sunday, rate: 0, students: 0 }
  ];

  const averageRate = Math.round(weekData.slice(0, 6).reduce((sum, day) => sum + day.rate, 0) / 6);
  const trend = averageRate > 85 ? 'up' : 'down';

  return (
    <Card className="p-6 bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t.weeklyTrend}
        </h3>
        <div className="flex items-center space-x-2">
          {trend === 'up' ? (
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
          )}
          <span className={`text-sm font-medium ${
            trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {averageRate}% {t.average}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {weekData.map((day, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 text-sm text-gray-600 dark:text-gray-400">
                {day.day}
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      day.rate >= 90 ? 'bg-green-500' :
                      day.rate >= 80 ? 'bg-yellow-500' :
                      day.rate > 0 ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    style={{ width: `${day.rate}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {day.rate}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {day.students > 0 ? `${day.students}/145` : '-'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            {t.lastWeek}: {averageRate}% {t.average}
          </span>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
          {trend === 'up' ? t.improvement : t.decline} {language === 'en' ? 'compared to previous week' : 'पिछले सप्ताह की तुलना में'}
        </p>
      </div>
    </Card>
  );
}