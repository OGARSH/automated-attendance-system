import React, { useState } from 'react';
import { DataService } from '@/lib/data-service';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { Plus, Upload, Phone, Mail, MapPin } from 'lucide-react';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'hi';
}

const translations = {
  en: {
    addStudent: 'Add New Student',
    studentInfo: 'Student Information',
    firstName: 'First Name',
    lastName: 'Last Name',
    rollNumber: 'Roll Number',
    class: 'Class',
    section: 'Section',
    dateOfBirth: 'Date of Birth',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    other: 'Other',
    parentInfo: 'Parent/Guardian Information',
    parentName: 'Parent/Guardian Name',
    relationship: 'Relationship',
    father: 'Father',
    mother: 'Mother',
    guardian: 'Guardian',
    phoneNumber: 'Phone Number',
    email: 'Email Address',
    address: 'Address',
    emergencyContact: 'Emergency Contact',
    medicalInfo: 'Medical Information',
    bloodGroup: 'Blood Group',
    allergies: 'Allergies (if any)',
    medications: 'Current Medications',
    uploadPhoto: 'Upload Photo',
    save: 'Save Student',
    cancel: 'Cancel',
    required: 'Required',
    optional: 'Optional'
  },
  hi: {
    addStudent: 'नया छात्र जोड़ें',
    studentInfo: 'छात्र की जानकारी',
    firstName: 'पहला नाम',
    lastName: 'अंतिम नाम',
    rollNumber: 'रोल नंबर',
    class: 'कक्षा',
    section: 'अनुभाग',
    dateOfBirth: 'जन्म तिथि',
    gender: 'लिंग',
    male: 'पुरुष',
    female: 'महिला',
    other: 'अन्य',
    parentInfo: 'माता-पिता/अभिभावक की जानकारी',
    parentName: 'माता-पिता/अभिभावक का नाम',
    relationship: 'संबंध',
    father: 'पिता',
    mother: 'माता',
    guardian: 'अभिभावक',
    phoneNumber: 'फोन नंबर',
    email: 'ईमेल पता',
    address: 'पता',
    emergencyContact: 'आपातकालीन संपर्क',
    medicalInfo: 'चिकित्सा जानकारी',
    bloodGroup: 'रक्त समूह',
    allergies: 'एलर्जी (यदि कोई हो)',
    medications: 'वर्तमान दवाएं',
    uploadPhoto: 'फोटो अपलोड करें',
    save: 'छात्र सहेजें',
    cancel: 'रद्द करें',
    required: 'आवश्यक',
    optional: 'वैकल्पिक'
  }
};

export function AddStudentModal({ isOpen, onClose, language }: AddStudentModalProps) {
  const t = translations[language];
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    rollNumber: '',
    class: '',
    section: '',
    dateOfBirth: '',
    gender: '',
    parentName: '',
    relationship: '',
    phoneNumber: '',
    email: '',
    address: '',
    emergencyContact: '',
    bloodGroup: '',
    allergies: '',
    medications: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // TODO: Replace class/section mapping with real class_id from DB
    const classId = Number(formData.class) || 1;

    await DataService.addStudent({
      first_name: formData.firstName,
      last_name: formData.lastName,
      student_id: formData.rollNumber,
      class_id: classId,
      date_of_birth: formData.dateOfBirth,
      email: formData.email || undefined,
      phone: formData.phoneNumber || undefined,
      guardian_name: formData.parentName,
      guardian_phone: formData.phoneNumber,
      guardian_email: undefined,
      address: formData.address || undefined,
    });

    onClose();
    setFormData({
      firstName: '',
      lastName: '',
      rollNumber: '',
      class: '',
      section: '',
      dateOfBirth: '',
      gender: '',
      parentName: '',
      relationship: '',
      phoneNumber: '',
      email: '',
      address: '',
      emergencyContact: '',
      bloodGroup: '',
      allergies: '',
      medications: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-6 w-6 text-primary" />
            <span>{t.addStudent}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                <span className="text-primary font-bold">1</span>
              </div>
              {t.studentInfo}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">{t.firstName} <span className="text-destructive">*</span></Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  placeholder={t.firstName}
                />
              </div>
              <div>
                <Label htmlFor="lastName">{t.lastName} <span className="text-destructive">*</span></Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  placeholder={t.lastName}
                />
              </div>
              <div>
                <Label htmlFor="rollNumber">{t.rollNumber} <span className="text-destructive">*</span></Label>
                <Input
                  id="rollNumber"
                  value={formData.rollNumber}
                  onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                  placeholder="001"
                />
              </div>
              <div>
                <Label htmlFor="class">{t.class} <span className="text-destructive">*</span></Label>
                <Select value={formData.class} onValueChange={(value) => handleInputChange('class', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.class} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="6">6</SelectItem>
                    <SelectItem value="7">7</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="section">{t.section} <span className="text-destructive">*</span></Label>
                <Select value={formData.section} onValueChange={(value) => handleInputChange('section', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.section} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                    <SelectItem value="D">D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dateOfBirth">{t.dateOfBirth} <span className="text-destructive">*</span></Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="gender">{t.gender} <span className="text-destructive">*</span></Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.gender} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t.male}</SelectItem>
                    <SelectItem value="female">{t.female}</SelectItem>
                    <SelectItem value="other">{t.other}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Parent Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                <span className="text-primary font-bold">2</span>
              </div>
              {t.parentInfo}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parentName">{t.parentName} <span className="text-destructive">*</span></Label>
                <Input
                  id="parentName"
                  value={formData.parentName}
                  onChange={(e) => handleInputChange('parentName', e.target.value)}
                  placeholder={t.parentName}
                />
              </div>
              <div>
                <Label htmlFor="relationship">{t.relationship} <span className="text-destructive">*</span></Label>
                <Select value={formData.relationship} onValueChange={(value) => handleInputChange('relationship', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.relationship} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="father">{t.father}</SelectItem>
                    <SelectItem value="mother">{t.mother}</SelectItem>
                    <SelectItem value="guardian">{t.guardian}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="phoneNumber" className="flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  {t.phoneNumber} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  placeholder="+91 9876543210"
                />
              </div>
              <div>
                <Label htmlFor="email" className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  {t.email} <span className="text-muted-foreground text-sm">({t.optional})</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="parent@email.com"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address" className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {t.address} <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder={t.address}
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="emergencyContact">{t.emergencyContact} <span className="text-muted-foreground text-sm">({t.optional})</span></Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder="+91 9876543210"
                />
              </div>
            </div>
          </Card>

          {/* Medical Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                <span className="text-primary font-bold">3</span>
              </div>
              {t.medicalInfo} <span className="text-muted-foreground text-sm ml-2">({t.optional})</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bloodGroup">{t.bloodGroup}</Label>
                <Select value={formData.bloodGroup} onValueChange={(value) => handleInputChange('bloodGroup', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.bloodGroup} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="allergies">{t.allergies}</Label>
                <Input
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  placeholder={t.allergies}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="medications">{t.medications}</Label>
                <Textarea
                  id="medications"
                  value={formData.medications}
                  onChange={(e) => handleInputChange('medications', e.target.value)}
                  placeholder={t.medications}
                  rows={2}
                />
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              {t.cancel}
            </Button>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
              {t.save}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}