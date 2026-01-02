export interface Address {
    _id?: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode?: string;
    country: string;
    addressType: 'home' | 'work' | 'other';
    isDefault?: boolean;
}

export interface AddressResponse {
    status: string;
    data: Address;
}

export interface AddressesResponse {
    status: string;
    data: Address[];
}
