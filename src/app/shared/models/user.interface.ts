export interface User {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: 'customer' | 'admin';
    isActive: boolean;
    imageUrl?: string;
    city?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    imageUrl?: string;
    city?: string;
}

export interface UserResponse {
    success: boolean;
    data: User;
}
