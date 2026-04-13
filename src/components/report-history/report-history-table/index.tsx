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
    return '#0083FF';

  return '#8B5CF6';
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
      return '#62A510';
    if (level === 'medium' || level === 'mid' || level === 'avg')
      return '#C37200';
    if (level === 'high')
      return '#C30000';
    return '#C37200';
  };

  return (
    <div
      style={{
        border: '1px solid #000000',
        borderRadius: '7px',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF'
      }}
    >
      <Table>
        <TableHeader>
          <TableRow className='bg-[#2A3138] hover:bg-[#2A3138] border-b border-black/50'>
            <TableHead className='h-[52px] border-r border-black px-5 text-[16px] font-medium text-white'>Report ID</TableHead>
            <TableHead className='h-[52px] border-r border-black px-4 text-[16px] font-medium text-white'>Type</TableHead>
            <TableHead className='h-[52px] border-r border-black px-4 text-[16px] font-medium text-white'>Class / Student</TableHead>
            <TableHead className='h-[52px] border-r border-black px-4 text-[16px] font-medium text-white'>Summary</TableHead>
            <TableHead className='h-[52px] border-r border-black px-4 text-[16px] font-medium text-white'>Risk Level</TableHead>
            <TableHead className='h-[52px] border-r border-black px-4 text-[16px] font-medium text-white'>Date</TableHead>
            <TableHead className='h-[52px] px-4 text-center text-[16px] font-medium text-white'>Actions</TableHead>
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
                  className='border-b border-black/50 bg-white even:bg-[#FAFAFA] hover:bg-inherit'
                >
                  <TableCell className='h-[52px] border-r border-black px-5 text-[16px] font-medium text-black/80'>
                    {report.reportCode}
                  </TableCell>

                  <TableCell className='h-[52px] border-r border-black px-4'>
                    <div className='inline-flex items-center gap-2 text-[16px] font-medium text-black/80'>
                      <span
                        className='inline-block h-2.5 w-2.5 rounded-full'
                        style={{ backgroundColor: typeDotColor }}
                      />
                      <span>{formatTypeLabel(report.type)}</span>
                    </div>
                  </TableCell>

                  <TableCell className='h-[52px] border-r border-black px-4 text-[16px] font-medium text-black/80'>
                    {report.className}
                  </TableCell>

                  <TableCell className='h-[52px] border-r border-black px-4 text-[16px] font-medium text-black/80'>
                    {report.summary}
                  </TableCell>

                  <TableCell className='h-[52px] border-r border-black px-4'>
                    <div className='inline-flex items-center gap-2 text-[16px] font-medium text-black/80'>
                      <span
                        className='inline-block h-2.5 w-2.5 rounded-full'
                        style={{ backgroundColor: riskDotColor }}
                      />
                      <span>{report.riskLevel.toUpperCase()}</span>
                    </div>
                  </TableCell>

                  <TableCell className='h-[52px] border-r border-black px-4 text-[16px] font-medium text-black/80'>
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
                          <Eye size={20} style={{ color: '#65B1F9' }} />
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
                          <Download size={20} style={{ color: '#62A510' }} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={7} className='py-10 text-center text-[16px] text-black/50'>
                No reports found matching your filters.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
