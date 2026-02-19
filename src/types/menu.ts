// Menu-related types based on API structure
export interface MenuItemProperty {
  name: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrls: string[];
  inStock: boolean;
  isPromoted: boolean;
  availableForSubscription: boolean;
  properties: string[];
  createdAt: string;
  updatedAt: string;
  restaurant: {
    id: string;
    businessName: string;
    businessEmail: string;
    profilePhotoUrl: string | null;
  };
  promotions: any[];
  totalOrders: number;
  totalFavorites: number;
}

export interface MenusByCategory {
  [category: string]: MenuItem[];
}

export interface MenuSummary {
  totalMeals: number;
  totalInStock: number;
  totalOutOfStock: number;
  totalPromoted: number;
  totalCategories: number;
  totalRevenue: number;
  outOfStockPercentage: number;
  promotedPercentage: number;
}

export interface CategoryStats {
  category: string;
  total: number;
  inStock: number;
  promoted: number;
  averagePrice: number;
  totalRevenue: number;
  count: number;
}

export interface MenuData {
  restaurant: {
    id: string;
    businessName: string;
    businessEmail: string;
    profilePhotoUrl: string | null;
  };
  menusByCategory: MenusByCategory;
  summary: MenuSummary;
  categoryStats: CategoryStats[];
}

export interface MenuApiResponse {
  success: boolean;
  data: MenuData;
}