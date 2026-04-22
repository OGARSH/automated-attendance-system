import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DataService } from '../lib/data-service';
import { toast } from 'sonner';
import { Plus, BookOpen } from 'lucide-react';

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'hi';
  onClassAdded?: () => void;
}

const translations = {
  en: {
    addNewClass: 'Add New Class',
    createClassDescription: 'Create a new class for your students',
    className: 'Class Name',
    grade: 'Grade',
    section: 'Section',
    capacity: 'Capacity',
    academicYear: 'Academic Year',
    roomNumber: 'Room Number (Optional)',
    cancel: 'Cancel',
    createClass: 'Create Class',
    creating: 'Creating...',
    classNamePlaceholder: 'e.g., Mathematics 5A',
    selectGrade: 'Select grade',
    selectSection: 'Select section',
    capacityPlaceholder: 'Maximum students',
    academicYearPlaceholder: 'e.g., 2024-2025',
    roomNumberPlaceholder: 'e.g., Room 101',
    classCreatedSuccess: 'Class created successfully!',
    createClassError: 'Failed to create class'
  },
  hi: {
    addNewClass: 'नई कक्षा जोड़ें',
    createClassDescription: 'अपने छात्रों के लिए एक नई कक्षा बनाएं',
    className: 'कक्षा का नाम',
    grade: 'कक्षा',
    section: 'वर्ग',
    capacity: 'क्षमता',
    academicYear: 'शैक्षणिक वर्ष',
    roomNumber: 'कमरा संख्या (वैकल्पिक)',
    cancel: 'रद्द करें',
    createClass: 'कक्षा बनाएं',
    creating: 'बना रहे हैं...',
    classNamePlaceholder: 'उदा., गणित 5अ',
    selectGrade: 'कक्षा चुनें',
    selectSection: 'वर्ग चुनें',
    capacityPlaceholder: 'अधिकतम छात्र',
    academicYearPlaceholder: 'उदा., 2024-2025',
    roomNumberPlaceholder: 'उदा., कमरा 101',
    classCreatedSuccess: 'कक्षा सफलतापूर्वक बनाई गई!',
    createClassError: 'कक्षा बनाने में विफल'
  }
};

const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const sections = ['A', 'B', 'C', 'D', 'E', 'F'];

export function AddClassModal({ isOpen, onClose, language, onClassAdded }: AddClassModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    section: '',
    capacity: '',
    academicYear: '',
    roomNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.grade || !formData.section || !formData.capacity || !formData.academicYear) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const classData = {
        name: formData.name,
        grade: formData.grade,
        section: formData.section,
        teacher_id: 1, // This should be the current teacher's ID
        room_number: formData.roomNumber || undefined,
        capacity: parseInt(formData.capacity),
        academic_year: formData.academicYear,
        is_active: true
      };

      await DataService.addClass(classData);
      toast.success(t.classCreatedSuccess);
      
      // Reset form
      setFormData({
        name: '',
        grade: '',
        section: '',
        capacity: '',
        academicYear: '',
        roomNumber: ''
      });
      
      onClose();
      if (onClassAdded) {
        onClassAdded();
      }
    } catch (error) {
      console.error('Error creating class:', error);
      toast.error(t.createClassError);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            {t.addNewClass}
          </DialogTitle>
          <DialogDescription>
            {t.createClassDescription}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="className" className="text-sm font-medium">
              {t.className} *
            </Label>
            <Input
              id="className"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t.classNamePlaceholder}
              className="mt-1.5"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="grade" className="text-sm font-medium">
                {t.grade} *
              </Label>
              <Select value={formData.grade} onValueChange={(value) => handleInputChange('grade', value)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder={t.selectGrade} />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      Grade {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="section" className="text-sm font-medium">
                {t.section} *
              </Label>
              <Select value={formData.section} onValueChange={(value) => handleInputChange('section', value)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder={t.selectSection} />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section} value={section}>
                      Section {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="capacity" className="text-sm font-medium">
                {t.capacity} *
              </Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', e.target.value)}
                placeholder={t.capacityPlaceholder}
                className="mt-1.5"
                min="1"
                max="100"
                required
              />
            </div>

            <div>
              <Label htmlFor="roomNumber" className="text-sm font-medium">
                {t.roomNumber}
              </Label>
              <Input
                id="roomNumber"
                value={formData.roomNumber}
                onChange={(e) => handleInputChange('roomNumber', e.target.value)}
                placeholder={t.roomNumberPlaceholder}
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="academicYear" className="text-sm font-medium">
              {t.academicYear} *
            </Label>
            <Input
              id="academicYear"
              value={formData.academicYear}
              onChange={(e) => handleInputChange('academicYear', e.target.value)}
              placeholder={t.academicYearPlaceholder}
              className="mt-1.5"
              required
            />
          </div>

          <DialogFooter className="gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t.cancel}
            </Button>
            <Button type="submit" disabled={loading} className="min-w-24">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  {t.creating}
                </div>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {t.createClass}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}