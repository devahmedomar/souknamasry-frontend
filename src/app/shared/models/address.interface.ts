export interface Address {
    _id?: string;
    name: string;
    phone: string;
    city: string;
    area: string;
    street: string;
    landmark?: string;
    apartmentNumber?: string;
    isDefault?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface AddressResponse {
    success: boolean;
    data: Address;
}

export interface AddressesResponse {
    success: boolean;
    data: Address[];
}
