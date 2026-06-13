'use client';

import React, { FC, useState, useEffect, useRef } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { IoMdClose, IoMdDownload } from 'react-icons/io';
import '@/styles/pdf-viewer/style.css';
import { PDFDocumentProxy } from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

const options = {
  cMapUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/cmaps/',
  standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.4.120/standard_fonts/'
};

type PDFFile = string | File | null;

const PdfDocument: FC<{
  fileUrl: PDFFile;
  scale: number;
  onDocumentLoadSuccess: (document: PDFDocumentProxy) => void;
  onError: (error: Error) => void;
  numPages: number;
}> = ({ fileUrl, scale, onDocumentLoadSuccess, onError, numPages }) => (
  <Document
    file={fileUrl}
    onLoadSuccess={onDocumentLoadSuccess}
    onLoadError={onError}
    options={options}
    loading={<div className='w-full h-1 bg-primary-solid animate-pulse'></div>}
  >
    {Array.from(new Array(numPages), (el, index) => (
      <Page key={`page_${index + 1}`} pageNumber={index + 1} scale={scale} />
    ))}
  </Document>
);

export const PdfReader: FC<{
  fileUrl: PDFFile;
  title: string;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  open: boolean;
}> = ({ fileUrl, title, open, setOpen }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPdfJs = async () => {
      try {
        await pdfjs.getDocument({ url: fileUrl as string }).promise;
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Failed to load PDF. Please try again later.');
      }
    };
    if (open) 
      loadPdfJs().catch(err => console.log('Erro in loadPdfJs', err));
    ;
  }, [open, fileUrl]);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        setScale(Math.min(containerWidth / 700, 1.5)); // Cap the scale at 1.5
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  function onDocumentLoadSuccess({ numPages: nextNumPages }: PDFDocumentProxy): void {
    setNumPages(nextNumPages);
    setError(null);
  }

  function onError(error: Error): void {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF. Please try again later.');
  }

  return (
    <div ref={containerRef} className='flex flex-col w-full h-[500px] ssm:h-[700px] bg-[#0A0C16] border border-white/10'>
      <div className='flex items-center justify-between p-4 bg-[#0A0C16] border-b border-white/10'>
        <h2 className='flex-1 font-bold text-fg-default text-center text-xl sm:text-2xl truncate'>
          {title}
        </h2>
        <div className='flex items-center space-x-2'>
          <button
            onClick={() => {
              const link = document.createElement('a');
              link.href = fileUrl as string;
              link.download = 'document.pdf';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            aria-label='download'
            className='text-fg-text hover:text-fg-default bg-transparent rounded-full hover:bg-white/[0.08] transition-colors p-2'
          >
            <IoMdDownload className='w-6 h-6' />
          </button>
          <button
            aria-label='close'
            onClick={() => setOpen(false)}
            className='text-fg-text hover:text-fg-default bg-transparent rounded-full hover:bg-white/[0.08] transition-colors p-2'
          >
            <IoMdClose className='w-6 h-6' />
          </button>
        </div>
      </div>
      <div className='flex-1 overflow-auto p-4 bg-[#0A0C16] flex flex-col items-center'>
        {error ? (
          <div className='bg-[#FF6369]/15 border border-[#FF6369]/30 text-[#FF8A8F] px-4 py-3 rounded relative' role='alert'>
            <strong className='font-bold'>Error!</strong>
            <span className='block sm:inline'> {error}</span>
          </div>
        ) : (
          <div className='w-full max-w-4xl'>
            <PdfDocument
              fileUrl={fileUrl}
              scale={scale}
              onDocumentLoadSuccess={onDocumentLoadSuccess}
              onError={onError}
              numPages={numPages}
            />
          </div>
        )}
      </div>
    </div>
  );
};

