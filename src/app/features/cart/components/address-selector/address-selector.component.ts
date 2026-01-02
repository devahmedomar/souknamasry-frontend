import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Address } from '../../../../shared/models/address.interface';

/**
 * Address Selector Component - Displays and manages shipping addresses
 * Responsibilities:
 * - Display list of addresses
 * - Allow selecting an address
 * - Handle adding new address
 * - Handle deleting address
 */
@Component({
    selector: 'app-address-selector',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './address-selector.component.html',
    styleUrl: './address-selector.component.css'
})
export class AddressSelectorComponent {
    // Inputs
    addresses = input<Address[]>([]);
    selectedAddressId = input<string | null>(null);
    loading = input<boolean>(false);

    // Outputs
    selectAddress = output<Address>();
    addNewAddress = output<void>();
    deleteAddress = output<string>();

    // Methods
    onSelectAddress(address: Address): void {
        this.selectAddress.emit(address);
    }

    onAddNewAddress(): void {
        this.addNewAddress.emit();
    }

    onDeleteAddress(addressId: string, event: Event): void {
        event.stopPropagation();
        this.deleteAddress.emit(addressId);
    }

    isSelected(address: Address): boolean {
        return address._id === this.selectedAddressId();
    }

    getAddressTypeLabel(type: string): string {
        const typeMap: { [key: string]: string } = {
            'home': 'ADDRESSES.HOME',
            'work': 'ADDRESSES.WORK',
            'other': 'ADDRESSES.OTHER'
        };
        return typeMap[type] || type;
    }
}
