'use client';

import React from 'react';
import { Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface Report {
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
}

interface ReportHistoryTableProps {
  reports: Report[];
  onViewReport?: (report: Report) => void;
  onDownloadReport?: (report: Report) => void;
}

const getTypeDotColor = (type: string) => {
  const normalizedType = type.toLowerCase();

  if (normalizedType === 'class')
    return '#4FA6F8';

  return '#C75CFF';
};

const formatTypeLabel = (type: string) => {
  const normalized = type.trim().toLowerCase();
  if (normalized === 'selected')
    return 'Selected';
  if (normalized === 'class')
    return 'Class';
  return type;
};

export function ReportHistoryTable({ reports, onViewReport, onDownloadReport }: ReportHistoryTableProps) {
  const getRiskLevelDotColor = (riskLevel: string) => {
    const level = riskLevel.toLowerCase();
    if (level === 'low')
      return '#3DD68C';
    if (level === 'medium' || level === 'mid' || level === 'avg')
      return '#FFA30C';
    if (level === 'high')
      return '#FF8A8F';
    return '#FFA30C';
  };

  return (
    <div className='glass-card overflow-hidden'>
      <Table>
        <TableHeader>
          <TableRow className='border-b border-white/10 bg-white/[0.04] hover:bg-white/[0.04]'>
            <TableHead className='h-[52px] border-r border-white/5 px-5 text-[16px] font-medium text-fg-text'>Report ID</TableHead>
            <TableHead className='h-[52px] border-r border-white/5 px-4 text-[16px] font-medium text-fg-text'>Type</TableHead>
            <TableHead className='h-[52px] border-r border-white/5 px-4 text-[16px] font-medium text-fg-text'>Class / Student</TableHead>
            <TableHead className='h-[52px] border-r border-white/5 px-4 text-[16px] font-medium text-fg-text'>Summary</TableHead>
            <TableHead className='h-[52px] border-r border-white/5 px-4 text-[16px] font-medium text-fg-text'>Risk Level</TableHead>
            <TableHead className='h-[52px] border-r border-white/5 px-4 text-[16px] font-medium text-fg-text'>Date</TableHead>
            <TableHead className='h-[52px] px-4 text-center text-[16px] font-medium text-fg-text'>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {reports.length > 0 ? (
            reports.map((report, index) => {
              const riskDotColor = getRiskLevelDotColor(report.riskLevel);
              const typeDotColor = getTypeDotColor(report.type);

              return (
                <TableRow
                  key={`${report.predictionId}-${index}`}
                  className='border-b border-white/5 hover:bg-white/[0.03]'
                >
                  <TableCell className='h-[52px] border-r border-white/5 px-5 text-[16px] font-medium text-fg-default'>
                    {report.reportCode}
                  </TableCell>

                  <TableCell className='h-[52px] border-r border-white/5 px-4'>
                    <div className='inline-flex items-center gap-2 text-[16px] font-medium text-fg-default'>
                      <span
                        className='inline-block h-2.5 w-2.5 rounded-full'
                        style={{ backgroundColor: typeDotColor }}
                      />
                      <span>{formatTypeLabel(report.type)}</span>
                    </div>
                  </TableCell>

                  <TableCell className='h-[52px] border-r border-white/5 px-4 text-[16px] font-medium text-fg-default'>
                    {report.className}
                  </TableCell>

                  <TableCell className='h-[52px] border-r border-white/5 px-4 text-[16px] font-medium text-fg-default'>
                    {report.summary}
                  </TableCell>

                  <TableCell className='h-[52px] border-r border-white/5 px-4'>
                    <div className='inline-flex items-center gap-2 text-[16px] font-medium text-fg-default'>
                      <span
                        className='inline-block h-2.5 w-2.5 rounded-full'
                        style={{ backgroundColor: riskDotColor }}
                      />
                      <span>{report.riskLevel.toUpperCase()}</span>
                    </div>
                  </TableCell>

                  <TableCell className='h-[52px] border-r border-white/5 px-4 text-[16px] font-medium text-fg-default'>
                    {report.date}
                  </TableCell>

                  <TableCell className='h-[52px] px-4'>
                    <div className='flex items-center justify-center gap-3'>
                      {report.actions.view && (
                        <Button
                          size='icon'
                          color='gray'
                          variant='ghost'
                          className='h-8 w-8 p-0'
                          style={{ backgroundColor: 'transparent' }}
                          onClick={() => onViewReport?.(report)}
                        >
                          <Eye size={20} style={{ color: '#7FD0FF' }} />
                        </Button>
                      )}
                      {report.actions.download && (
                        <Button
                          size='icon'
                          color='gray'
                          variant='ghost'
                          className='h-8 w-8 p-0'
                          style={{ backgroundColor: 'transparent' }}
                          onClick={() => onDownloadReport?.(report)}
                        >
                          <Download size={20} style={{ color: '#3DD68C' }} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={7} className='py-10 text-center text-[16px] text-fg-text'>
                No reports found matching your filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
