'use client';

import { useEffect, useRef } from 'react';

export interface ReportPdfResultItem {
  id: string;
  name: string;
  regNo: string;
  predictedScore: number;
  passProbability: number;
  performanceCategory: string;
  modelConfidence: number;
  riskLevel: 'Low' | 'Mid' | 'High';
  suggestions: string[];
}

export interface ReportPdfPayload {
  reportCode: string;
  className: string;
  type: string;
  date: string;
  results: ReportPdfResultItem[];
}

async function generateReportPdf(payload: ReportPdfPayload) {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const ensureSpace = (requiredHeight: number) => {
    if (y + requiredHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Predicted Results', margin, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Report: ${payload.reportCode}`, margin, y);
  doc.text(`Class: ${payload.className}`, margin + 60, y);
  y += 5;
  doc.text(`Date: ${payload.date}`, margin, y);
  doc.text(`Type: ${payload.type}`, margin + 60, y);
  y += 6;
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  if (payload.results.length === 0) {
    doc.setFontSize(11);
    doc.text('No prediction results available.', margin, y);
  }

  payload.results.forEach((result, index) => {
    const suggestions = result.suggestions.length > 0 ? result.suggestions : ['No suggestions'];
    const suggestionText = suggestions.map((s) => `- ${s}`).join('\n');
    const wrappedSuggestions = doc.splitTextToSize(suggestionText, contentWidth - 8);
    const cardHeight = 42 + wrappedSuggestions.length * 4;

    ensureSpace(cardHeight + 4);

    doc.setDrawColor(210, 210, 210);
    doc.roundedRect(margin, y, contentWidth, cardHeight, 2, 2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`${index + 1}. ${result.name} (${result.regNo})`, margin + 3, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Predicted Score: ${result.predictedScore}`, margin + 3, y + 12);
    doc.text(`Pass Probability: ${result.passProbability}`, margin + 55, y + 12);
    doc.text(`Performance: ${result.performanceCategory}`, margin + 110, y + 12);
    doc.text(`Model Confidence: ${result.modelConfidence}`, margin + 3, y + 18);
    doc.text(`Risk Level: ${result.riskLevel}`, margin + 55, y + 18);

    doc.setFont('helvetica', 'bold');
    doc.text('Suggestions:', margin + 3, y + 24);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(wrappedSuggestions, margin + 7, y + 29);

    y += cardHeight + 4;
  });

  const fileName = `${payload.reportCode || 'report'}.pdf`;
  doc.save(fileName);
}

interface ReportPdfGeneratorProps {
  payload: ReportPdfPayload | null;
  onComplete: () => void;
  onError?: (error: Error) => void;
}

export function ReportPdfGenerator({ payload, onComplete, onError }: ReportPdfGeneratorProps) {
  const isGeneratingRef = useRef(false);

  useEffect(() => {
    if (!payload || isGeneratingRef.current)
      return;

    isGeneratingRef.current = true;

    const run = async () => {
      try {
        await generateReportPdf(payload);
      } catch (error) {
        if (onError)
          onError(error instanceof Error ? error : new Error('Failed to generate PDF'));
      } finally {
        isGeneratingRef.current = false;
        onComplete();
      }
    };

    void run();
  }, [payload, onComplete, onError]);

  return null;
}
