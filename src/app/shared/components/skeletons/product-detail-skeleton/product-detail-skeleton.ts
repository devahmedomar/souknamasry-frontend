import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-product-detail-skeleton',
    imports: [CommonModule],
    templateUrl: './product-detail-skeleton.html',
    styleUrl: './product-detail-skeleton.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailSkeleton {}
