import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { Search, Users, UserCheck, UserX, Clock, QrCode, ClipboardList } from 'lucide-react';
import QRCode from 'react-qr-code';

interface MarkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'hi';
}

const translations = {
  en: {
    markAttendance: 'Mark Attendance',
    searchStudents: 'Search students...',
    selectClass: 'Select Class',
    present: 'Present',
    absent: 'Absent',
    late: 'Late',
    saveAttendance: 'Save Attendance',
    cancel: 'Cancel',
    totalStudents: 'Total Students',
    presentCount: 'Present',
    absentCount: 'Absent',
    lateCount: 'Late',
    selectAll: 'Select All',
    markAllPresent: 'Mark All Present',
    date: 'Date',
    time: 'Time',
    showQR: 'Show QR',
    manualEntry: 'Manual Entry'
  },
  hi: {
    markAttendance: 'उपस्थिति चिह्नित करें',
    searchStudents: 'छात्र खोजें...',
    selectClass: 'कक्षा चुनें',
    present: 'उपस्थित',
    absent: 'अनुपस्थित',
    late: 'देर से',
    saveAttendance: 'उपस्थिति सहेजें',
    cancel: 'रद्द करें',
    totalStudents: 'कुल छात्र',
    presentCount: 'उपस्थित',
    absentCount: 'अनुपस्थित',
    lateCount: 'देर से',
    selectAll: 'सभी चुनें',
    markAllPresent: 'सभी को उपस्थित करें',
    date: 'दिनांक',
    time: 'समय',
    showQR: 'क्यूआर दिखाएं',
    manualEntry: 'मैनुअल प्रविष्टि'
  }
};

const mockStudents = [
  { id: 1, name: 'Aarav Sharma', rollNo: '001', status: 'present' },
  { id: 2, name: 'Aadhya Patel', rollNo: '002', status: 'present' },
  { id: 3, name: 'Vihaan Kumar', rollNo: '003', status: 'absent' },
  { id: 4, name: 'Aanya Singh', rollNo: '004', status: 'present' },
  { id: 5, name: 'Reyansh Gupta', rollNo: '005', status: 'late' },
  { id: 6, name: 'Ira Joshi', rollNo: '006', status: 'present' },
  { id: 7, name: 'Arjun Yadav', rollNo: '007', status: 'present' },
  { id: 8, name: 'Myra Shah', rollNo: '008', status: 'absent' },
];

export function MarkAttendanceModal({ isOpen, onClose, language }: MarkAttendanceModalProps) {
  const t = translations[language];
  const [students, setStudents] = useState(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('5-A');
  const [activeTab, setActiveTab] = useState<'manual' | 'qr'>('manual');

  // Stable session token so QR doesn't flicker on re-renders
  const sessionToken = useMemo(() => Math.random().toString(36).substring(7), []);
  const qrValue = useMemo(() => JSON.stringify({
    classId: selectedClass,
    date: new Date().toISOString().split('T')[0],
    sessionToken
  }), [selectedClass, sessionToken]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo.includes(searchTerm)
  );

  const presentCount = students.filter(s => s.status === 'present').length;
  const absentCount = students.filter(s => s.status === 'absent').length;
  const lateCount = students.filter(s => s.status === 'late').length;

  const updateStudentStatus = (id: number, status: 'present' | 'absent' | 'late') => {
    setStudents(prev => prev.map(student =>
      student.id === id ? { ...student, status } : student
    ));
  };

  const markAllPresent = () => {
    setStudents(prev => prev.map(student => ({ ...student, status: 'present' as const })));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-chart-1/10 text-chart-1 border-chart-1/20';
      case 'absent': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'late': return 'bg-chart-3/10 text-chart-3 border-chart-3/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const handleSave = () => {
    // Here you would save the attendance data
    console.log('Saving attendance:', students);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserCheck className="h-6 w-6 text-primary" />
            <span>{t.markAttendance}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t.date}</span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t.time}</span>
                <span className="font-medium">{new Date().toLocaleTimeString()}</span>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Class</span>
                <span className="font-medium">{selectedClass}</span>
              </div>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{students.length}</p>
              <p className="text-sm text-muted-foreground">{t.totalStudents}</p>
            </Card>
            <Card className="p-4 text-center">
              <UserCheck className="h-6 w-6 mx-auto mb-2 text-chart-1" />
              <p className="text-2xl font-bold text-chart-1">{presentCount}</p>
              <p className="text-sm text-muted-foreground">{t.presentCount}</p>
            </Card>
            <Card className="p-4 text-center">
              <UserX className="h-6 w-6 mx-auto mb-2 text-destructive" />
              <p className="text-2xl font-bold text-destructive">{absentCount}</p>
              <p className="text-sm text-muted-foreground">{t.absentCount}</p>
            </Card>
            <Card className="p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-chart-3" />
              <p className="text-2xl font-bold text-chart-3">{lateCount}</p>
              <p className="text-sm text-muted-foreground">{t.lateCount}</p>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2 text-sm font-medium border-b-2 flex justify-center items-center ${activeTab === 'manual' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              {t.manualEntry}
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex-1 py-2 text-sm font-medium border-b-2 flex justify-center items-center ${activeTab === 'qr' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}
            >
              <QrCode className="h-4 w-4 mr-2" />
              {t.showQR}
            </button>
          </div>

          {activeTab === 'manual' ? (
            <>
              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t.searchStudents}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button onClick={markAllPresent} variant="outline">
                  {t.markAllPresent}
                </Button>
              </div>

              {/* Student List */}
              <div className="max-h-[30vh] overflow-y-auto space-y-2">
                {filteredStudents.map((student) => (
                  <Card key={student.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-primary">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">Roll No: {student.rollNo}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(student.status)}>
                          {t[student.status as keyof typeof t]}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant={student.status === 'present' ? 'default' : 'outline'}
                            onClick={() => updateStudentStatus(student.id, 'present')}
                            className="h-8 px-3"
                          >
                            P
                          </Button>
                          <Button
                            size="sm"
                            variant={student.status === 'absent' ? 'default' : 'outline'}
                            onClick={() => updateStudentStatus(student.id, 'absent')}
                            className="h-8 px-3"
                          >
                            A
                          </Button>
                          <Button
                            size="sm"
                            variant={student.status === 'late' ? 'default' : 'outline'}
                            onClick={() => updateStudentStatus(student.id, 'late')}
                            className="h-8 px-3"
                          >
                            L
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-border flex justify-center items-center" style={{ width: '250px', height: '250px', margin: '0 auto' }}>
                <QRCode 
                  value={qrValue} 
                  size={200}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox={`0 0 200 200`}
                />
              </div>
              <p className="mt-6 text-sm text-muted-foreground text-center max-w-sm">
                {language === 'en' ? 'Ask students to scan this QR code from their dashboard to mark their attendance.' : 'छात्रों को अपनी उपस्थिति दर्ज करने के लिए उनके डैशबोर्ड से इस क्यूआर कोड को स्कैन करने के लिए कहें।'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              {t.cancel}
            </Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
              {t.saveAttendance}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}