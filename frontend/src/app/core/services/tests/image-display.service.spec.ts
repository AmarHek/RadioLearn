import { TestBed } from '@angular/core/testing';

import { ImageDisplayService } from '../image-display.service';

describe('ImageDisplayService', () => {
  let service: ImageDisplayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageDisplayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
