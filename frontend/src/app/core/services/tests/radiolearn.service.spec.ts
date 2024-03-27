import { TestBed } from '@angular/core/testing';

import { RadiolearnService } from '../radiolearn.service';

describe('RadiolearnService', () => {
  let service: RadiolearnService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RadiolearnService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
