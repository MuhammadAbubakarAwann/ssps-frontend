'use client';

import { useEffect, useMemo, useState } from 'react';
import { ReportHistoryTable } from '@/components/report-history/report-history-table';
import {
  ReportPdfGenerator,
  type ReportPdfPayload
} from '@/components/report-history/report-pdf-generator';
import { PredictedResultsModal } from '@/components/predictions/predicted-results-modal';
import { showToast } from '@/components/ui/toaster';
import { Input } from '@/components/ui/input';
import { Search, ChevronDown } from 'lucide-react';

type ClassOption = {
  id: string;
  name: string;
};

type ReportTableItem = {
  predictionId: string;
  reportCode: string;
  type: string;
  classId: string;
  className: string;
  summary: string;
  riskLevel: string;
  date: string;
  actions: {
    view: boolean;
    download: boolean;
  };
};

type StudentResult = {
  id: string;
  name: string;
  regNo: string;
  predictedScore: number;
  passProbability: number;
  performanceCategory: string;
  modelConfidence: number;
  riskLevel: 'Low' | 'Mid' | 'High';
  suggestions: string[];
};

type PredictionDetailsResponse = {
  success?: boolean;
  message?: string;
  data?: {
    class?: {
      id?: string | number;
      name?: string;
    };
    prediction?: {
      date?: string;
      generatedAt?: string;
      scope?: string;
    };
    entries?: Array<{
      id?: number | string;
      studentId?: number | string;
      name?: string;
      regNo?: string;
      predictedScore?: number;
      performance?: string;
      performanceCategory?: string;
      passProbability?: number;
      modelConfidence?: number;
      riskLevel?: 'LOW' | 'MID' | 'HIGH' | string;
      suggestions?: string[] | string;
    }>;
    students?: Array<{
      id: number | string;
      studentId?: number | string;
      name: string;
      registrationNum: string;
      predictedScore: number;
      performanceCategory: string;
      passProbability: number;
      modelConfidence: number;
      riskLevel: 'LOW' | 'MID' | 'HIGH';
      suggestions: string[] | string;
    }>;
  };
};

type ReportsApiResponse = {
  success?: boolean;
  message?: string;
  data?: {
    reports?: Array<Record<string, unknown>>;
  };
};

type ClassesApiResponse = {
  success?: boolean;
  message?: string;
  data?: {
    classes?: Array<{
      id: string | number;
      name: string;
    }>;
  };
};

function toStringSafe(value: unknown, fallback = ''): string {
  if (value == null)
    return fallback;

  return String(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toDisplayText(value: unknown, fallback = '-'): string {
  if (value == null)
    return fallback;

  if (typeof value === 'string')
    return value.trim() || fallback;

  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);

  if (Array.isArray(value)) {
    const normalized = value
      .map((item) => toDisplayText(item, ''))
      .filter(Boolean);

    return normalized.length > 0 ? normalized.join(', ') : fallback;
  }

  if (isRecord(value)) {
    const priorityKeys = ['name', 'title', 'summary', 'description', 'label', 'text'];
    for (const key of priorityKeys) {
      const candidate = value[key];
      const normalized = toDisplayText(candidate, '');
      if (normalized)
        return normalized;
    }

    const primitiveParts = Object.values(value)
      .filter((entry) => typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean')
      .map((entry) => String(entry))
      .filter(Boolean);

    return primitiveParts.length > 0 ? primitiveParts.join(' - ') : fallback;
  }

  return fallback;
}

function deriveClassOrStudentLabel(report: Record<string, unknown>): string {
  const classNode = report.class;
  if (isRecord(classNode)) {
    const className = toDisplayText(classNode.name ?? classNode.title ?? classNode.className, '');
    if (className)
      return className;
  }

  const studentNode = report.student;
  if (isRecord(studentNode)) {
    const studentName = toDisplayText(studentNode.name ?? studentNode.studentName, '');
    const regNo = toDisplayText(studentNode.regNo ?? studentNode.registrationNo, '');
    if (studentName && regNo)
      return `${studentName} (${regNo})`;
    if (studentName)
      return studentName;
  }

  return toDisplayText(report.className ?? report.class_name ?? report.studentName ?? report.student_name, 'Unknown Class');
}

function deriveClassId(report: Record<string, unknown>): string {
  const direct = report.classId ?? report.class_id;
  if (direct != null && !isRecord(direct) && !Array.isArray(direct)) {
    const normalized = String(direct).trim();
    if (normalized)
      return normalized;
  }

  const classNode = report.class;
  if (isRecord(classNode)) {
    const nestedId = classNode.id ?? classNode.classId ?? classNode.class_id;
    if (nestedId != null && !isRecord(nestedId) && !Array.isArray(nestedId)) {
      const normalized = String(nestedId).trim();
      if (normalized)
        return normalized;
    }
  }

  return '';
}

function derivePredictionId(report: Record<string, unknown>): string {
  const directCandidates = [
    report.predictionId,
    report.prediction_id,
    report.id
  ];

  for (const candidate of directCandidates) {
    if (candidate != null && !isRecord(candidate) && !Array.isArray(candidate)) {
      const normalized = String(candidate).trim();
      if (normalized)
        return normalized;
    }
  }

  const predictionNode = report.prediction;
  if (isRecord(predictionNode)) {
    const nestedCandidates = [
      predictionNode.id,
      predictionNode.predictionId,
      predictionNode.prediction_id
    ];

    for (const candidate of nestedCandidates) {
      if (candidate != null && !isRecord(candidate) && !Array.isArray(candidate)) {
        const normalized = String(candidate).trim();
        if (normalized)
          return normalized;
      }
    }
  }

  return '';
}

const normalizeRiskLevel = (risk: 'LOW' | 'MID' | 'HIGH'): 'Low' | 'Mid' | 'High' => {
  if (risk === 'HIGH')
    return 'High';

  if (risk === 'MID')
    return 'Mid';

  return 'Low';
};

const mapPredictionResults = (payload: PredictionDetailsResponse): StudentResult[] => {
  if (Array.isArray(payload.data?.entries) && payload.data.entries.length > 0) {
    return payload.data.entries.map((entry, index) => ({
      id: String(entry.studentId ?? entry.id ?? index),
      name: String(entry.name || ''),
      regNo: String(entry.regNo || ''),
      predictedScore: Number(entry.predictedScore || 0),
      passProbability: Number(entry.passProbability || 0),
      performanceCategory: String(entry.performanceCategory || entry.performance || 'N/A'),
      modelConfidence: Number(entry.modelConfidence || 0),
      riskLevel: normalizeRiskLevel(String(entry.riskLevel || 'LOW') as 'LOW' | 'MID' | 'HIGH'),
      suggestions: Array.isArray(entry.suggestions)
        ? entry.suggestions.map((suggestion) => String(suggestion)).filter(Boolean)
        : String(entry.suggestions || '').split('\n').filter(Boolean)
    }));
  }

  return (payload.data?.students || []).map((student) => ({
    id: String(student.studentId ?? student.id),
    name: student.name,
    regNo: student.registrationNum,
    predictedScore: student.predictedScore,
    passProbability: student.passProbability,
    performanceCategory: student.performanceCategory,
    modelConfidence: student.modelConfidence,
    riskLevel: normalizeRiskLevel(student.riskLevel),
    suggestions: Array.isArray(student.suggestions)
      ? student.suggestions
      : String(student.suggestions || '').split('\n').filter(Boolean)
  }));
};

function deriveSummaryText(report: Record<string, unknown>): string {
  const parseCount = (value: unknown): number | null => {
    if (value == null)
      return null;

    const numeric = Number(value);
    if (Number.isFinite(numeric))
      return numeric;

    if (typeof value === 'string') {
      const match = value.match(/\d+/);
      if (match)
        return Number(match[0]);
    }

    return null;
  };

  const high = parseCount(
    report.highCount
    ?? report.high
    ?? report.highRiskCount
    ?? report.high_risk_count
  );
  const avg = parseCount(
    report.avgCount
    ?? report.averageCount
    ?? report.midCount
    ?? report.mediumCount
    ?? report.avg
    ?? report.mid
    ?? report.medium
  );
  const low = parseCount(
    report.lowCount
    ?? report.low
    ?? report.lowRiskCount
    ?? report.low_risk_count
  );

  if (high !== null || avg !== null || low !== null)
    return `High:${high ?? 0} | Avg:${avg ?? 0} | Low:${low ?? 0}`;

  const rawSummary = toDisplayText(report.summary ?? report.description ?? report.title, '-');
  const compactMatch = rawSummary.match(/^(\d+)\s*[-|/]\s*(\d+)\s*[-|/]\s*(\d+)$/);

  if (compactMatch)
    return `High:${compactMatch[1]} | Avg:${compactMatch[2]} | Low:${compactMatch[3]}`;

  return rawSummary;
}

function toDateSafe(value: unknown): string {
  if (!value)
    return '-';

  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime()))
    return String(value);

  return parsed.toLocaleDateString('en-GB');
}

function deriveRiskLevel(report: Record<string, unknown>): string {
  const explicit = report.riskLevel || report.risk_level || report.risk;
  if (explicit)
    return toStringSafe(explicit, 'Mid');

  const avgScore = Number(report.avgScore ?? report.averageScore ?? report.avg_score ?? NaN);
  if (!Number.isFinite(avgScore))
    return 'Mid';

  if (avgScore >= 80)
    return 'Low';

  if (avgScore >= 60)
    return 'Mid';

  return 'High';
}

export function ReportHistoryMainData() {
  const isLoadingUser = false;
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [reports, setReports] = useState<ReportTableItem[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [pdfPayload, setPdfPayload] = useState<ReportPdfPayload | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [resultsDate, setResultsDate] = useState('');
  const [resultsClassTitle, setResultsClassTitle] = useState('');

  useEffect(() => {
    if (isLoadingUser)
      return;

    const fetchClasses = async () => {
      try {
        const response = await fetch('/api/teacher/classes/names', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        const payload: ClassesApiResponse = await response.json();
        if (!response.ok || !payload.success)
          throw new Error(payload.message || 'Failed to fetch classes');

        const classList = (payload.data?.classes || []).map((cls) => ({
          id: String(cls.id),
          name: cls.name
        }));

        setClasses(classList);
      } catch (fetchError) {
        console.error('Error fetching classes:', fetchError);
      }
    };

    void fetchClasses();
  }, [isLoadingUser]);

  useEffect(() => {
    if (isLoadingUser)
      return;

    const fetchReports = async () => {
      try {
        setIsLoadingReports(true);
        setError(null);

        const response = await fetch('/api/teacher/predictions/reports', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        const payload: ReportsApiResponse = await response.json();
        if (!response.ok || !payload.success)
          throw new Error(payload.message || 'Failed to fetch reports');

        const mapped = (payload.data?.reports || []).map((report): ReportTableItem => {
          const predictionId = derivePredictionId(report);

          const className = deriveClassOrStudentLabel(report);

          const summary = deriveSummaryText(report);

          return {
            predictionId,
            reportCode: toStringSafe(report.reportCode ?? report.report_code, predictionId ? `RPT-${predictionId}` : 'RPT-UNKNOWN'),
            type: toStringSafe(report.type ?? report.scope, 'Class'),
            classId: deriveClassId(report),
            className,
            summary,
            riskLevel: deriveRiskLevel(report),
            date: toDateSafe(report.date ?? report.createdAt ?? report.created_at),
            actions: {
              view: true,
              download: true
            }
          };
        });

        setReports(mapped);
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : 'Failed to fetch reports';
        setError(message);
        setReports([]);
      } finally {
        setIsLoadingReports(false);
      }
    };

    void fetchReports();
  }, [isLoadingUser]);

  const selectedClassName = useMemo(() => {
    if (selectedClass === 'all')
      return 'All Classes';

    return classes.find((cls) => cls.id === selectedClass)?.name || 'Selected Class';
  }, [classes, selectedClass]);

  const classOptions = useMemo(() => {
    return [
      { value: 'all', label: 'Class' },
      ...classes.map((cls) => ({ value: cls.id, label: cls.name }))
    ];
  }, [classes]);

  const predictionTypeOptions = [
    { value: 'all', label: 'Prediction Type' },
    { value: 'CLASS', label: 'Class' },
    { value: 'SELECTED', label: 'Selected' }
  ];

  const riskLevelOptions = [
    { value: 'all', label: 'Risk Level' },
    { value: 'Low', label: 'Low' },
    { value: 'Mid', label: 'Mid' },
    { value: 'High', label: 'High' }
  ];

  const filteredReports = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const selectedClassLabel = classes.find((cls) => cls.id === selectedClass)?.name || '';

    return reports.filter((report) => {
      const matchesSearch = !query || [
        report.reportCode,
        report.className,
        report.summary,
        report.type,
        report.riskLevel
      ].some((value) => value.toLowerCase().includes(query));

      const matchesClass = selectedClass === 'all'
        || report.classId === selectedClass
        || (selectedClassLabel && report.className.toLowerCase() === selectedClassLabel.toLowerCase());
      const matchesType = selectedType === 'all' || report.type.toUpperCase() === selectedType;
      const matchesRisk = selectedRisk === 'all' || report.riskLevel.toLowerCase() === selectedRisk.toLowerCase();

      return matchesSearch && matchesClass && matchesType && matchesRisk;
    });
  }, [reports, searchQuery, selectedClass, selectedType, selectedRisk, classes]);

  const handleViewReport = async (report: ReportTableItem) => {
    if (!report.predictionId) {
      showToast.error('Prediction ID is missing for this report.');
      return;
    }

    if (!report.classId) {
      showToast.error('Class information is missing for this report.');
      return;
    }

    setShowResultsModal(true);
    setIsLoadingResults(true);
    setResults([]);
    setResultsClassTitle(report.className);
    setResultsDate(report.date);

    try {
      const response = await fetch(`/api/teacher/classes/${report.classId}/predictions/${report.predictionId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const payload: PredictionDetailsResponse = await response.json();
      if (!response.ok || !payload.success)
        throw new Error(payload.message || 'Failed to fetch prediction results');

      setResults(mapPredictionResults(payload));
      setResultsClassTitle(String(payload.data?.class?.name || report.className));

      if (payload.data?.prediction?.generatedAt || payload.data?.prediction?.date) {
        setResultsDate(
          new Date(payload.data.prediction.generatedAt || payload.data.prediction.date || report.date).toLocaleDateString('en-GB')
        );
      }
    } catch (fetchError) {
      console.error('Error fetching report details:', fetchError);
      showToast.error(fetchError instanceof Error ? fetchError.message : 'Failed to fetch prediction results');
      setShowResultsModal(false);
    } finally {
      setIsLoadingResults(false);
    }
  };

  const handleDownloadReport = async (report: ReportTableItem) => {
    if (!report.predictionId) {
      showToast.error('Prediction ID is missing for this report.');
      return;
    }

    if (!report.classId) {
      showToast.error('Class information is missing for this report.');
      return;
    }

    try {
      const response = await fetch(`/api/teacher/classes/${report.classId}/predictions/${report.predictionId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const payload: PredictionDetailsResponse = await response.json();
      if (!response.ok || !payload.success)
        throw new Error(payload.message || 'Failed to fetch prediction results');

      const resultsForPdf = mapPredictionResults(payload);
      const resolvedDate = payload.data?.prediction?.generatedAt || payload.data?.prediction?.date
        ? new Date(payload.data.prediction.generatedAt || payload.data.prediction.date || report.date).toLocaleDateString('en-GB')
        : report.date;
      const resolvedType = String(payload.data?.prediction?.scope || report.type || '').toUpperCase() || report.type;

      setPdfPayload({
        reportCode: report.reportCode,
        className: String(payload.data?.class?.name || report.className),
        type: resolvedType,
        date: resolvedDate,
        results: resultsForPdf
      });
    } catch (fetchError) {
      console.error('Error fetching report download details:', fetchError);
      showToast.error(fetchError instanceof Error ? fetchError.message : 'Failed to download report');
    }
  };

  if (isLoadingUser)
    return (
      <div className='mt-4 space-y-6 animate-pulse'>
        <div className='h-8 w-2/3 rounded-full bg-gray-200' />
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='h-10 rounded-md bg-gray-200' />
          <div className='h-10 rounded-md bg-gray-200' />
        </div>
        <div className='rounded-xl border border-gray-200 bg-white p-5 space-y-3'>
          {[0, 1, 2].map((index) => (
            <div key={index} className='h-16 rounded-md bg-gray-100' />
          ))}
        </div>
      </div>
    );

  return (
    <>
      <div className='mt-4'>
        {/* Page Title */}
        <h1 className='mb-8 text-2xl font-semibold text-black'>
          See the student/class report history
        </h1>

        {/* Filters Section */}
        <div className='mb-8 flex items-center gap-4'>
          {/* Search Bar */}
          <div className='relative flex-1'>
            <Input
              type='text'
              placeholder='Search by Report ID, Class, or Student Name'
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className='h-[44px] w-full rounded-[7px] border border-black/40 pr-10 text-base text-black/60 placeholder:text-black/50'
            />
            <Search
              size={20}
              className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black/50'
            />
          </div>

          {/* Class Filter */}
          <div className='relative h-[44px] rounded-[7px] border border-black/30 shadow-sm'>
            <select
              value={selectedClass}
              onChange={(event) => setSelectedClass(event.target.value)}
              className='h-full w-auto cursor-pointer appearance-none bg-transparent px-3 pr-9 text-[15px] text-black/70 outline-none whitespace-nowrap'
            >
              {classOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black/50' />
          </div>

          {/* Prediction Type Filter */}
          <div className='relative h-[44px] rounded-[7px] border border-black/30 shadow-sm'>
            <select
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value)}
              className='h-full w-auto cursor-pointer appearance-none bg-transparent px-3 pr-9 text-[15px] text-black/70 outline-none whitespace-nowrap'
            >
              {predictionTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black/50' />
          </div>

          {/* Risk Level Filter */}
          <div className='relative h-[44px] rounded-[7px] border border-black/30 shadow-sm'>
            <select
              value={selectedRisk}
              onChange={(event) => setSelectedRisk(event.target.value)}
              className='h-full w-auto cursor-pointer appearance-none bg-transparent px-3 pr-9 text-[15px] text-black/70 outline-none whitespace-nowrap'
            >
              {riskLevelOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black/50' />
          </div>
        </div>

        {error && (
          <div className='mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700'>
            {error}
          </div>
        )}

        {isLoadingReports ? (
          <div className='rounded-xl border border-gray-200 bg-white p-5 animate-pulse space-y-3'>
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className='h-12 rounded-md bg-gray-100' />
            ))}
          </div>
        ) : (
          <ReportHistoryTable
            reports={filteredReports}
            onViewReport={handleViewReport}
            onDownloadReport={handleDownloadReport}
          />
        )}
      </div>

      <ReportPdfGenerator
        payload={pdfPayload}
        onComplete={() => {
          showToast.success(`Report exported${selectedClassName ? ` for ${selectedClassName}` : ''}`);
          setPdfPayload(null);
        }}
        onError={(pdfError) => {
          showToast.error(pdfError.message || 'Failed to export report');
          setPdfPayload(null);
        }}
      />

      <PredictedResultsModal
        isOpen={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        className=''
        classTitle={resultsClassTitle}
        date={resultsDate}
        results={results}
        isLoading={isLoadingResults}
      />
    </>
  );
}
