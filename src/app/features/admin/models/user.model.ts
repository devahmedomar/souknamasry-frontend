export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'admin' | 'customer';
  isActive: boolean;
  city?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'admin' | 'customer';
  isActive?: boolean;
  city?: string;
  imageUrl?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: 'admin' | 'customer';
  isActive?: boolean;
  city?: string;
  imageUrl?: string;
}

export interface UpdateUserRoleDto {
  role: 'admin' | 'customer';
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalAdmins: number;
  totalCustomers: number;
  recentUsers: User[];
}

export interface UsersResponse {
  status: string;
  data: {
    users: User[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface UserResponse {
  status: string;
  data: User;
}

export interface UserStatisticsResponse {
  status: string;
  data: UserStatistics;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  role?: 'admin' | 'customer';
  isActive?: boolean;
  search?: string;
}
