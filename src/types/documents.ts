// Types for Documents API Response
export interface DocumentItem {
  name: string;
  url: string;
  uploaded: boolean;
  required: boolean;
}

export interface RestaurantDocuments {
  foodServiceLicense: DocumentItem;
  governmentRegistrationCertificate: DocumentItem;
  healthInspectionReport: DocumentItem;
}

export interface DocumentsSummary {
  totalRequired: number;
  uploadedCount: number;
  completionPercentage: number;
  allDocumentsUploaded: boolean;
  lastUpdated: string;
}

export interface DocumentsRestaurant {
  id: string;
  businessName: string;
  businessEmail: string;
  verificationStatus: string;
  isDocumentsVerified: boolean;
}

export interface DocumentsApiResponse {
  success: boolean;
  data: {
    restaurant: DocumentsRestaurant;
    documents: RestaurantDocuments;
    summary: DocumentsSummary;
  };
}

export interface DocumentForUI {
  id: string;
  category: string;
  filename: string;
  url: string;
  uploaded: boolean;
  required: boolean;
}