import React, { useEffect, useMemo, useState } from 'react';
import { LocalAuth } from '@/lib/auth-local';
import { DataService } from '@/lib/data-service';
import type { TimetableEntry } from '@/lib/local-db';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Badge } from './ui/badge';
import { Toaster } from './ui/sonner';
import { toast } from 'sonner';
import { Lock, UserPlus, LogOut, Search, Plus, KeyRound, Trash2, Pencil, Eye, Shield, GraduationCap, User, Settings, Calendar, Clock, BookOpen } from 'lucide-react';

type Screen = 'login' | 'panel';

type Teacher = { id: number; username: string; role: 'teacher' };
type StudentUser = { id: number; username: string; role: 'student' };

export function AdminDashboard({ onExit }: { onExit: () => void }) {
  const [screen, setScreen] = useState<Screen>('login');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  // Create dialog state
  const [openCreate, setOpenCreate] = useState(false);
  const [newId, setNewId] = useState('');
  const [newPass, setNewPass] = useState('');
  const [busy, setBusy] = useState(false);

  // Timetable dialog state
  const [openTimetable, setOpenTimetable] = useState(false);
  const [timetableForm, setTimetableForm] = useState({
    class_id: '',
    subject: '',
    teacher_id: '',
    day_of_week: '1',
    start_time: '',
    end_time: '',
    room: ''
  });
  const [editingTimetable, setEditingTimetable] = useState<number | null>(null);

  // Class dialog state
  const [openClass, setOpenClass] = useState(false);
  const [classForm, setClassForm] = useState({
    name: '',
    grade: '',
    section: '',
    teacher_id: '',
    room_number: '',
    capacity: '30',
    academic_year: new Date().getFullYear().toString(),
    is_active: true
  });
  const [editingClass, setEditingClass] = useState<number | null>(null);

  useEffect(() => {
    LocalAuth.ensureDefaultAdmin();
  }, []);

  const load = async () => {
    const rows = await LocalAuth.listTeachers();
    setTeachers(rows as any);
    const srows = await LocalAuth.listByRole('student');
    setStudents(srows as any);
    const timetableRows = await DataService.getTimetable();
    setTimetable(timetableRows);
    const classRows = await DataService.getClasses();
    setClasses(classRows);
  };

  const login = async () => {
    setError('');
    const u = await LocalAuth.login(username, password);
    if (!u || u.role !== 'admin') {
      setError('Invalid admin credentials');
      return;
    }
    setScreen('panel');
    await load();
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter(t => t.username.toLowerCase().includes(q));
  }, [teachers, query]);

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return students;
    return students.filter(s => s.username.toLowerCase().includes(q));
  }, [students, query]);

  const createTeacher = async () => {
    if (!newId || !newPass) return;
    setBusy(true);
    try {
      await LocalAuth.createTeacherAccount(newId, newPass);
      setNewId('');
      setNewPass('');
      setOpenCreate(false);
      await load();
      toast.success(`Teacher "${newId}" created successfully!`);
    } catch (e) {
      toast.error((e as any)?.message ?? 'Failed to create teacher');
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async (id: number, role: string) => {
    const newPwd = prompt(`Enter a new password for this ${role}:`);
    if (!newPwd) return;
    try {
      await LocalAuth.resetPassword(id, newPwd);
      toast.success(`Password reset successfully!`);
    } catch (e) {
      toast.error('Failed to reset password');
    }
  };

  const deleteTeacher = async (id: number) => {
    await LocalAuth.deleteUser(id);
    await load();
    toast.success('Teacher deleted successfully');
  };

  const renameUser = async (id: number, current: string, role: string) => {
    const newName = prompt(`Enter new username for ${role}:`, current);
    if (!newName || newName === current) return;
    try {
      await LocalAuth.renameUser(id, newName);
      await load();
      toast.success(`${role} renamed to "${newName}"`);
    } catch (e) {
      toast.error((e as any)?.message ?? 'Rename failed');
    }
  };

  const showPasswordHash = async (id: number) => {
    const hash = await LocalAuth.getPasswordHash(id);
    if (hash) {
      navigator.clipboard.writeText(hash);
      toast.success('Password hash copied to clipboard!');
    }
  };

  const addTimetableEntry = async () => {
    if (!timetableForm.class_id || !timetableForm.subject || !timetableForm.teacher_id || !timetableForm.start_time || !timetableForm.end_time) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setBusy(true);
    try {
      if (editingTimetable) {
        await DataService.updateTimetableEntry(editingTimetable, {
          class_id: parseInt(timetableForm.class_id),
          subject: timetableForm.subject,
          teacher_id: parseInt(timetableForm.teacher_id),
          day_of_week: parseInt(timetableForm.day_of_week),
          start_time: timetableForm.start_time,
          end_time: timetableForm.end_time,
          room: timetableForm.room
        });
        toast.success('Timetable entry updated successfully');
      } else {
        await DataService.addTimetableEntry({
          class_id: parseInt(timetableForm.class_id),
          subject: timetableForm.subject,
          teacher_id: parseInt(timetableForm.teacher_id),
          day_of_week: parseInt(timetableForm.day_of_week),
          start_time: timetableForm.start_time,
          end_time: timetableForm.end_time,
          room: timetableForm.room
        });
        toast.success('Timetable entry added successfully');
      }
      
      await load();
      setOpenTimetable(false);
      setTimetableForm({
        class_id: '',
        subject: '',
        teacher_id: '',
        day_of_week: '1',
        start_time: '',
        end_time: '',
        room: ''
      });
      setEditingTimetable(null);
    } catch (e) {
      toast.error((e as any)?.message ?? 'Failed to save timetable entry');
    }
    setBusy(false);
  };

  const editTimetableEntry = (entry: TimetableEntry) => {
    setTimetableForm({
      class_id: entry.class_id.toString(),
      subject: entry.subject,
      teacher_id: entry.teacher_id.toString(),
      day_of_week: entry.day_of_week.toString(),
      start_time: entry.start_time,
      end_time: entry.end_time,
      room: entry.room || ''
    });
    setEditingTimetable(entry.id!);
    setOpenTimetable(true);
  };

  const deleteTimetableEntry = async (id: number) => {
    await DataService.deleteTimetableEntry(id);
    await load();
    toast.success('Timetable entry deleted successfully');
  };

  const addClassEntry = async () => {
    if (!classForm.name || !classForm.grade || !classForm.section || !classForm.teacher_id) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setBusy(true);
    try {
      if (editingClass) {
        // For editing, we'd need to implement updateClass in DataService
        toast.info('Class editing not yet implemented');
      } else {
        await DataService.addClass({
          name: classForm.name,
          grade: classForm.grade,
          section: classForm.section,
          teacher_id: parseInt(classForm.teacher_id),
          room_number: classForm.room_number,
          capacity: parseInt(classForm.capacity),
          academic_year: classForm.academic_year,
          is_active: classForm.is_active
        });
        toast.success('Class added successfully');
      }
      
      await load();
      setOpenClass(false);
      setClassForm({
        name: '',
        grade: '',
        section: '',
        teacher_id: '',
        room_number: '',
        capacity: '30',
        academic_year: new Date().getFullYear().toString(),
        is_active: true
      });
      setEditingClass(null);
    } catch (e) {
      toast.error((e as any)?.message ?? 'Failed to save class');
    }
    setBusy(false);
  };

  const deleteClass = async (id: number) => {
    // Check if class has students or timetable entries
    const hasSchedule = timetable.some(entry => entry.class_id === id);
    if (hasSchedule) {
      toast.error('Cannot delete class with existing timetable entries');
      return;
    }
    
    try {
      // We'd need to implement deleteClass in DataService
      toast.info('Class deletion not yet fully implemented');
      // await DataService.deleteClass(id);
      // await load();
      // toast.success('Class deleted successfully');
    } catch (e) {
      toast.error('Failed to delete class');
    }
  };

  if (screen === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center p-4">
        <Toaster />
        <Card className="w-full max-w-sm backdrop-blur-sm bg-card/80 border-border/50 shadow-2xl">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-full">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Admin Login</h2>
                <p className="text-sm text-muted-foreground">Secure access required</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Username</Label>
                <Input 
                  value={username} 
                  onChange={e => setUsername(e.target.value)}
                  className="mt-1.5"
                  placeholder="Enter admin username"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Password</Label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  className="mt-1.5"
                  placeholder="Enter admin password"
                />
              </div>
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button className="flex-1 h-11" onClick={login}>
                  <Lock className="h-4 w-4 mr-2" />
                  Login
                </Button>
                <Button variant="outline" className="h-11" onClick={onExit}>
                  Back
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <Toaster />
      <div className="p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 md:space-x-4">
              <div className="p-2 md:p-3 bg-primary/10 rounded-xl">
                <Shield className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Admin Control Panel
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">Manage teacher and student accounts stored locally</p>
              </div>
            </div>
            <Button variant="outline" onClick={onExit} className="h-10 md:h-11 w-full sm:w-auto">
              <LogOut className="h-4 w-4 mr-2" /> 
              Exit Admin
            </Button>
          </div>

          <Tabs defaultValue="teachers" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto md:h-12 gap-1 md:gap-0 p-1">
              <TabsTrigger value="teachers" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3">
                <GraduationCap className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Teachers</span>
                <span className="sm:hidden">T</span>
              </TabsTrigger>
              <TabsTrigger value="students" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3">
                <User className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Students</span>
                <span className="sm:hidden">S</span>
              </TabsTrigger>
              <TabsTrigger value="classes" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3">
                <BookOpen className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Classes</span>
                <span className="sm:hidden">C</span>
              </TabsTrigger>
              <TabsTrigger value="timetable" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3">
                <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Timetable</span>
                <span className="sm:hidden">TT</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm p-2 md:p-3">
                <Settings className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Settings</span>
                <span className="sm:hidden">⚙</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="teachers" className="mt-4 md:mt-6">
              <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg md:text-xl">Teachers</CardTitle>
                        <CardDescription className="text-sm">Manage teacher accounts and permissions</CardDescription>
                      </div>
                    </div>
                    <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                      <DialogTrigger asChild>
                        <Button className="h-10 shadow-lg w-full sm:w-auto">
                          <Plus className="h-4 w-4 mr-2" /> 
                          New Teacher
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] max-w-md mx-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2 text-lg">
                            <UserPlus className="h-5 w-5" />
                            Create Teacher Account
                          </DialogTitle>
                          <DialogDescription className="text-sm">
                            Enter a unique teacher ID and secure password
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label className="text-sm font-medium">Teacher ID</Label>
                            <Input 
                              value={newId} 
                              onChange={e => setNewId(e.target.value)} 
                              placeholder="e.g. TEACHER100"
                              className="mt-1.5"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Password</Label>
                            <Input 
                              type="password" 
                              value={newPass} 
                              onChange={e => setNewPass(e.target.value)}
                              placeholder="Enter secure password"
                              className="mt-1.5"
                            />
                          </div>
                        </div>
                        <DialogFooter className="gap-3">
                          <Button variant="outline" onClick={() => setOpenCreate(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={createTeacher} 
                            disabled={busy || !newId || !newPass}
                            className="min-w-24"
                          >
                            {busy ? (
                              <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                Creating...
                              </div>
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Create
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="relative flex-1 w-full sm:max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        className="pl-10 h-10" 
                        placeholder="Search teachers..." 
                        value={query} 
                        onChange={e => setQuery(e.target.value)} 
                      />
                    </div>
                    <Badge variant="secondary" className="px-3 py-1">
                      {filtered.length} teacher{filtered.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="rounded-lg border overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold min-w-[120px]">Teacher ID</TableHead>
                            <TableHead className="font-semibold min-w-[80px]">Role</TableHead>
                            <TableHead className="text-right font-semibold min-w-[200px]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filtered.map(t => (
                            <TableRow key={t.id} className="hover:bg-muted/30 transition-colors">
                              <TableCell className="font-medium">{t.username}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="gap-1">
                                  <GraduationCap className="h-3 w-3" />
                                  <span className="hidden sm:inline">Teacher</span>
                                  <span className="sm:hidden">T</span>
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1 md:gap-2">
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="outline" size="sm" onClick={async () => { await resetPassword(t.id, 'teacher'); }}>
                                        <KeyRound className="h-3 w-3 md:h-4 md:w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Reset Password</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="outline" size="sm" onClick={() => renameUser(t.id, t.username, 'teacher')}>
                                        <Pencil className="h-3 w-3 md:h-4 md:w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Rename User</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="outline" size="sm" onClick={() => showPasswordHash(t.id)}>
                                        <Eye className="h-3 w-3 md:h-4 md:w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Copy Password Hash</TooltipContent>
                                  </Tooltip>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="destructive" size="sm">
                                        <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="w-[95vw] max-w-lg mx-auto">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete teacher account?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will permanently remove the account "{t.username}" from this device. This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={async () => deleteTeacher(t.id)}>
                                        Delete Account
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filtered.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                              <div className="flex flex-col items-center gap-2">
                                <GraduationCap className="h-8 w-8 opacity-50" />
                                <span>No teachers found</span>
                                {query && <span className="text-sm">Try adjusting your search</span>}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="students" className="mt-6">
              <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Students</CardTitle>
                        <CardDescription>Manage student login accounts</CardDescription>
                      </div>
                    </div>
                    <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                      <DialogTrigger asChild>
                        <Button className="h-10 shadow-lg">
                          <Plus className="h-4 w-4 mr-2" /> 
                          New Student
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5" />
                            Create Student Account
                          </DialogTitle>
                          <DialogDescription>
                            Enter a unique student ID and secure password
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label className="text-sm font-medium">Student ID</Label>
                            <Input 
                              value={newId} 
                              onChange={e => setNewId(e.target.value)} 
                              placeholder="e.g. STU100"
                              className="mt-1.5"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Password</Label>
                            <Input 
                              type="password" 
                              value={newPass} 
                              onChange={e => setNewPass(e.target.value)}
                              placeholder="Enter secure password"
                              className="mt-1.5"
                            />
                          </div>
                        </div>
                        <DialogFooter className="gap-3">
                          <Button variant="outline" onClick={() => setOpenCreate(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={async () => { 
                              setBusy(true); 
                              try { 
                                await LocalAuth.createStudentAccount(newId, newPass); 
                                setNewId(''); 
                                setNewPass(''); 
                                setOpenCreate(false); 
                                await load(); 
                                toast.success(`Student "${newId}" created successfully!`);
                              } catch (e) { 
                                toast.error((e as any)?.message ?? 'Failed to create student'); 
                              } finally { 
                                setBusy(false); 
                              } 
                            }} 
                            disabled={busy || !newId || !newPass}
                            className="min-w-24"
                          >
                            {busy ? (
                              <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                Creating...
                              </div>
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Create
                              </>
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        className="pl-10 h-10" 
                        placeholder="Search students..." 
                        value={query} 
                        onChange={e => setQuery(e.target.value)} 
                      />
                    </div>
                    <Badge variant="secondary" className="px-3 py-1">
                      {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">Student ID</TableHead>
                          <TableHead className="font-semibold">Role</TableHead>
                          <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map(s => (
                          <TableRow key={s.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium">{s.username}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="gap-1 text-blue-600 border-blue-200">
                                <User className="h-3 w-3" />
                                Student
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="outline" size="sm" onClick={async () => { await resetPassword(s.id, 'student'); }}>
                                      <KeyRound className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Reset Password</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="outline" size="sm" onClick={() => renameUser(s.id, s.username, 'student')}>
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Rename User</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="outline" size="sm" onClick={() => showPasswordHash(s.id)}>
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Copy Password Hash</TooltipContent>
                                </Tooltip>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete student account?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently remove the account "{s.username}" from this device. This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={async () => { 
                                        await LocalAuth.deleteUser(s.id); 
                                        await load(); 
                                        toast.success('Student deleted successfully');
                                      }}>
                                        Delete Account
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {filteredStudents.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                              <div className="flex flex-col items-center gap-2">
                                <User className="h-8 w-8 opacity-50" />
                                <span>No students found</span>
                                {query && <span className="text-sm">Try adjusting your search</span>}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="classes" className="mt-6">
              <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Classes</CardTitle>
                        <CardDescription>Manage school classes and assignments</CardDescription>
                      </div>
                    </div>
                    <Dialog open={openClass} onOpenChange={setOpenClass}>
                      <DialogTrigger asChild>
                        <Button className="h-10 shadow-lg">
                          <Plus className="h-4 w-4 mr-2" /> 
                          New Class
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            {editingClass ? 'Edit Class' : 'Create New Class'}
                          </DialogTitle>
                          <DialogDescription>
                            Add a new class with teacher assignment
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label htmlFor="class_name">Class Name</Label>
                            <Input
                              id="class_name"
                              value={classForm.name}
                              onChange={e => setClassForm({...classForm, name: e.target.value})}
                              placeholder="e.g., Mathematics - Grade 10A"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="grade">Grade</Label>
                              <Input
                                id="grade"
                                value={classForm.grade}
                                onChange={e => setClassForm({...classForm, grade: e.target.value})}
                                placeholder="e.g., 10"
                              />
                            </div>
                            <div>
                              <Label htmlFor="section">Section</Label>
                              <Input
                                id="section"
                                value={classForm.section}
                                onChange={e => setClassForm({...classForm, section: e.target.value})}
                                placeholder="e.g., A"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="class_teacher">Class Teacher</Label>
                            <select
                              id="class_teacher"
                              value={classForm.teacher_id}
                              onChange={e => setClassForm({...classForm, teacher_id: e.target.value})}
                              className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                            >
                              <option value="">Select Teacher</option>
                              {teachers.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>
                                  {teacher.username}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="room_number">Room Number</Label>
                              <Input
                                id="room_number"
                                value={classForm.room_number}
                                onChange={e => setClassForm({...classForm, room_number: e.target.value})}
                                placeholder="e.g., 101"
                              />
                            </div>
                            <div>
                              <Label htmlFor="capacity">Capacity</Label>
                              <Input
                                id="capacity"
                                type="number"
                                value={classForm.capacity}
                                onChange={e => setClassForm({...classForm, capacity: e.target.value})}
                                placeholder="30"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="academic_year">Academic Year</Label>
                            <Input
                              id="academic_year"
                              value={classForm.academic_year}
                              onChange={e => setClassForm({...classForm, academic_year: e.target.value})}
                              placeholder="2025"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            onClick={addClassEntry}
                            disabled={busy}
                            className="w-full"
                          >
                            {busy ? 'Saving...' : (editingClass ? 'Update Class' : 'Create Class')}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">ID</TableHead>
                          <TableHead className="font-semibold">Class Name</TableHead>
                          <TableHead className="font-semibold">Grade</TableHead>
                          <TableHead className="font-semibold">Section</TableHead>
                          <TableHead className="font-semibold">Teacher</TableHead>
                          <TableHead className="font-semibold">Room</TableHead>
                          <TableHead className="font-semibold">Capacity</TableHead>
                          <TableHead className="font-semibold">Year</TableHead>
                          <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classes.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              No classes found. Create your first class above.
                            </TableCell>
                          </TableRow>
                        ) : (
                          classes.map((cls) => {
                            const teacher = teachers.find(t => t.id === cls.teacher_id);
                            return (
                              <TableRow key={cls.id} className="hover:bg-muted/50">
                                <TableCell className="font-medium">
                                  <Badge variant="outline">#{cls.id}</Badge>
                                </TableCell>
                                <TableCell className="font-medium">{cls.name}</TableCell>
                                <TableCell>{cls.grade}</TableCell>
                                <TableCell>{cls.section}</TableCell>
                                <TableCell>
                                  {teacher ? teacher.username : 'Unassigned'}
                                </TableCell>
                                <TableCell>{cls.room_number || '-'}</TableCell>
                                <TableCell>{cls.capacity}</TableCell>
                                <TableCell>{cls.academic_year}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => toast.info('Edit class functionality coming soon')}
                                          className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                                        >
                                          <Pencil className="h-3 w-3" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Edit class</TooltipContent>
                                    </Tooltip>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Delete Class</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete "{cls.name}"? This will also remove all associated timetable entries.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => deleteClass(cls.id)}
                                            className="bg-red-600 hover:bg-red-700"
                                          >
                                            Delete
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* ID Reference Guide */}
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      <span className="font-semibold text-blue-900 dark:text-blue-100">📋 Quick Reference</span>
                    </div>
                    <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                      <strong>Class IDs:</strong> Use the ID numbers shown above when creating timetable entries. 
                      <br />
                      <strong>Teacher IDs:</strong> Find teacher IDs in the Teachers tab for timetable assignments.
                      <br />
                      <strong>Example:</strong> Class "Mathematics - Grade 10A" has ID #{classes.find(c => c.name.includes('Mathematics'))?.id || 'X'}, Teacher "John Doe" has ID #{teachers[0]?.id || 'Y'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timetable" className="mt-6">
              <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Timetable</CardTitle>
                        <CardDescription>Manage class schedules and timing</CardDescription>
                      </div>
                    </div>
                    <Dialog open={openTimetable} onOpenChange={setOpenTimetable}>
                      <DialogTrigger asChild>
                        <Button className="h-10 shadow-lg">
                          <Plus className="h-4 w-4 mr-2" /> 
                          Add Schedule
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            {editingTimetable ? 'Edit Schedule' : 'Add Schedule'}
                          </DialogTitle>
                          <DialogDescription>
                            Create a new class schedule entry
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="class_id">Class</Label>
                              <select
                                id="class_id"
                                value={timetableForm.class_id}
                                onChange={e => setTimetableForm({...timetableForm, class_id: e.target.value})}
                                className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                              >
                                <option value="">Select Class</option>
                                {classes.map(cls => (
                                  <option key={cls.id} value={cls.id}>
                                    {cls.grade} - {cls.section}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <Label htmlFor="subject">Subject</Label>
                              <Input
                                id="subject"
                                value={timetableForm.subject}
                                onChange={e => setTimetableForm({...timetableForm, subject: e.target.value})}
                                placeholder="e.g., Mathematics"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="teacher_id">Teacher</Label>
                              <select
                                id="teacher_id"
                                value={timetableForm.teacher_id}
                                onChange={e => setTimetableForm({...timetableForm, teacher_id: e.target.value})}
                                className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                              >
                                <option value="">Select Teacher</option>
                                {teachers.map(teacher => (
                                  <option key={teacher.id} value={teacher.id}>
                                    {teacher.username}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <Label htmlFor="day_of_week">Day</Label>
                              <select
                                id="day_of_week"
                                value={timetableForm.day_of_week}
                                onChange={e => setTimetableForm({...timetableForm, day_of_week: e.target.value})}
                                className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                              >
                                <option value="1">Monday</option>
                                <option value="2">Tuesday</option>
                                <option value="3">Wednesday</option>
                                <option value="4">Thursday</option>
                                <option value="5">Friday</option>
                                <option value="6">Saturday</option>
                                <option value="0">Sunday</option>
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="start_time">Start Time</Label>
                              <Input
                                id="start_time"
                                type="time"
                                value={timetableForm.start_time}
                                onChange={e => setTimetableForm({...timetableForm, start_time: e.target.value})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="end_time">End Time</Label>
                              <Input
                                id="end_time"
                                type="time"
                                value={timetableForm.end_time}
                                onChange={e => setTimetableForm({...timetableForm, end_time: e.target.value})}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="room">Room (Optional)</Label>
                            <Input
                              id="room"
                              value={timetableForm.room}
                              onChange={e => setTimetableForm({...timetableForm, room: e.target.value})}
                              placeholder="e.g., Room 101"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            onClick={addTimetableEntry}
                            disabled={busy}
                            className="w-full"
                          >
                            {busy ? 'Saving...' : (editingTimetable ? 'Update Schedule' : 'Add Schedule')}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">Day</TableHead>
                          <TableHead className="font-semibold">Time</TableHead>
                          <TableHead className="font-semibold">Subject</TableHead>
                          <TableHead className="font-semibold">Class</TableHead>
                          <TableHead className="font-semibold">Teacher</TableHead>
                          <TableHead className="font-semibold">Room</TableHead>
                          <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {timetable.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              No schedule entries found. Add your first schedule entry above.
                            </TableCell>
                          </TableRow>
                        ) : (
                          timetable
                            .sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time))
                            .map((entry) => {
                              const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                              const classInfo = classes.find(c => c.id === entry.class_id);
                              const teacherInfo = teachers.find(t => t.id === entry.teacher_id);
                              
                              return (
                                <TableRow key={entry.id} className="hover:bg-muted/50">
                                  <TableCell className="font-medium">
                                    <Badge variant="outline" className="font-normal">
                                      {dayNames[entry.day_of_week]}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-sm">{entry.start_time} - {entry.end_time}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <BookOpen className="h-3 w-3 text-muted-foreground" />
                                      <span>{entry.subject}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {classInfo ? `${classInfo.grade} - ${classInfo.section}` : 'Unknown'}
                                  </TableCell>
                                  <TableCell>
                                    {teacherInfo ? teacherInfo.username : 'Unknown'}
                                  </TableCell>
                                  <TableCell>
                                    {entry.room || '-'}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => editTimetableEntry(entry)}
                                            className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
                                          >
                                            <Pencil className="h-3 w-3" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Edit schedule</TooltipContent>
                                      </Tooltip>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Schedule Entry</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Are you sure you want to delete this schedule entry for {entry.subject}? This action cannot be undone.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() => deleteTimetableEntry(entry.id!)}
                                              className="bg-red-600 hover:bg-red-700"
                                            >
                                              Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* ID Reference Guide for Timetable */}
                  <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                      <span className="font-semibold text-purple-900 dark:text-purple-100">🆔 ID Reference Guide</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Available Class IDs:</h4>
                        <div className="space-y-1 text-sm text-purple-700 dark:text-purple-300">
                          {classes.slice(0, 3).map(cls => (
                            <div key={cls.id} className="flex justify-between">
                              <span>#{cls.id}</span>
                              <span>{cls.grade} - {cls.section}</span>
                            </div>
                          ))}
                          {classes.length > 3 && <div className="text-xs opacity-75">...and {classes.length - 3} more in Classes tab</div>}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Available Teacher IDs:</h4>
                        <div className="space-y-1 text-sm text-purple-700 dark:text-purple-300">
                          {teachers.slice(0, 3).map(teacher => (
                            <div key={teacher.id} className="flex justify-between">
                              <span>#{teacher.id}</span>
                              <span>{teacher.username}</span>
                            </div>
                          ))}
                          {teachers.length > 3 && <div className="text-xs opacity-75">...and {teachers.length - 3} more in Teachers tab</div>}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700">
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        💡 <strong>Tip:</strong> Check the Classes and Teachers tabs to see all available IDs before creating timetable entries.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-xl">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Settings className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Settings</CardTitle>
                      <CardDescription>System configuration and storage settings</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        <span className="font-semibold text-blue-900 dark:text-blue-100">Local Storage Mode</span>
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                        This application is currently using local-only storage (IndexedDB). Teacher and student accounts, 
                        along with all attendance data, are stored exclusively on this device. No data is sent to external servers.
                      </p>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-2 w-2 bg-amber-500 rounded-full"></div>
                        <span className="font-semibold text-amber-900 dark:text-amber-100">Security Notice</span>
                      </div>
                      <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                        Passwords are stored using SHA-256 hashing for security. The "Show Password Hash" feature 
                        displays the hash for verification purposes only - original passwords cannot be recovered.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
