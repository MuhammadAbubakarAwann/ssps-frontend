'use client';

import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import Image from 'next/image';
import { fetchRestaurantDocuments } from '@/lib/server-actions/restaurant-actions';
import type { DocumentsApiResponse, DocumentForUI } from '@/types/documents';

// Helper function to extract filename from URL
const getFilenameFromUrl = (url: string | null | undefined): string => {
  if (!url) return 'document.pdf';

  const urlParts = url.split('/');
  const filename = urlParts[urlParts.length - 1];
  // If it's a UUID filename, use a generic name
  if (filename.includes('-') && filename.includes('.')) {
    const extension = filename.split('.').pop();
    return `document.${extension}`;
  }
  return filename || 'document.pdf';
};

interface DocumentsTabProps {
  restaurantId: string;
}

export default function DocumentsTab({ restaurantId }: DocumentsTabProps) {
  const [selectedDocument, setSelectedDocument] = useState<DocumentForUI | null>(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [documentsData, setDocumentsData] = useState<DocumentsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch documents data
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchRestaurantDocuments(restaurantId);
        setDocumentsData(data);
      } catch (err) {
        console.error('Error loading documents:', err);
        setError(err instanceof Error ? err.message : 'Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      void loadDocuments();
    }
  }, [restaurantId]);

  // Transform API data to UI format
  const documents: DocumentForUI[] = documentsData
    ? Object.entries(documentsData.data.documents).map(([key, doc], index) => ({
        id: `${key}_${index}`,
        category: doc.name,
        filename: getFilenameFromUrl(doc.url),
        url: doc.url || '',
        uploaded: doc.uploaded,
        required: doc.required
      }))
    : [];

  const handleViewDocument = (document: DocumentForUI) => {
    setSelectedDocument(document);
    setImageViewerOpen(true);
  };

  if (loading)
    return (
      <div className='w-full h-full overflow-y-auto bg-white rounded-lg'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <p className='text-gray-600'>Loading documents...</p>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className='w-full h-full overflow-y-auto bg-white rounded-lg'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='text-red-500 text-lg mb-2'>Error loading documents</div>
            <p className='text-gray-600'>{error}</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className='w-full h-full overflow-y-auto bg-white rounded-lg'>
      <div className='flex flex-col gap-6 p-6'>
        {documents.map((document) => (
          <div key={document.id} className='flex flex-col gap-3'>
            {/* Category Title */}
            <h3 className='text-base font-semibold text-gray-900'>
              {document.category}
            </h3>

            {/* Document Card */}
            <div className={`flex items-center justify-between p-4 bg-white border rounded-[6px] hover:shadow-sm transition-all ${
              document.uploaded 
                ? 'border-gray-200 hover:border-gray-300' 
                : 'border-red-200 bg-red-50'
            }`}>
              {/* File Info */}
              <div className='flex items-center gap-3'>
                {/* File Icon */}
                <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg ${
                  document.uploaded 
                    ? 'bg-amber-50' 
                    : 'bg-red-100'
                }`}>
                  <FileText className={`w-6 h-6 ${
                    document.uploaded 
                      ? 'text-amber-500' 
                      : 'text-red-500'
                  }`} />
                </div>

                {/* Filename and Status */}
                <div className='flex flex-col'>
                  <span className='text-sm text-gray-700 font-medium'>
                    {document.filename}
                  </span>
                  {!document.uploaded && (
                    <span className='text-xs text-red-500'>
                      Not uploaded
                    </span>
                  )}
                </div>
              </div>

              {/* View Button */}
              {document.uploaded ? (
                <button
                  onClick={() => handleViewDocument(document)}
                  className='px-4 py-2 text-sm font-semibold text-amber-500 hover:text-amber-600 transition-colors hover:bg-amber-50 rounded-lg'
                >
                  View
                </button>
              ) : (
                <span className='px-4 py-2 text-sm font-medium text-gray-400 rounded-lg'>
                  Missing
                </span>
              )}
            </div>
          </div>
        ))}
        
        {documents.length === 0 && (
          <div className='text-center py-12'>
            <p className='text-gray-600'>No documents available</p>
          </div>
        )}
      </div>

      {/* Image Viewer Modal */}
      {imageViewerOpen && selectedDocument && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80'>
          <div className='relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden'>
            {/* Header */}
            <div className='flex items-center justify-between p-4 border-b border-gray-200'>
              <h3 className='text-lg font-semibold text-gray-900'>{selectedDocument.category}</h3>
              <button
                onClick={() => setImageViewerOpen(false)}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>

            {/* Image Content */}
            <div className='p-4 max-h-[80vh] overflow-auto'>
              <div className='flex justify-center'>
                <Image
                  src={selectedDocument.url}
                  alt={selectedDocument.category}
                  width={800}
                  height={600}
                  className='max-w-full max-h-full object-contain rounded-lg'
                  style={{ width: 'auto', height: 'auto' }}
                />
              </div>
            </div>

            {/* Footer with download link */}
            <div className='flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50'>
              <span className='text-sm text-gray-600'>{selectedDocument.filename}</span>
              <a
                href={selectedDocument.url}
                download={selectedDocument.filename}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium'
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                </svg>
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
