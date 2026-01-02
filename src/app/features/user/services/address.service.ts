import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Address, AddressResponse, AddressesResponse } from '../../../shared/models/address.interface';

export interface CreateAddressRequest {
    name: string;
    phone: string;
    city: string;
    area: string;
    street: string;
    landmark?: string;
    apartmentNumber?: string;
    isDefault?: boolean;
}

export type UpdateAddressRequest = Partial<CreateAddressRequest>;

@Injectable({
    providedIn: 'root'
})
export class AddressService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}addresses`;

    getAddresses(): Observable<AddressesResponse> {
        return this.http.get<AddressesResponse>(this.baseUrl);
    }

    getAddress(id: string): Observable<AddressResponse> {
        return this.http.get<AddressResponse>(`${this.baseUrl}/${id}`);
    }

    createAddress(data: CreateAddressRequest): Observable<AddressResponse> {
        return this.http.post<AddressResponse>(this.baseUrl, data);
    }

    updateAddress(id: string, data: UpdateAddressRequest): Observable<AddressResponse> {
        return this.http.put<AddressResponse>(`${this.baseUrl}/${id}`, data);
    }

    deleteAddress(id: string): Observable<{ success: boolean }> {
        return this.http.delete<{ success: boolean }>(`${this.baseUrl}/${id}`);
    }
}
