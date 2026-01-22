// Revenue Statistics
export interface RevenueStatistics {
  totalRevenue: number;
  monthlyRevenue: number;
  dailyRevenue: number;
  revenueGrowth: number;
}

// Order Statistics
export interface OrderStatistics {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
}

// Product Statistics
export interface ProductStatistics {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
}

// User Statistics
export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  monthlyNewUsers: number;
}

// Recent Order
export interface RecentOrder {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  totalAmount: number;
  status: string;
  createdAt: string;
}

// Top Selling Product
export interface TopSellingProduct {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  totalSold: number;
  revenue: number;
}

// Dashboard Overview
export interface DashboardOverview {
  revenue: RevenueStatistics;
  orders: OrderStatistics;
  products: ProductStatistics;
  users: UserStatistics;
  recentOrders: RecentOrder[];
  topSellingProducts: TopSellingProduct[];
}

// Revenue Trend Data Point
export interface RevenueTrendDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

// Sales by Category
export interface SalesByCategory {
  _id: string;
  name: string;
  revenue: number;
  orderCount: number;
  quantitySold: number;
}

// API Response Types
export interface DashboardOverviewResponse {
  status: string;
  data: DashboardOverview;
}

export interface RevenueTrendResponse {
  status: string;
  data: RevenueTrendDataPoint[];
}

export interface SalesByCategoryResponse {
  status: string;
  data: SalesByCategory[];
}
