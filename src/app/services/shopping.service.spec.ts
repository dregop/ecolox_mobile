import { TestBed } from '@angular/core/testing';

import { ShoppingApiService } from './shopping.service';

describe('ShoppingService', () => {
  let service: ShoppingApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShoppingApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
