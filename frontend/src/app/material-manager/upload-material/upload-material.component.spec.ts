import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadMaterialComponent } from './upload-material.component';

describe('UploadMaterialComponent', () => {
  let component: UploadMaterialComponent;
  let fixture: ComponentFixture<UploadMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadMaterialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
