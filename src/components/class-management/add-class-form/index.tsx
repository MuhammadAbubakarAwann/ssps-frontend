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

function deriveProgramCode(value: unknown): string {
  const raw = String(value || '').trim();
  if (!raw)
    return '';

  const firstToken = raw.split('-')[0]?.trim() || '';
  return firstToken || raw;
}

export function AddClassForm({ editClassId }: AddClassFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!editClassId);
  const [classNameOptions, setClassNameOptions] = useState<Array<{ code: string; name: string }>>([]);
  const [subjectOptions, setSubjectOptions] = useState<Array<{ id: string; courseCode: string; courseName: string; subject: string }>>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | number | null>(null);
  const [classData, setClassData] = useState({
    name: '',
    semester: '',
    subject: '',
    section: '',
    courseCode: '',
    courseName: '',
    courseCatalogId: ''
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

  const sectionOptions = ['A', 'B', 'C', 'D'];

  const semesterOptions = [
    { label: 'Semester 1', value: '1' },
    { label: 'Semester 2', value: '2' },
    { label: 'Semester 3', value: '3' },
    { label: 'Semester 4', value: '4' },
    { label: 'Semester 5', value: '5' },
    { label: 'Semester 6', value: '6' },
    { label: 'Semester 7', value: '7' },
    { label: 'Semester 8', value: '8' }
  ];

  // Fetch class/program codes from API
  useEffect(() => {
    const fetchClassNames = async () => {
      try {
        const response = await fetch('/api/catalog/class-names');

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const payload: Record<string, unknown> = await response.json();
        console.log('API Response:', payload);

        const data = payload.data && typeof payload.data === 'object'
          ? (payload.data as Record<string, unknown>)
          : {};

        const programs = Array.isArray(data.programs)
          ? data.programs
          : [];

        console.log('Programs:', programs);

        const codes = programs
          .filter((prog): prog is Record<string, unknown> => typeof prog === 'object' && prog !== null)
          .map((prog) => ({
            code: String(prog.code || ''),
            name: String(prog.name || '')
          }))
          .filter((program) => program.code.length > 0);

        console.log('Extracted codes:', codes);
        setClassNameOptions(codes);
      } catch (error) {
        console.error('Failed to fetch class names:', error);
        showToast.error(`Failed to load class list: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    fetchClassNames();
  }, []);

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

          const courseInfo = classInfo.course && typeof classInfo.course === 'object'
            ? (classInfo.course as Record<string, unknown>)
            : null;

          const studentsList = Array.isArray(responseData.students)
            ? responseData.students
            : [];

          setClassData({
            name: deriveProgramCode(classInfo.programCode || classInfo.name),
            semester: parseSemesterNumber(String(classInfo.semesterNumber || classInfo.semester || '')),
            subject: String(classInfo.subject || courseInfo?.label || courseInfo?.name || ''),
            section: String(classInfo.section || ''),
            courseCode: String(classInfo.courseCode || courseInfo?.courseCode || courseInfo?.code || ''),
            courseName: String(classInfo.courseName || courseInfo?.courseName || courseInfo?.title || ''),
            courseCatalogId: String(classInfo.courseCatalogId || courseInfo?.id || classInfo.courseCode || courseInfo?.courseCode || '')
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

  const getProgramName = (programCode: string) => {
    return classNameOptions.find((option) => option.code === programCode)?.name || '';
  };

  const parseSemesterNumber = (semesterValue: string) => {
    const match = semesterValue.match(/\d+/);
    return match ? match[0] : semesterValue;
  };

  const getSemesterLabel = (semesterValue: string) => {
    const semesterNumber = parseSemesterNumber(semesterValue);
    return semesterNumber ? `Semester ${semesterNumber}` : '';
  };

  const resolveCourseCatalogIdForSave = () => {
    if (!classData.courseCatalogId)
      return '';

    const directMatch = subjectOptions.find((option) => option.id === classData.courseCatalogId);
    if (directMatch?.id)
      return directMatch.id;

    const inferredMatch = subjectOptions.find((option) => {
      const byCode = classData.courseCode && option.courseCode === classData.courseCode;
      const byName = classData.courseName && option.courseName === classData.courseName;
      const bySubject = classData.subject && option.subject === classData.subject;
      return Boolean(byCode || byName || bySubject);
    });

    return inferredMatch?.id || '';
  };

  const handleClassInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'name') {
      setClassData((prev) => ({
        ...prev,
        name: value,
        subject: '',
        courseCode: '',
        courseName: '',
        courseCatalogId: ''
      }));
      return;
    }

    if (name === 'semester') {
      setClassData((prev) => ({
        ...prev,
        semester: value,
        subject: '',
        courseCode: '',
        courseName: '',
        courseCatalogId: ''
      }));
      return;
    }

    if (name === 'subject') {
      const selectedSubject = subjectOptions.find((option) => {
        const optionValue = option.id || option.courseCode || option.subject;
        return optionValue === value;
      });

      setClassData((prev) => ({
        ...prev,
        subject: selectedSubject?.subject || '',
        courseCode: selectedSubject?.courseCode || '',
        courseName: selectedSubject?.courseName || '',
        courseCatalogId: selectedSubject?.id || selectedSubject?.courseCode || ''
      }));
      return;
    }

    setClassData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const withExistingValue = (options: string[], currentValue: string) => {
    if (!currentValue)
      return options;

    return options.includes(currentValue) ? options : [currentValue, ...options];
  };

  useEffect(() => {
    if (!classData.name || !classData.semester) {
      setSubjectOptions([]);
      return;
    }

    const fetchSubjects = async () => {
      setLoadingSubjects(true);

      try {
        const response = await fetch(
          `/api/catalog/subjects?programCode=${classData.name}&semesterNumber=${parseSemesterNumber(classData.semester)}`
        );

        if (!response.ok)
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);

        const payload: Record<string, unknown> = await response.json();
        const data = payload.data && typeof payload.data === 'object'
          ? (payload.data as Record<string, unknown>)
          : {};

        const subjects = Array.isArray(data.subjects)
          ? data.subjects
          : [];

        const mappedSubjects = subjects
          .filter((subject): subject is Record<string, unknown> => typeof subject === 'object' && subject !== null)
          .map((subject) => {
            const courseCode = String(subject.courseCode || subject.code || '');
            const courseName = String(subject.courseName || subject.title || '');
            const subjectText = String(
              subject.subject ||
              subject.label ||
              subject.name ||
              [courseCode, courseName].filter(Boolean).join(' ')
            );

            return {
              id: String(subject.id || subject.courseCode || subject.code || ''),
              courseCode,
              courseName,
              subject: subjectText
            };
          })
          .filter((subject) => subject.subject.length > 0);

        setSubjectOptions(mappedSubjects);

        setClassData((prev) => {
          const hasMatchedCatalogId = prev.courseCatalogId
            && mappedSubjects.some((subject) => (subject.id || subject.courseCode || subject.subject) === prev.courseCatalogId);

          if (hasMatchedCatalogId)
            return prev;

          const matchedSubject = mappedSubjects.find((subject) => {
            const sameCode = prev.courseCode && subject.courseCode === prev.courseCode;
            const sameName = prev.courseName && subject.courseName === prev.courseName;
            const sameLabel = prev.subject && subject.subject === prev.subject;
            return Boolean(sameCode || sameName || sameLabel);
          });

          if (!matchedSubject)
            return prev;

          return {
            ...prev,
            courseCatalogId: matchedSubject.id,
            subject: matchedSubject.subject,
            courseCode: matchedSubject.courseCode,
            courseName: matchedSubject.courseName
          };
        });
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
        setSubjectOptions([]);
      } finally {
        setLoadingSubjects(false);
      }
    };

    void fetchSubjects();
  }, [classData.name, classData.semester]);

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
    if (!classData.name || !classData.subject || !classData.section || !classData.semester || !classData.courseCatalogId) {
      showToast.error('Please fill all class fields first.');
      return;
    }

    const programName = getProgramName(classData.name);
    const resolvedCourseCatalogId = resolveCourseCatalogIdForSave();
    const semesterNumber = toNumber(parseSemesterNumber(classData.semester));
    const semester = getSemesterLabel(classData.semester);

    if (!resolvedCourseCatalogId) {
      showToast.error('Please reselect subject and wait for subjects to finish loading before saving.');
      return;
    }

    if (students.length === 0) {
      showToast.error('Please add at least one student before saving.');
      return;
    }

    const payload = {
      class: {
        name: programName || classData.name,
        programCode: classData.name,
        programName: programName || classData.name,
        courseCode: classData.courseCode,
        courseName: classData.courseName,
        subject: classData.subject,
        section: classData.section,
        semester,
        semesterNumber,
        courseCatalogId: resolvedCourseCatalogId
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
            {/* Class Name */}
            <div className='flex flex-col gap-1.5'>
              <label className='block text-sm font-medium' style={{ color: 'rgba(0, 0, 0, 0.75)' }}>Class (Program)</label>
              <select
                name='name'
                value={classData.name}
                onChange={handleClassInputChange}
                className='h-10 w-full rounded-[5px] border border-black/20 bg-white px-3 text-[14px] text-black outline-none focus-visible:ring-1 focus-visible:ring-black/30'
              >
                <option value=''>Select class</option>
                {classNameOptions?.length > 0 ? (
                  withExistingValue(classNameOptions.map((option) => option.code), classData.name).map((code) => (
                    <option key={code} value={code}>{code}</option>
                  ))
                ) : classData.name ? (
                  <option value={classData.name}>{classData.name}</option>
                ) : (
                  <option disabled>Loading classes...</option>
                )}
              </select>
            </div>

            {/* Semester */}
            <div className='flex flex-col gap-1.5'>
              <label className='block text-sm font-medium' style={{ color: 'rgba(0, 0, 0, 0.75)' }}>Semester</label>
              <select
                name='semester'
                value={classData.semester}
                onChange={handleClassInputChange}
                className='h-10 w-full rounded-[5px] border border-black/20 bg-white px-3 text-[14px] text-black outline-none focus-visible:ring-1 focus-visible:ring-black/30'
              >
                <option value=''>Select semester</option>
                {withExistingValue(semesterOptions.map((option) => option.value), classData.semester).map((semesterValue) => {
                  const matched = semesterOptions.find((option) => option.value === semesterValue);
                  const label = matched?.label || `Semester ${semesterValue}`;

                  return (
                    <option key={semesterValue} value={semesterValue}>{label}</option>
                  );
                })}
              </select>
            </div>

            {/* Subject */}
            <div className='flex flex-col gap-1.5'>
              <label className='block text-sm font-medium' style={{ color: 'rgba(0, 0, 0, 0.75)' }}>Subject (Course)</label>
              <select
                name='subject'
                value={classData.courseCatalogId}
                onChange={handleClassInputChange}
                disabled={!classData.name || !classData.semester || loadingSubjects}
                className='h-10 w-full rounded-[5px] border border-black/20 bg-white px-3 text-[14px] text-black outline-none focus-visible:ring-1 focus-visible:ring-black/30 disabled:bg-gray-100 disabled:text-gray-400'
              >
                <option value=''>
                  {loadingSubjects ? 'Loading subjects...' : 'Select subject'}
                </option>
                {classData.courseCatalogId
                  && !subjectOptions.some((option) => (option.id || option.courseCode || option.subject) === classData.courseCatalogId)
                  && classData.subject && (
                    <option value={classData.courseCatalogId}>{classData.subject}</option>
                )}
                {subjectOptions.map((option) => (
                  <option
                    key={option.id || option.courseCode || option.subject}
                    value={option.id || option.courseCode || option.subject}
                  >
                    {option.subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Section */}
            <div className='flex flex-col gap-1.5'>
              <label className='block text-sm font-medium' style={{ color: 'rgba(0, 0, 0, 0.75)' }}>Section</label>
              <select
                name='section'
                value={classData.section}
                onChange={handleClassInputChange}
                className='h-10 w-full rounded-[5px] border border-black/20 bg-white px-3 text-[14px] text-black outline-none focus-visible:ring-1 focus-visible:ring-black/30'
              >
                <option value=''>Select section</option>
                {withExistingValue(sectionOptions, classData.section).map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
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
                                color='primary'
                                size='icon'
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
                                color='primary'
                                size='icon'
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
                                color='primary'
                                size='icon'
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
                                color='primary'
                                size='icon'
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
