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

const getTypeBadgeColor = (type: string) => {
  const normalizedType = type.toLowerCase();

  if (normalizedType === 'class') {
    return {
      bg: 'rgba(17, 139, 255, 0.37)',
      border: '#0083FF',
      text: '#0064C3'
    };
  }

  return {
    bg: 'rgba(139, 92, 246, 0.22)',
    border: '#8B5CF6',
    text: '#6D28D9'
  };
};

export function ReportHistoryTable({ reports, onViewReport, onDownloadReport }: ReportHistoryTableProps) {
  const getRiskLevelColor = (riskLevel: string) => {
    const level = riskLevel.toLowerCase();
    if (level === 'low') {
      return { bg: 'rgba(178, 229, 39, 0.37)', border: '#B2E527', text: '#62A510' };
    } else if (level === 'medium') {
      return { bg: 'rgba(255, 192, 17, 0.37)', border: '#FFA600', text: '#C37200' };
    } else if (level === 'high') {
      return { bg: 'rgba(255, 39, 39, 0.37)', border: '#FF2727', text: '#C30000' };
    }
    return { bg: 'rgba(255, 192, 17, 0.37)', border: '#FFA600', text: '#C37200' };
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
              const riskColors = getRiskLevelColor(report.riskLevel);
              const typeColors = getTypeBadgeColor(report.type);

              return (
                <TableRow
                  key={`${report.predictionId}-${index}`}
                  className='border-b border-black/50 bg-white even:bg-[#FAFAFA] hover:bg-inherit'
                >
                  <TableCell className='h-[52px] border-r border-black px-5 text-[16px] font-medium text-black/80'>
                    {report.reportCode}
                  </TableCell>

                  <TableCell className='h-[52px] border-r border-black px-4'>
                    <div
                      style={{
                        backgroundColor: typeColors.bg,
                        border: `1px solid ${typeColors.border}`,
                        borderRadius: '11px',
                        padding: '1px 13px',
                        fontSize: '16px',
                        fontWeight: '500',
                        color: typeColors.text,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '26px'
                      }}
                    >
                      {report.type}
                    </div>
                  </TableCell>

                  <TableCell className='h-[52px] border-r border-black px-4 text-[16px] font-medium text-black/80'>
                    {report.className}
                  </TableCell>

                  <TableCell className='h-[52px] border-r border-black px-4 text-[16px] font-medium text-black/80'>
                    {report.summary}
                  </TableCell>

                  <TableCell className='h-[52px] border-r border-black px-4'>
                    <div
                      style={{
                        backgroundColor: riskColors.bg,
                        border: `1px solid ${riskColors.border}`,
                        borderRadius: '11px',
                        padding: '1px 13px',
                        fontSize: '16px',
                        fontWeight: '500',
                        color: riskColors.text,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '26px'
                      }}
                    >
                      {report.riskLevel}
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
