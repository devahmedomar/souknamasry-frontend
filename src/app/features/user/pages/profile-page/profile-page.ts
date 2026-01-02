import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ProfileService } from '../../services/profile.service';
import { AddressService, CreateAddressRequest } from '../../services/address.service';
import { User, UpdateProfileRequest } from '../../../../shared/models/user.interface';
import { Address } from '../../../../shared/models/address.interface';

@Component({
    selector: 'app-profile-page',
    imports: [CommonModule, ReactiveFormsModule, TranslateModule],
    templateUrl: './profile-page.html',
    styleUrl: './profile-page.css'
})
export class ProfilePage implements OnInit {
    private fb = inject(FormBuilder);
    private profileService = inject(ProfileService);
    private addressService = inject(AddressService);
    private messageService = inject(MessageService);
    private translate = inject(TranslateService);

    user = signal<User | null>(null);
    addresses = signal<Address[]>([]);
    isLoading = signal(true);
    isProfileLoading = signal(false);
    isAddressLoading = signal(false);

    activeTab = signal<'profile' | 'addresses'>('profile');
    isEditingProfile = signal(false);
    showAddressModal = signal(false);
    editingAddressId = signal<string | null>(null);

    profileForm: FormGroup = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        phone: [''],
        city: ['']
    });

    addressForm: FormGroup = this.fb.group({
        name: ['', Validators.required],
        phone: ['', Validators.required],
        city: ['', Validators.required],
        area: ['', Validators.required],
        street: ['', Validators.required],
        landmark: [''],
        apartmentNumber: [''],
        isDefault: [false]
    });

    ngOnInit() {
        this.loadProfile();
        this.loadAddresses();
    }

    loadProfile() {
        this.isLoading.set(true);
        this.profileService.getProfile().subscribe({
            next: (response) => {
                this.user.set(response.data);
                this.profileForm.patchValue({
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    phone: response.data.phone || '',
                    city: response.data.city || ''
                });
                this.isLoading.set(false);
            },
            error: (err) => {
                this.isLoading.set(false);
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('COMMON.ERROR'),
                    detail: this.translate.instant('COMMON.ERROR_OCCURRED')
                });
                console.error('Error loading profile', err);
            }
        });
    }

    loadAddresses() {
        this.addressService.getAddresses().subscribe({
            next: (response) => {
                this.addresses.set(response.data);
            },
            error: (err) => {
                console.error('Error loading addresses', err);
            }
        });
    }

    setActiveTab(tab: 'profile' | 'addresses') {
        this.activeTab.set(tab);
    }

    toggleEditProfile() {
        this.isEditingProfile.update(v => !v);
    }

    saveProfile() {
        if (this.profileForm.valid) {
            this.isProfileLoading.set(true);
            const data: UpdateProfileRequest = this.profileForm.value;

            this.profileService.updateProfile(data).subscribe({
                next: (response) => {
                    this.user.set(response.data);
                    this.isProfileLoading.set(false);
                    this.isEditingProfile.set(false);
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant('ACCOUNT.PROFILE_UPDATED')
                    });
                },
                error: (err) => {
                    this.isProfileLoading.set(false);
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('COMMON.ERROR_OCCURRED')
                    });
                    console.error('Error updating profile', err);
                }
            });
        } else {
            this.profileForm.markAllAsTouched();
        }
    }

    openAddressModal(address?: Address) {
        if (address) {
            this.editingAddressId.set(address._id || null);
            this.addressForm.patchValue({
                name: address.name,
                phone: address.phone,
                city: address.city,
                area: address.area,
                street: address.street,
                landmark: address.landmark || '',
                apartmentNumber: address.apartmentNumber || '',
                isDefault: address.isDefault || false
            });
        } else {
            this.editingAddressId.set(null);
            this.addressForm.reset({ isDefault: false });
        }
        this.showAddressModal.set(true);
    }

    closeAddressModal() {
        this.showAddressModal.set(false);
        this.editingAddressId.set(null);
        this.addressForm.reset({ isDefault: false });
    }

    saveAddress() {
        if (this.addressForm.valid) {
            this.isAddressLoading.set(true);
            const data: CreateAddressRequest = this.addressForm.value;
            const editId = this.editingAddressId();

            const request$ = editId
                ? this.addressService.updateAddress(editId, data)
                : this.addressService.createAddress(data);

            request$.subscribe({
                next: () => {
                    this.isAddressLoading.set(false);
                    this.closeAddressModal();
                    this.loadAddresses();
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant(editId ? 'ADDRESSES.ADDRESS_UPDATED' : 'ADDRESSES.ADDRESS_ADDED')
                    });
                },
                error: (err) => {
                    this.isAddressLoading.set(false);
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('COMMON.ERROR_OCCURRED')
                    });
                    console.error('Error saving address', err);
                }
            });
        } else {
            this.addressForm.markAllAsTouched();
        }
    }

    deleteAddress(id: string) {
        if (confirm(this.translate.instant('ADDRESSES.CONFIRM_DELETE'))) {
            this.addressService.deleteAddress(id).subscribe({
                next: () => {
                    this.loadAddresses();
                    this.messageService.add({
                        severity: 'success',
                        summary: this.translate.instant('COMMON.SUCCESS'),
                        detail: this.translate.instant('ADDRESSES.ADDRESS_DELETED')
                    });
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('COMMON.ERROR'),
                        detail: this.translate.instant('COMMON.ERROR_OCCURRED')
                    });
                    console.error('Error deleting address', err);
                }
            });
        }
    }

    setDefaultAddress(id: string) {
        this.addressService.updateAddress(id, { isDefault: true }).subscribe({
            next: () => {
                this.loadAddresses();
                this.messageService.add({
                    severity: 'success',
                    summary: this.translate.instant('COMMON.SUCCESS'),
                    detail: this.translate.instant('ADDRESSES.ADDRESS_UPDATED')
                });
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('COMMON.ERROR'),
                    detail: this.translate.instant('COMMON.ERROR_OCCURRED')
                });
                console.error('Error setting default address', err);
            }
        });
    }
}
