'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Eye, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  status: 'approved' | 'pending' | 'rejected';
  url?: string;
  uploadedAt: string;
  rejectionReason?: string;
}

interface DocumentsTabProps {
  riderId: string;
}

export default function DocumentsTab({ riderId }: DocumentsTabProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call - replace with actual API call
    const mockDocuments: Document[] = [
      {
        id: '1',
        name: "Driver's License",
        type: 'drivers_license',
        status: 'approved',
        url: '/documents/drivers_license.pdf',
        uploadedAt: '2024-02-15T10:30:00Z'
      },
      {
        id: '2',
        name: 'Vehicle Registration',
        type: 'vehicle_registration',
        status: 'approved',
        url: '/documents/vehicle_registration.pdf',
        uploadedAt: '2024-02-15T10:35:00Z'
      },
      {
        id: '3',
        name: 'Insurance Certificate',
        type: 'insurance',
        status: 'pending',
        url: '/documents/insurance.pdf',
        uploadedAt: '2024-03-01T09:20:00Z'
      },
      {
        id: '4',
        name: 'Identity Verification',
        type: 'identity',
        status: 'rejected',
        url: '/documents/identity.pdf',
        uploadedAt: '2024-02-20T14:15:00Z',
        rejectionReason: 'Document is not clear. Please upload a higher quality image.'
      }
    ];

    setTimeout(() => {
      setDocuments(mockDocuments);
      setLoading(false);
    }, 1000);
  }, [riderId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className='w-5 h-5 text-green-600' />;
      case 'rejected':
        return <XCircle className='w-5 h-5 text-red-600' />;
      case 'pending':
        return <Clock className='w-5 h-5 text-yellow-600' />;
      default:
        return <AlertCircle className='w-5 h-5 text-gray-400' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      drivers_license: "Driver's License",
      vehicle_registration: 'Vehicle Registration',
      insurance: 'Insurance Certificate',
      identity: 'Identity Verification',
      background_check: 'Background Check'
    };
    return labels[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleDownload = (document: Document) => {
    // Simulate download - replace with actual download logic
    console.log('Downloading document:', document.name);
  };

  const handleView = (document: Document) => {
    // Simulate view - replace with actual view logic
    console.log('Viewing document:', document.name);
  };

  if (loading)
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-[#6B7280]'>Loading documents...</div>
      </div>
    );

  const approvedCount = documents.filter(doc => doc.status === 'approved').length;
  const pendingCount = documents.filter(doc => doc.status === 'pending').length;
  const rejectedCount = documents.filter(doc => doc.status === 'rejected').length;

  return (
    <div className='flex flex-col gap-6 p-6 w-full'>
      {/* Document Status Overview */}
      <div className='grid grid-cols-3 gap-4'>
        <div className='bg-green-50 border border-green-200 rounded-[10px] p-4'>
          <div className='flex items-center gap-3'>
            <CheckCircle className='w-6 h-6 text-green-600' />
            <div>
              <p className='text-2xl font-bold text-green-800'>{approvedCount}</p>
              <p className='text-sm text-green-600'>Approved</p>
            </div>
          </div>
        </div>

        <div className='bg-yellow-50 border border-yellow-200 rounded-[10px] p-4'>
          <div className='flex items-center gap-3'>
            <Clock className='w-6 h-6 text-yellow-600' />
            <div>
              <p className='text-2xl font-bold text-yellow-800'>{pendingCount}</p>
              <p className='text-sm text-yellow-600'>Pending Review</p>
            </div>
          </div>
        </div>

        <div className='bg-red-50 border border-red-200 rounded-[10px] p-4'>
          <div className='flex items-center gap-3'>
            <XCircle className='w-6 h-6 text-red-600' />
            <div>
              <p className='text-2xl font-bold text-red-800'>{rejectedCount}</p>
              <p className='text-sm text-red-600'>Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className='bg-white border border-[#E5E7EB] rounded-[10px] shadow-sm'>
        <div className='p-6 border-b border-[#E5E7EB]'>
          <h2 className='text-xl font-semibold text-[#1F2937]'>Uploaded Documents</h2>
        </div>

        <div className='divide-y divide-[#E5E7EB]'>
          {documents.length === 0 ? (
            <div className='text-center py-12 text-[#6B7280]'>
              <FileText className='w-16 h-16 mx-auto mb-4 text-gray-300' />
              <h3 className='text-lg font-medium mb-2'>No documents uploaded</h3>
              <p className='text-sm'>This rider has not uploaded any documents yet.</p>
            </div>
          ) : (
            documents.map((document) => (
              <div key={document.id} className='p-6 hover:bg-gray-50 transition-colors'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <div className='p-2 bg-blue-50 rounded-lg'>
                      <FileText className='w-6 h-6 text-blue-600' />
                    </div>
                    
                    <div>
                      <h3 className='font-semibold text-[#1F2937] mb-1'>
                        {getDocumentTypeLabel(document.type)}
                      </h3>
                      <p className='text-sm text-[#6B7280] mb-2'>
                        Uploaded on {new Date(document.uploadedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      
                      {document.rejectionReason && (
                        <div className='flex items-start gap-2 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg'>
                          <AlertCircle className='w-4 h-4 text-red-600 mt-0.5 flex-shrink-0' />
                          <div>
                            <p className='text-sm font-medium text-red-800 mb-1'>Rejection Reason:</p>
                            <p className='text-sm text-red-700'>{document.rejectionReason}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='flex items-center gap-3'>
                    <div className='flex items-center gap-2'>
                      {getStatusIcon(document.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(document.status)}`}>
                        {document.status}
                      </span>
                    </div>

                    {document.url && (
                      <div className='flex gap-2'>
                        <button
                          onClick={() => handleView(document)}
                          className='p-2 text-[#6B7280] hover:text-[#1F2937] hover:bg-gray-100 rounded-lg transition-colors'
                          title='View document'
                        >
                          <Eye className='w-4 h-4' />
                        </button>
                        
                        <button
                          onClick={() => handleDownload(document)}
                          className='p-2 text-[#6B7280] hover:text-[#1F2937] hover:bg-gray-100 rounded-lg transition-colors'
                          title='Download document'
                        >
                          <Download className='w-4 h-4' />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}