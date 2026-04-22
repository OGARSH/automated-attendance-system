import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  TrendingUp, 
  Download, 
  Calendar, 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  BarChart3,
  PieChart,
  FileText,
  Filter,
  Eye,
  Share
} from 'lucide-react';

interface ViewReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'hi';
}

const translations = {
  en: {
    viewReports: 'View Reports',
    reportType: 'Report Type',
    attendanceReport: 'Attendance Report',
    classReport: 'Class Report',
    studentReport: 'Student Report',
    monthlyReport: 'Monthly Report',
    customReport: 'Custom Report',
    selectPeriod: 'Select Period',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    customRange: 'Custom Range',
    selectClass: 'Select Class',
    allClasses: 'All Classes',
    fromDate: 'From Date',
    toDate: 'To Date',
    generateReport: 'Generate Report',
    downloadReport: 'Download Report',
    shareReport: 'Share Report',
    cancel: 'Cancel',
    attendanceRate: 'Attendance Rate',
    totalDays: 'Total Days',
    presentDays: 'Present Days',
    absentDays: 'Absent Days',
    lateDays: 'Late Days',
    reportSummary: 'Report Summary',
    classWiseAttendance: 'Class-wise Attendance',
    studentName: 'Student Name',
    rollNo: 'Roll No',
    attendance: 'Attendance',
    insights: 'Insights',
    trends: 'Trends',
    recommendations: 'Recommendations',
    highAttendance: 'High Attendance',
    lowAttendance: 'Low Attendance',
    averageAttendance: 'Average Attendance',
    improvementNeeded: 'Improvement Needed',
    excellent: 'Excellent',
    good: 'Good',
    needsImprovement: 'Needs Improvement'
  },
  hi: {
    viewReports: 'रिपोर्ट देखें',
    reportType: 'रिपोर्ट प्रकार',
    attendanceReport: 'उपस्थिति रिपोर्ट',
    classReport: 'कक्षा रिपोर्ट',
    studentReport: 'छात्र रिपोर्ट',
    monthlyReport: 'मासिक रिपोर्ट',
    customReport: 'कस्टम रिपोर्ट',
    selectPeriod: 'अवधि चुनें',
    today: 'आज',
    thisWeek: 'इस सप्ताह',
    thisMonth: 'इस महीने',
    lastMonth: 'पिछले महीने',
    customRange: 'कस्टम रेंज',
    selectClass: 'कक्षा चुनें',
    allClasses: 'सभी कक्षाएं',
    fromDate: 'से दिनांक',
    toDate: 'तक दिनांक',
    generateReport: 'रिपोर्ट जेनरेट करें',
    downloadReport: 'रिपोर्ट डाउनलोड करें',
    shareReport: 'रिपोर्ट शेयर करें',
    cancel: 'रद्द करें',
    attendanceRate: 'उपस्थिति दर',
    totalDays: 'कुल दिन',
    presentDays: 'उपस्थित दिन',
    absentDays: 'अनुपस्थित दिन',
    lateDays: 'देर से आने वाले दिन',
    reportSummary: 'रिपोर्ट सारांश',
    classWiseAttendance: 'कक्षावार उपस्थिति',
    studentName: 'छात्र का नाम',
    rollNo: 'रोल नंबर',
    attendance: 'उपस्थिति',
    insights: 'अंतर्दृष्टि',
    trends: 'ट्रेंड्स',
    recommendations: 'सुझाव',
    highAttendance: 'उच्च उपस्थिति',
    lowAttendance: 'कम उपस्थिति',
    averageAttendance: 'औसत उपस्थिति',
    improvementNeeded: 'सुधार की आवश्यकता',
    excellent: 'उत्कृष्ट',
    good: 'अच्छा',
    needsImprovement: 'सुधार की आवश्यकता'
  }
};

const mockReportData = {
  summary: {
    totalStudents: 145,
    averageAttendance: 87,
    totalDays: 22,
    presentDays: 19,
    absentDays: 3,
    lateDays: 2
  },
  classData: [
    { class: '5-A', total: 30, present: 28, absent: 2, rate: 93 },
    { class: '5-B', total: 28, present: 24, absent: 4, rate: 86 },
    { class: '4-A', total: 32, present: 29, absent: 3, rate: 91 },
    { class: '4-B', total: 30, present: 25, absent: 5, rate: 83 },
    { class: '3-A', total: 25, present: 23, absent: 2, rate: 92 }
  ],
  insights: [
    'Monday shows 15% lower attendance across all classes',
    'Class 4-B needs attention with 83% attendance rate',
    '12 students have missed more than 3 days this month',
    'Weather-related absences increased by 20% this week'
  ]
};

export function ViewReportsModal({ isOpen, onClose, language }: ViewReportsModalProps) {
  const t = translations[language];
  const [reportConfig, setReportConfig] = useState({
    type: 'attendanceReport',
    period: 'thisMonth',
    class: 'allClasses',
    fromDate: '',
    toDate: ''
  });
  const [showReport, setShowReport] = useState(false);

  const handleConfigChange = (field: string, value: string) => {
    setReportConfig(prev => ({ ...prev, [field]: value }));
  };

  const generateReport = () => {
    setShowReport(true);
  };

  const downloadReport = () => {
    // Here you would generate and download the report
    console.log('Downloading report with config:', reportConfig);
  };

  const getAttendanceStatus = (rate: number) => {
    if (rate >= 90) return { label: t.excellent, color: 'bg-chart-1/10 text-chart-1' };
    if (rate >= 80) return { label: t.good, color: 'bg-chart-3/10 text-chart-3' };
    return { label: t.needsImprovement, color: 'bg-destructive/10 text-destructive' };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span>{t.viewReports}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!showReport ? (
            <>
              {/* Report Configuration */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Report Configuration
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="reportType">{t.reportType}</Label>
                    <Select value={reportConfig.type} onValueChange={(value) => handleConfigChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.reportType} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="attendanceReport">{t.attendanceReport}</SelectItem>
                        <SelectItem value="classReport">{t.classReport}</SelectItem>
                        <SelectItem value="studentReport">{t.studentReport}</SelectItem>
                        <SelectItem value="monthlyReport">{t.monthlyReport}</SelectItem>
                        <SelectItem value="customReport">{t.customReport}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="period">{t.selectPeriod}</Label>
                    <Select value={reportConfig.period} onValueChange={(value) => handleConfigChange('period', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectPeriod} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">{t.today}</SelectItem>
                        <SelectItem value="thisWeek">{t.thisWeek}</SelectItem>
                        <SelectItem value="thisMonth">{t.thisMonth}</SelectItem>
                        <SelectItem value="lastMonth">{t.lastMonth}</SelectItem>
                        <SelectItem value="customRange">{t.customRange}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="class">{t.selectClass}</Label>
                    <Select value={reportConfig.class} onValueChange={(value) => handleConfigChange('class', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectClass} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="allClasses">{t.allClasses}</SelectItem>
                        <SelectItem value="5-A">Class 5-A</SelectItem>
                        <SelectItem value="5-B">Class 5-B</SelectItem>
                        <SelectItem value="4-A">Class 4-A</SelectItem>
                        <SelectItem value="4-B">Class 4-B</SelectItem>
                        <SelectItem value="3-A">Class 3-A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {reportConfig.period === 'customRange' && (
                    <>
                      <div>
                        <Label htmlFor="fromDate">{t.fromDate}</Label>
                        <Input
                          id="fromDate"
                          type="date"
                          value={reportConfig.fromDate}
                          onChange={(e) => handleConfigChange('fromDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="toDate">{t.toDate}</Label>
                        <Input
                          id="toDate"
                          type="date"
                          value={reportConfig.toDate}
                          onChange={(e) => handleConfigChange('toDate', e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 flex justify-center">
                  <Button onClick={generateReport} className="bg-primary hover:bg-primary/90">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {t.generateReport}
                  </Button>
                </div>
              </Card>
            </>
          ) : (
            <>
              {/* Report Display */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">{t.attendanceReport}</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setShowReport(false)}>
                    <Filter className="h-4 w-4 mr-2" />
                    Change Filters
                  </Button>
                  <Button variant="outline" onClick={downloadReport}>
                    <Download className="h-4 w-4 mr-2" />
                    {t.downloadReport}
                  </Button>
                  <Button variant="outline">
                    <Share className="h-4 w-4 mr-2" />
                    {t.shareReport}
                  </Button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{mockReportData.summary.totalStudents}</p>
                  <p className="text-sm text-muted-foreground">{t.totalStudents}</p>
                </Card>
                <Card className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-chart-1" />
                  <p className="text-2xl font-bold text-chart-1">{mockReportData.summary.averageAttendance}%</p>
                  <p className="text-sm text-muted-foreground">{t.averageAttendance}</p>
                </Card>
                <Card className="p-4 text-center">
                  <UserCheck className="h-8 w-8 mx-auto mb-2 text-chart-1" />
                  <p className="text-2xl font-bold text-chart-1">{mockReportData.summary.presentDays}</p>
                  <p className="text-sm text-muted-foreground">{t.presentDays}</p>
                </Card>
                <Card className="p-4 text-center">
                  <UserX className="h-8 w-8 mx-auto mb-2 text-destructive" />
                  <p className="text-2xl font-bold text-destructive">{mockReportData.summary.absentDays}</p>
                  <p className="text-sm text-muted-foreground">{t.absentDays}</p>
                </Card>
              </div>

              {/* Class-wise Attendance */}
              <Card className="p-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  {t.classWiseAttendance}
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Class</th>
                        <th className="text-center p-2">{t.totalStudents}</th>
                        <th className="text-center p-2">{t.presentDays}</th>
                        <th className="text-center p-2">{t.absentDays}</th>
                        <th className="text-center p-2">{t.attendanceRate}</th>
                        <th className="text-center p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockReportData.classData.map((classItem, index) => {
                        const status = getAttendanceStatus(classItem.rate);
                        return (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            <td className="p-2 font-medium">{classItem.class}</td>
                            <td className="p-2 text-center">{classItem.total}</td>
                            <td className="p-2 text-center text-chart-1">{classItem.present}</td>
                            <td className="p-2 text-center text-destructive">{classItem.absent}</td>
                            <td className="p-2 text-center font-semibold">{classItem.rate}%</td>
                            <td className="p-2 text-center">
                              <Badge className={status.color}>{status.label}</Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Insights */}
              <Card className="p-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  {t.insights} & {t.recommendations}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockReportData.insights.map((insight, index) => (
                    <div key={index} className="p-4 bg-muted/20 rounded-lg border-l-4 border-primary">
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              {t.cancel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}