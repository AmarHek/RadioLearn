import { TestBed } from '@angular/core/testing';

import { FilesSortingService } from '../files-sorting.service';

describe('FilesSortingService', () => {
  let service: FilesSortingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilesSortingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
