'use client';

import Link from 'next/link';
import { ContentLayout } from '@/components/sections/content-layout';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { PredictionHistoryTimeline } from '@/components/report-comparison/prediction-history-timeline';
import { ComparisonPanels } from '@/components/report-comparison/comparison-panels';
import { PerformanceChange } from '@/components/report-comparison/performance-change';
import { useEffect, useState } from 'react';

export default function ReportComparisonPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ContentLayout userInfo={user} title='Report Comparison'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href='/' style={{ color: '#000000' }}>Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage style={{ color: '#000000' }}>Prediction Comparison</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div style={{ marginTop: '32px' }}>
        {/* Page Title */}
        <h1 className="text-2xl font-semibold mb-6" style={{ color: '#000000' }}>
          Compare student predictions over time
        </h1>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '7px',
              border: '1px solid rgba(0, 0, 0, 0.43)',
              fontSize: '16px',
              color: 'rgba(0, 0, 0, 0.5)',
              cursor: 'pointer',
              backgroundColor: '#FFFFFF'
            }}
          >
            <option value="">Select Class</option>
            <option value="8th-a">8th Semester (Section-A)</option>
            <option value="8th-b">8th Semester (Section-B)</option>
            <option value="7th-a">7th Semester (Section-A)</option>
          </select>

          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            style={{
              padding: '10px',
              borderRadius: '7px',
              border: '1px solid rgba(0, 0, 0, 0.43)',
              fontSize: '16px',
              color: 'rgba(0, 0, 0, 0.5)',
              cursor: 'pointer',
              backgroundColor: '#FFFFFF'
            }}
          >
            <option value="">Select Student</option>
            <option value="hanzola-rehman">Hanzola Rehman</option>
            <option value="shahab-khan">Shahab Khan</option>
            <option value="ali-hassan">Ali Hassan</option>
          </select>
        </div>

        {/* Prediction History Timeline */}
        <PredictionHistoryTimeline />

        {/* Comparison Panels */}
        <ComparisonPanels />

        {/* Performance Change */}
        <PerformanceChange />
      </div>
    </ContentLayout>
  );
}
