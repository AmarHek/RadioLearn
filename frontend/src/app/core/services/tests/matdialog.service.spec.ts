import { TestBed } from '@angular/core/testing';

import { MatDialogService } from '../mat-dialog.service';

describe('MatdialogService', () => {
  let service: MatDialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
