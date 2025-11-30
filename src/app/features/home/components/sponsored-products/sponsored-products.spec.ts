import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SponsoredProducts } from './sponsored-products';

describe('SponsoredProducts', () => {
  let component: SponsoredProducts;
  let fixture: ComponentFixture<SponsoredProducts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SponsoredProducts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SponsoredProducts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
