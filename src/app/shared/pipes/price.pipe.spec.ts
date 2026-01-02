import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PricePipe } from './price.pipe';

describe('PricePipe', () => {
    let pipe: PricePipe;
    let translateService: TranslateService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot()],
            providers: [PricePipe]
        });

        translateService = TestBed.inject(TranslateService);
        translateService.setDefaultLang('ar');
        translateService.use('ar');

        // Mock currency translation
        spyOn(translateService, 'instant').and.returnValue('جنيها');

        pipe = TestBed.inject(PricePipe);
    });

    it('should create', () => {
        expect(pipe).toBeTruthy();
    });

    it('should fix floating point precision errors', () => {
        const result = pipe.transform(814.9300000000001);
        expect(result).toBe('814.93 جنيها');
    });

    it('should fix another floating point error', () => {
        const result = pipe.transform(799.9200000000001);
        expect(result).toBe('799.92 جنيها');
    });

    it('should handle large numbers', () => {
        const result = pipe.transform(1234567.89);
        expect(result).toBe('1234567.89 جنيها');
    });

    it('should handle large numbers with grouping', () => {
        const result = pipe.transform(1234567.89, undefined, 2, true);
        expect(result).toBe('1,234,567.89 جنيها');
    });

    it('should handle zero', () => {
        const result = pipe.transform(0);
        expect(result).toBe('0.00 جنيها');
    });

    it('should handle null', () => {
        const result = pipe.transform(null);
        expect(result).toBe('0');
    });

    it('should handle undefined', () => {
        const result = pipe.transform(undefined);
        expect(result).toBe('0');
    });

    it('should handle custom decimal places', () => {
        const result = pipe.transform(99.996, undefined, 0);
        expect(result).toBe('100 جنيها');
    });

    it('should handle custom currency', () => {
        const result = pipe.transform(100, 'USD');
        expect(result).toBe('100.00 USD');
    });
});
