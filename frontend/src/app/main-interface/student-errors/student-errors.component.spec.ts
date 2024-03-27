import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentErrorsComponent } from './student-errors.component';

describe('RadiolearnDifferencesComponent', () => {
  let component: StudentErrorsComponent;
  let fixture: ComponentFixture<StudentErrorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentErrorsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentErrorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
