import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationPopupComponent } from '@app/main-interface';

describe('AnnotationPopupComponent', () => {
  let component: AnnotationPopupComponent;
  let fixture: ComponentFixture<AnnotationPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnnotationPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnotationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
