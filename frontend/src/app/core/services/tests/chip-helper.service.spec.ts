import { TestBed } from '@angular/core/testing';

import { ChipHelperService } from '../chip-helper.service';

describe('ChipHelperService', () => {
  let service: ChipHelperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChipHelperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
