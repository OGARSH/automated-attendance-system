import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Bell, Send, Users, MessageSquare, Mail, Phone, Calendar, Clock } from 'lucide-react';

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'hi';
}

const translations = {
  en: {
    sendNotification: 'Send Notification',
    notificationType: 'Notification Type',
    sms: 'SMS',
    email: 'Email',
    both: 'SMS & Email',
    recipients: 'Recipients',
    allParents: 'All Parents',
    selectedClasses: 'Selected Classes',
    specificParents: 'Specific Parents',
    selectClasses: 'Select Classes',
    class: 'Class',
    subject: 'Subject',
    message: 'Message',
    scheduleSend: 'Schedule Send',
    sendNow: 'Send Now',
    sendLater: 'Send Later',
    selectDate: 'Select Date',
    selectTime: 'Select Time',
    preview: 'Preview',
    send: 'Send Notification',
    cancel: 'Cancel',
    messagePreview: 'Message Preview',
    recipientCount: 'Recipients',
    estimatedCost: 'Estimated Cost',
    free: 'Free',
    urgent: 'Urgent',
    normal: 'Normal',
    priority: 'Priority',
    template: 'Template',
    selectTemplate: 'Select Template',
    customMessage: 'Custom Message',
    attendanceReminder: 'Attendance Reminder',
    examNotification: 'Exam Notification',
    holidayNotice: 'Holiday Notice',
    feeReminder: 'Fee Reminder',
    eventNotification: 'Event Notification'
  },
  hi: {
    sendNotification: 'सूचना भेजें',
    notificationType: 'सूचना प्रकार',
    sms: 'SMS',
    email: 'ईमेल',
    both: 'SMS और ईमेल',
    recipients: 'प्राप्तकर्ता',
    allParents: 'सभी माता-पिता',
    selectedClasses: 'चुनी गई कक्षाएं',
    specificParents: 'विशिष्ट माता-पिता',
    selectClasses: 'कक्षाएं चुनें',
    class: 'कक्षा',
    subject: 'विषय',
    message: 'संदेश',
    scheduleSend: 'भेजना शेड्यूल करें',
    sendNow: 'अभी भेजें',
    sendLater: 'बाद में भेजें',
    selectDate: 'दिनांक चुनें',
    selectTime: 'समय चुनें',
    preview: 'पूर्वावलोकन',
    send: 'सूचना भेजें',
    cancel: 'रद्द करें',
    messagePreview: 'संदेश पूर्वावलोकन',
    recipientCount: 'प्राप्तकर्ता',
    estimatedCost: 'अनुमानित लागत',
    free: 'मुफ्त',
    urgent: 'तत्काल',
    normal: 'सामान्य',
    priority: 'प्राथमिकता',
    template: 'टेम्प्लेट',
    selectTemplate: 'टेम्प्लेट चुनें',
    customMessage: 'कस्टम संदेश',
    attendanceReminder: 'उपस्थिति अनुस्मारक',
    examNotification: 'परीक्षा सूचना',
    holidayNotice: 'छुट्टी सूचना',
    feeReminder: 'शुल्क अनुस्मारक',
    eventNotification: 'कार्यक्रम सूचना'
  }
};

const messageTemplates = {
  en: {
    attendanceReminder: "Dear Parent, Your child {studentName} was absent today. Please ensure regular attendance for better academic performance. - {schoolName}",
    examNotification: "Dear Parent, Upcoming exam for {className} on {date}. Please ensure your child is well prepared. - {schoolName}",
    holidayNotice: "Dear Parent, School will remain closed on {date} due to {reason}. Regular classes will resume on {resumeDate}. - {schoolName}",
    feeReminder: "Dear Parent, Fee payment reminder for {studentName} (Class {className}). Due amount: ₹{amount}. Please pay by {dueDate}. - {schoolName}",
    eventNotification: "Dear Parent, We invite you to {eventName} on {date} at {time}. Your participation is valuable. - {schoolName}"
  },
  hi: {
    attendanceReminder: "प्रिय अभिभावक, आपका बच्चा {studentName} आज अनुपस्थित था। बेहतर शैक्षणिक प्रदर्शन के लिए नियमित उपस्थिति सुनिश्चित करें। - {schoolName}",
    examNotification: "प्रिय अभिभावक, {className} की आगामी परीक्षा {date} को है। कृपया अपने बच्चे को अच्छी तरह तैयार कराएं। - {schoolName}",
    holidayNotice: "प्रिय अभिभावक, {reason} के कारण {date} को स्कूल बंद रहेगा। नियमित कक्षाएं {resumeDate} से शुरू होंगी। - {schoolName}",
    feeReminder: "प्रिय अभिभावक, {studentName} (कक्षा {className}) के लिए शुल्क भुगतान अनुस्मारक। देय राशि: ₹{amount}। कृपया {dueDate} तक भुगतान करें। - {schoolName}",
    eventNotification: "प्रिय अभिभावक, हम आपको {eventName} में {date} को {time} बजे आमंत्रित करते हैं। आपकी भागीदारी मूल्यवान है। - {schoolName}"
  }
};

export function SendNotificationModal({ isOpen, onClose, language }: SendNotificationModalProps) {
  const t = translations[language];
  const [formData, setFormData] = useState({
    type: 'sms',
    recipients: 'allParents',
    selectedClasses: [] as string[],
    subject: '',
    message: '',
    schedule: 'sendNow',
    date: '',
    time: '',
    priority: 'normal',
    template: ''
  });

  const classes = ['1-A', '1-B', '2-A', '2-B', '3-A', '3-B', '4-A', '4-B', '5-A', '5-B'];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClassToggle = (className: string) => {
    setFormData(prev => ({
      ...prev,
      selectedClasses: prev.selectedClasses.includes(className)
        ? prev.selectedClasses.filter(c => c !== className)
        : [...prev.selectedClasses, className]
    }));
  };

  const handleTemplateSelect = (template: string) => {
    setFormData(prev => ({
      ...prev,
      template,
      message: (template && template !== 'custom') ? messageTemplates[language][template as keyof typeof messageTemplates[typeof language]] : ''
    }));
  };

  const getRecipientCount = () => {
    if (formData.recipients === 'allParents') return 145;
    if (formData.recipients === 'selectedClasses') return formData.selectedClasses.length * 15;
    return 0;
  };

  const handleSend = () => {
    // Here you would send the notification
    console.log('Sending notification:', formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Bell className="h-6 w-6 text-primary" />
            <span>{t.sendNotification}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Notification Type */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t.notificationType}</h3>
            <div className="grid grid-cols-3 gap-4">
              <Button
                variant={formData.type === 'sms' ? 'default' : 'outline'}
                onClick={() => handleInputChange('type', 'sms')}
                className="h-16 flex flex-col items-center space-y-2"
              >
                <MessageSquare className="h-6 w-6" />
                <span>{t.sms}</span>
              </Button>
              <Button
                variant={formData.type === 'email' ? 'default' : 'outline'}
                onClick={() => handleInputChange('type', 'email')}
                className="h-16 flex flex-col items-center space-y-2"
              >
                <Mail className="h-6 w-6" />
                <span>{t.email}</span>
              </Button>
              <Button
                variant={formData.type === 'both' ? 'default' : 'outline'}
                onClick={() => handleInputChange('type', 'both')}
                className="h-16 flex flex-col items-center space-y-2"
              >
                <div className="flex space-x-1">
                  <MessageSquare className="h-5 w-5" />
                  <Mail className="h-5 w-5" />
                </div>
                <span>{t.both}</span>
              </Button>
            </div>
          </Card>

          {/* Recipients */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t.recipients}</h3>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <Button
                  variant={formData.recipients === 'allParents' ? 'default' : 'outline'}
                  onClick={() => handleInputChange('recipients', 'allParents')}
                  className="flex items-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span>{t.allParents}</span>
                </Button>
                <Button
                  variant={formData.recipients === 'selectedClasses' ? 'default' : 'outline'}
                  onClick={() => handleInputChange('recipients', 'selectedClasses')}
                  className="flex items-center space-x-2"
                >
                  <Users className="h-4 w-4" />
                  <span>{t.selectedClasses}</span>
                </Button>
              </div>

              {formData.recipients === 'selectedClasses' && (
                <div className="grid grid-cols-5 gap-2 mt-4">
                  {classes.map((className) => (
                    <Button
                      key={className}
                      variant={formData.selectedClasses.includes(className) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleClassToggle(className)}
                    >
                      {className}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Message */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t.message}</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="template">{t.template}</Label>
                <Select value={formData.template} onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectTemplate} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">{t.customMessage}</SelectItem>
                    <SelectItem value="attendanceReminder">{t.attendanceReminder}</SelectItem>
                    <SelectItem value="examNotification">{t.examNotification}</SelectItem>
                    <SelectItem value="holidayNotice">{t.holidayNotice}</SelectItem>
                    <SelectItem value="feeReminder">{t.feeReminder}</SelectItem>
                    <SelectItem value="eventNotification">{t.eventNotification}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.type === 'email' || formData.type === 'both') && (
                <div>
                  <Label htmlFor="subject">{t.subject}</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder={t.subject}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="message">{t.message}</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  placeholder={t.message}
                  rows={6}
                />
              </div>

              <div>
                <Label htmlFor="priority">{t.priority}</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.priority} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">{t.normal}</SelectItem>
                    <SelectItem value="urgent">{t.urgent}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Schedule */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">{t.scheduleSend}</h3>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <Button
                  variant={formData.schedule === 'sendNow' ? 'default' : 'outline'}
                  onClick={() => handleInputChange('schedule', 'sendNow')}
                  className="flex items-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>{t.sendNow}</span>
                </Button>
                <Button
                  variant={formData.schedule === 'sendLater' ? 'default' : 'outline'}
                  onClick={() => handleInputChange('schedule', 'sendLater')}
                  className="flex items-center space-x-2"
                >
                  <Calendar className="h-4 w-4" />
                  <span>{t.sendLater}</span>
                </Button>
              </div>

              {formData.schedule === 'sendLater' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">{t.selectDate}</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">{t.selectTime}</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Preview */}
          <Card className="p-6 bg-muted/20">
            <h3 className="text-lg font-semibold mb-4">{t.preview}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center justify-between p-3 bg-card rounded-lg">
                <span className="text-sm text-muted-foreground">{t.recipientCount}</span>
                <Badge variant="secondary">{getRecipientCount()}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-card rounded-lg">
                <span className="text-sm text-muted-foreground">{t.priority}</span>
                <Badge variant={formData.priority === 'urgent' ? 'destructive' : 'default'}>
                  {t[formData.priority as keyof typeof t]}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-card rounded-lg">
                <span className="text-sm text-muted-foreground">{t.estimatedCost}</span>
                <Badge variant="outline">{t.free}</Badge>
              </div>
            </div>
            
            {formData.message && (
              <div className="p-4 bg-card rounded-lg border-l-4 border-primary">
                <h4 className="font-medium mb-2">{t.messagePreview}</h4>
                {formData.subject && (
                  <p className="font-medium text-sm mb-2">Subject: {formData.subject}</p>
                )}
                <p className="text-sm text-muted-foreground">{formData.message}</p>
              </div>
            )}
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              {t.cancel}
            </Button>
            <Button onClick={handleSend} className="bg-primary hover:bg-primary/90">
              <Send className="h-4 w-4 mr-2" />
              {t.send}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}