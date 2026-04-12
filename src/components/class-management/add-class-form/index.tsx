'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Upload, Trash2, Edit2, Check, X as XClose } from 'lucide-react';
import * as XLSX from 'xlsx';
import { showToast } from '@/components/ui/toaster';

interface Student {
  id?: string | number;
  name: string;
  regNo: string;
  Q1: string;
  Q2: string;
  Q3: string;
  Q4: string;
  Q5: string;
  Q6: string;
  A1: string;
  A2: string;
  A3: string;
  A4: string;
  A5: string;
  mids: string;
  att: string;
}

interface AddClassFormProps {
  editClassId?: string | number;
}

function normalizeStudentId(value: unknown): Student['id'] {
  if (typeof value === 'string' || typeof value === 'number')
    return value;

  if (typeof value === 'bigint')
    return value.toString();

  return undefined;
}

export function AddClassForm({ editClassId }: AddClassFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!editClassId);
  const [editingRowId, setEditingRowId] = useState<string | number | null>(null);
  const [classData, setClassData] = useState({
    name: '',
    subject: '',
    section: '',
    semester: ''
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    regNo: '',
    Q1: '',
    Q2: '',
    Q3: '',
    Q4: '',
    Q5: '',
    Q6: '',
    A1: '',
    A2: '',
    A3: '',
    A4: '',
    A5: '',
    mids: '',
    att: ''
  });

  useEffect(() => {
    if (editClassId) {
      const loadClassDetails = async () => {
        try {
          const response = await fetch(`/api/teacher/classes/${editClassId}`, {
            method: 'GET',
            credentials: 'include'
          });

          const payload: Record<string, unknown> = await response.json();
          if (!response.ok)
            throw new Error(String(payload?.message || 'Failed to load class details'));

          const responseData = payload.data && typeof payload.data === 'object'
            ? (payload.data as Record<string, unknown>)
            : payload;

          const classInfo = responseData.class && typeof responseData.class === 'object'
            ? (responseData.class as Record<string, unknown>)
            : responseData;

          const studentsList = Array.isArray(responseData.students)
            ? responseData.students
            : [];

          setClassData({
            name: String(classInfo.name || ''),
            subject: String(classInfo.subject || classInfo.code || ''),
            section: String(classInfo.section || ''),
            semester: String(classInfo.semester || '')
          });

          setStudents(
            studentsList
              .filter((student): student is Record<string, unknown> => typeof student === 'object' && student !== null)
              .map((student) => ({
                id: normalizeStudentId(student.id),
                name: String(student.name || ''),
                regNo: String(student.regNo || ''),
                Q1: String(student.quiz1 ?? ''),
                Q2: String(student.quiz2 ?? ''),
                Q3: String(student.quiz3 ?? ''),
                Q4: String(student.quiz4 ?? ''),
                Q5: String(student.quiz5 ?? ''),
                Q6: String(student.quiz6 ?? ''),
                A1: String(student.assignment1 ?? ''),
                A2: String(student.assignment2 ?? ''),
                A3: String(student.assignment3 ?? ''),
                A4: String(student.assignment4 ?? ''),
                A5: String(student.assignment5 ?? ''),
                mids: String(student.midsPercentage ?? ''),
                att: String(student.attendancePercentage ?? '')
              }))
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to load class';
          showToast.error(message);
        } finally {
          setIsLoading(false);
        }
      };

      void loadClassDetails();
    }
  }, [editClassId]);

  const toNumber = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const handleClassInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClassData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddStudent = () => {
    if (!formData.name || !formData.regNo) {
      showToast.error('Please fill in Name and Reg-No');
      return;
    }

    const newStudent: Student = {
      id: `${Date.now()}-${Math.random()}`,
      ...formData
    };

    setStudents(prev => [...prev, newStudent]);
    setFormData({
      name: '',
      regNo: '',
      Q1: '',
      Q2: '',
      Q3: '',
      Q4: '',
      Q5: '',
      Q6: '',
      A1: '',
      A2: '',
      A3: '',
      A4: '',
      A5: '',
      mids: '',
      att: ''
    });
  };

  const handleDeleteStudent = (id: string | number | undefined) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const handleEditRow = (id: string | number | undefined) => {
    setEditingRowId(id ?? null);
  };

  const handleSaveRow = (_id: string | number | undefined) => {
    setEditingRowId(null);
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const importedStudents: Student[] = jsonData.map((row: any, index: number) => ({
          id: `${Date.now()}-${index}`,
          name: row.Name || row.name || '',
          regNo: row['Reg-No'] || row['reg-no'] || row.regNo || row['Registration Number'] || '',
          Q1: String(row.Q1 || row.Q1 || ''),
          Q2: String(row.Q2 || row.Q2 || ''),
          Q3: String(row.Q3 || row.Q3 || ''),
          Q4: String(row.Q4 || row.Q4 || ''),
          Q5: String(row.Q5 || row.Q5 || ''),
          Q6: String(row.Q6 || row.quiz6 || row.Quiz6 || ''),
          A1: String(row.A1 || row.A1 || ''),
          A2: String(row.A2 || row.A2 || ''),
          A3: String(row.A3 || row.A3 || ''),
          A4: String(row.A4 || row.A4 || ''),
          A5: String(row.A5 || row.assignment5 || row.Assignment5 || ''),
          mids: String(row.Mids || row.MIDS || row.mids || ''),
          att: String(row.Att || row.ATT || row.att || row.Attendance || row.attendancePercentage || '')
        }));

        setStudents(prev => [...prev, ...importedStudents]);
      } catch (error) {
        showToast.error('Error reading file. Please ensure it is a valid Excel or CSV file.');
        console.error(error);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleCancel = () => {
    router.push('/class-management');
  };

  const handleSaveClassAndStudents = async () => {
    if (editingRowId !== null) {
      showToast.error('Please finish editing the current row first');
      return;
    }
    if (!classData.name || !classData.subject || !classData.section || !classData.semester) {
      showToast.error('Please fill all class fields first.');
      return;
    }

    if (students.length === 0) {
      showToast.error('Please add at least one student before saving.');
      return;
    }

    const payload = {
      class: {
        name: classData.name,
        subject: classData.subject,
        section: classData.section,
        semester: classData.semester
      },
      students: students.map((student) => ({
        name: student.name,
        regNo: student.regNo,
        quiz1: toNumber(student.Q1),
        quiz2: toNumber(student.Q2),
        quiz3: toNumber(student.Q3),
        quiz4: toNumber(student.Q4),
        quiz5: toNumber(student.Q5),
        quiz6: toNumber(student.Q6),
        assignment1: toNumber(student.A1),
        assignment2: toNumber(student.A2),
        assignment3: toNumber(student.A3),
        assignment4: toNumber(student.A4),
        assignment5: toNumber(student.A5),
        midsPercentage: toNumber(student.mids),
        attendancePercentage: toNumber(student.att.replace('%', ''))
      }))
    };

    try {
      setIsSaving(true);
      const url = editClassId
        ? `/api/teacher/classes/${editClassId}/update`
        : '/api/teacher/new-class-with-students';
      const method = editClassId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result?.success)
        throw new Error(result?.message || 'Failed to save class and students');

      showToast.success(result.message || 'Class and students saved successfully');
      router.push('/class-management');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save data';
      showToast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className='animate-pulse space-y-5'>
        <div className='rounded-[10px] border border-gray-200 bg-white p-5 space-y-4'>
          <div className='h-5 w-36 rounded-full bg-gray-200' />
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4'>
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className='space-y-2'>
                <div className='h-4 w-24 rounded-full bg-gray-200' />
                <div className='h-10 rounded-md bg-gray-200' />
              </div>
            ))}
          </div>
        </div>

        <div className='rounded-[10px] border border-gray-200 bg-white p-5 space-y-3'>
          <div className='h-5 w-48 rounded-full bg-gray-200' />
          {[0, 1, 2, 3, 4].map((index) => (
            <div key={index} className='h-9 rounded-md bg-gray-100' />
          ))}
        </div>
      </div>
    );

  return (
    <div className='w-full' style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid rgba(0, 0, 0, 0.18)' }}>
      <div className='p-6'>
        {/* Class Details Section */}
        <div className='mb-6' style={{ border: '1px solid rgba(0, 0, 0, 0.2)', borderRadius: '10px', padding: '20px', backgroundColor: '#FCFCFC' }}>
          <p className='text-[16px] font-semibold mb-4' style={{ color: '#000000' }}>
            Class Details
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
            <div className='flex flex-col gap-1.5'>
              <label className='block text-sm font-medium' style={{ color: 'rgba(0, 0, 0, 0.75)' }}>Class Name</label>
              <Input
                type='text'
                name='name'
                placeholder='BSCS-6A'
                value={classData.name}
                onChange={handleClassInputChange}
                className='h-10 w-full bg-white placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-black/30 focus-visible:ring-offset-0'
                style={{ borderRadius: '5px', border: '1px solid rgba(0, 0, 0, 0.2)', fontSize: '14px' }}
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='block text-sm font-medium' style={{ color: 'rgba(0, 0, 0, 0.75)' }}>Subject</label>
              <Input
                type='text'
                name='subject'
                placeholder='CS-601'
                value={classData.subject}
                onChange={handleClassInputChange}
                className='h-10 w-full bg-white placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-black/30 focus-visible:ring-offset-0'
                style={{ borderRadius: '5px', border: '1px solid rgba(0, 0, 0, 0.2)', fontSize: '14px' }}
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='block text-sm font-medium' style={{ color: 'rgba(0, 0, 0, 0.75)' }}>Section</label>
              <Input
                type='text'
                name='section'
                placeholder='A'
                value={classData.section}
                onChange={handleClassInputChange}
                className='h-10 w-full bg-white placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-black/30 focus-visible:ring-offset-0'
                style={{ borderRadius: '5px', border: '1px solid rgba(0, 0, 0, 0.2)', fontSize: '14px' }}
              />
            </div>

            <div className='flex flex-col gap-1.5'>
              <label className='block text-sm font-medium' style={{ color: 'rgba(0, 0, 0, 0.75)' }}>Semester</label>
              <Input
                type='text'
                name='semester'
                placeholder='Spring 2026'
                value={classData.semester}
                onChange={handleClassInputChange}
                className='h-10 w-full bg-white placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-black/30 focus-visible:ring-offset-0'
                style={{ borderRadius: '5px', border: '1px solid rgba(0, 0, 0, 0.2)', fontSize: '14px' }}
              />
            </div>
          </div>
        </div>

        {/* Manual Entry Section */}
        <div style={{ border: '1px solid rgba(0, 0, 0, 0.2)', borderRadius: '10px', padding: '24px', backgroundColor: '#FCFCFC' }}>
         
          {/* All Fields in One Row */}
          <div className='mb-5'>
            <div className='flex gap-2 flex-nowrap items-end w-full min-w-0 pb-1'>
            {/* Name Field */}
            <div className='flex flex-col gap-1.5 min-w-0' style={{ flex: '2 1 220px' }}>
              <label className='block text-sm font-medium' style={{ color: 'rgba(0, 0, 0, 0.75)' }}>Name</label>
              <Input
                type='text'
                name='name'
                placeholder='Enter Student name...'
                value={formData.name}
                onChange={handleInputChange}
                className='h-10 w-full min-w-0 bg-white placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-black/30 focus-visible:ring-offset-0'
                style={{
                  borderRadius: '5px',
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Reg-No Field */}
            <div className='flex flex-col gap-1.5 min-w-0' style={{ flex: '1.1 1 160px' }}>
              <label className='block text-sm font-medium' style={{ color: 'rgba(0, 0, 0, 0.75)' }}>Reg-No</label>
              <Input
                type='text'
                name='regNo'
                placeholder='Enter Reg-No..'
                value={formData.regNo}
                onChange={handleInputChange}
                className='h-10 w-full min-w-0 bg-white placeholder:text-gray-300 focus-visible:ring-1 focus-visible:ring-black/30 focus-visible:ring-offset-0'
                style={{
                  borderRadius: '5px',
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* All Grade Fields */}
            {['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'A1', 'A2', 'A3', 'A4', 'A5', 'Mids', 'Att'].map(field => (
              <div key={field} className='flex flex-col gap-1.5 min-w-0' style={{ flex: '0.55 1 56px' }}>
                <label className='block text-sm font-medium leading-none text-center' style={{ color: 'rgba(0, 0, 0, 0.75)' }}>
                  {field}
                </label>
                <Input
                  type='text'
                  name={field === 'Mids' ? 'mids' : field === 'Att' ? 'att' : field}
                  placeholder='-'
                  value={formData[field === 'Mids' ? 'mids' : field === 'Att' ? 'att' : field as keyof typeof formData] || ''}
                  onChange={handleInputChange}
                  className='h-10 w-full min-w-0 bg-white placeholder:text-gray-300 text-center px-1 focus-visible:ring-1 focus-visible:ring-black/30 focus-visible:ring-offset-0'
                  style={{
                    borderRadius: '5px',
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    fontSize: '14px'
                  }}
                />
              </div>
            ))}
            </div>
          </div>

          {/* Add Button */}
          <div style={{ borderTop: '1px solid rgba(0, 0, 0, 0.24)' }}>
            <Button
              onClick={handleAddStudent}
              className='w-full gap-2 text-center h-10 px-6'
              variant='outline'
              color='primary'
              size='medium'
              style={{
                border: '1px solid #2A313B',
               
                borderRadius: '5px',
                fontSize: '15px',
                fontWeight: '600',
                letterSpacing: '0.01em'
              }}
            >
              <Plus className='w-4 h-4 !text-white' />
              Add Student
            </Button>
          </div>
        </div>

        {/* OR Divider */}
        <div className='flex items-center justify-center my-6 gap-4'>
          <div className='flex-1' style={{ borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}></div>
          <span style={{ color: '#000000', fontWeight: '600', fontSize: '16px' }}>OR</span>
          <div className='flex-1' style={{ borderTop: '1px solid rgba(0, 0, 0, 0.1)' }}></div>
        </div>

        {/* File Upload Section */}
        <div className='mb-6'>
          <label htmlFor='file-upload' className='block cursor-pointer'>
            <div
              style={{
               backgroundColor: '#2A313B',
                color: '#FFFFFF',
                borderRadius: '5px',
                padding: '10px 24px',
                textAlign: 'center',
                fontWeight: '500',
                fontSize: '16px'
              }}
              className='flex items-center justify-center gap-2'
            >
              <Upload className='w-5 h-5' />
              Upload Excel Sheet or CSV file
            </div>
          </label>
          <input
            id='file-upload'
            type='file'
            accept='.xlsx,.xls,.csv'
            onChange={handleFileUpload}
            className='hidden'
          />
        </div>

        {/* Students Table */}
        {students.length > 0 && (
          <div style={{ border: '1px solid rgba(0, 0, 0, 0.18)', borderRadius: '10px', marginTop: '24px', overflow: 'hidden' }}>
            <table
              className='w-full table-fixed text-sm [&_th]:border-r [&_th]:border-[rgba(0,0,0,0.17)] [&_td]:border-r [&_td]:border-[rgba(0,0,0,0.17)] [&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0'
              style={{ borderCollapse: 'collapse', tableLayout: 'fixed', width: '100%' }}
            >
              <colgroup>
                <col style={{ width: '4%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '4%' }} />
                <col style={{ width: '4%' }} />
                <col style={{ width: '4%' }} />
                <col style={{ width: '4%' }} />
                <col style={{ width: '4%' }} />
                <col style={{ width: '4%' }} />
                <col style={{ width: '4%' }} />
                <col style={{ width: '4%' }} />
                <col style={{ width: '4%' }} />
                <col style={{ width: '4%' }} />
                <col style={{ width: '4%' }} />
                <col style={{ width: '4%' }} />
                <col style={{ width: '4%' }} />
                <col style={{ width: '10%' }} />
              </colgroup>
              <thead style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.5)' }}>
                <tr>
                  <th className='text-left px-2 py-2 text-[14px] font-normal' style={{ color: '#000000', whiteSpace: 'nowrap' }}>#</th>
                  <th className='text-left px-2 py-2 text-[14px] font-normal' style={{ color: '#000000', whiteSpace: 'nowrap' }}>Reg-No</th>
                  <th className='text-left px-2 py-2 text-[14px] font-normal' style={{ color: '#000000', whiteSpace: 'nowrap' }}>Name</th>
                  <th className='text-center px-1 py-2 text-[14px] font-normal' style={{ color: '#000000' }}>Q1</th>
                  <th className='text-center px-1 py-2 text-[14px] font-normal' style={{ color: '#000000' }}>Q2</th>
                  <th className='text-center px-1 py-2 text-[14px] font-normal' style={{ color: '#000000' }}>Q3</th>
                  <th className='text-center px-1 py-2 text-[14px] font-normal' style={{ color: '#000000' }}>Q4</th>
                  <th className='text-center px-1 py-2 text-[14px] font-normal' style={{ color: '#000000' }}>Q5</th>
                  <th className='text-center px-1 py-2 text-[14px] font-normal' style={{ color: '#000000' }}>Q6</th>
                  <th className='text-center px-1 py-2 text-[14px] font-normal' style={{ color: '#000000' }}>A1</th>
                  <th className='text-center px-1 py-2 text-[14px] font-normal' style={{ color: '#000000' }}>A2</th>
                  <th className='text-center px-1 py-2 text-[14px] font-normal' style={{ color: '#000000' }}>A3</th>
                  <th className='text-center px-1 py-2 text-[14px] font-normal' style={{ color: '#000000' }}>A4</th>
                  <th className='text-center px-1 py-2 text-[14px] font-normal' style={{ color: '#000000' }}>A5</th>
                  <th className='text-center px-1 py-2 text-[14px] font-normal' style={{ color: '#000000' }}>Mids</th>
                  <th className='text-center px-1 py-2 text-[14px] font-normal' style={{ color: '#000000' }}>Att</th>
                  <th className='text-center px-1 py-2 text-[14px] font-normal' style={{ color: '#000000', whiteSpace: 'nowrap' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => {
                  const isEditing = editingRowId === student.id;
                  return (
                    <tr key={student.id} style={{ 
                      borderBottom: '1px solid rgba(0, 0, 0, 0.17)', 
                      height: '22px',
                      backgroundColor: isEditing ? 'rgba(76, 175, 80, 0.15)' : 'transparent'
                    }}>
                      <td className='text-left px-2 py-1 text-[14px]' style={{ color: 'rgba(0, 0, 0, 0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{index + 1}</td>
                      <td className='text-left px-2 py-1 text-[14px]' style={{ color: 'rgba(0, 0, 0, 0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {isEditing ? (
                          <input
                            type='text'
                            value={student.regNo}
                            onChange={(e) => {
                              const updated = students.map(s =>
                                s.id === student.id ? { ...s, regNo: e.target.value } : s
                              );
                              setStudents(updated);
                            }}
                            style={{ 
                              width: '100%',
                              display: 'block',
                              boxSizing: 'border-box',
                              background: 'transparent',
                              border: 'none',
                              padding: '0',
                              margin: '0',
                              outline: 'none',
                              fontSize: 'inherit',
                              lineHeight: 'inherit',
                              font: 'inherit',
                              color: 'rgba(0, 0, 0, 0.5)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            autoFocus
                          />
                        ) : (
                          student.regNo
                        )}
                      </td>
                      <td className='text-left px-2 py-1 text-[14px]' style={{ color: 'rgba(0, 0, 0, 0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {isEditing ? (
                          <input
                            type='text'
                            value={student.name}
                            onChange={(e) => {
                              const updated = students.map(s =>
                                s.id === student.id ? { ...s, name: e.target.value } : s
                              );
                              setStudents(updated);
                            }}
                            style={{ 
                              width: '100%',
                              display: 'block',
                              boxSizing: 'border-box',
                              background: 'transparent',
                              border: 'none',
                              padding: '0',
                              margin: '0',
                              outline: 'none',
                              fontSize: 'inherit',
                              lineHeight: 'inherit',
                              font: 'inherit',
                              color: 'rgba(0, 0, 0, 0.5)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          />
                        ) : (
                          student.name
                        )}
                      </td>
                      {['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'A1', 'A2', 'A3', 'A4', 'A5', 'mids', 'att'].map((field) => (
                        <td key={field} className='text-center px-1 py-1 text-[14px]' style={{ color: 'rgba(0, 0, 0, 0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {isEditing ? (
                            <input
                              type='text'
                              value={student[field as keyof Student]}
                              onChange={(e) => {
                                const updated = students.map(s =>
                                  s.id === student.id ? { ...s, [field]: e.target.value } : s
                                );
                                setStudents(updated);
                              }}
                              style={{ 
                                width: '100%',
                                display: 'block',
                                boxSizing: 'border-box',
                                background: 'transparent',
                                border: 'none',
                                padding: '0',
                                margin: '0',
                                outline: 'none',
                                fontSize: 'inherit',
                                lineHeight: 'inherit',
                                font: 'inherit',
                                textAlign: 'center',
                                color: 'rgba(0, 0, 0, 0.5)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}
                            />
                          ) : (
                            student[field as keyof Student]
                          )}
                        </td>
                      ))}
                      <td className='text-center px-1 py-1'>
                        <div className='flex gap-1 justify-center'>
                          {isEditing ? (
                            <>
                              <Button
                                color='gray'
                                size='small'
                                variant='ghost'
                                className='w-6 h-6 p-0 rounded'
                                style={{ 
                                  backgroundColor: 'rgba(76, 175, 80, 0.4)',
                                  borderRadius: '3px'
                                }}
                                onClick={() => handleSaveRow(student.id)}
                              >
                                <Check className='w-3.5 h-3.5' style={{ color: '#4CAF50' }} />
                              </Button>
                              <Button
                                color='gray'
                                size='small'
                                variant='ghost'
                                className='w-6 h-6 p-0 rounded'
                                style={{ 
                                  backgroundColor: 'rgba(244, 67, 54, 0.2)',
                                  borderRadius: '3px'
                                }}
                                onClick={handleCancelEdit}
                              >
                                <XClose className='w-3.5 h-3.5' style={{ color: '#F44336' }} />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                color='gray'
                                size='small'
                                variant='ghost'
                                className='w-6 h-6 p-0 rounded'
                                style={{ 
                                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                  borderRadius: '3px'
                                }}
                                onClick={() => handleEditRow(student.id)}
                              >
                                <Edit2 className='w-3.5 h-3.5' style={{ color: '#000000' }} />
                              </Button>
                              <Button
                                color='gray'
                                size='small'
                                variant='ghost'
                                className='w-6 h-6 p-0 rounded'
                                style={{ 
                                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                  borderRadius: '3px'
                                }}
                                onClick={() => handleDeleteStudent(student.id)}
                              >
                                <Trash2 className='w-3.5 h-3.5' style={{ color: '#000000' }} />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className='mt-6 flex gap-3'>
          <Button
            onClick={handleSaveClassAndStudents}
            className='flex-1 h-10'
            color='gray'
            size='medium'
            variant='solid'
            disabled={isSaving || students.length === 0 || editingRowId !== null}
          >
            {isSaving ? 'Saving...' : editClassId ? 'Update Class & Students' : 'Save Class & Students'}
          </Button>
          <Button
            onClick={handleCancel}
            className='flex-1 h-10'
            color='gray'
            size='medium'
            variant='outline'
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
