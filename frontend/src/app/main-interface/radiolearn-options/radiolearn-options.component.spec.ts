import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiolearnOptionsComponent } from './radiolearn-options.component';

describe('RadiolearnOptionsComponent', () => {
  let component: RadiolearnOptionsComponent;
  let fixture: ComponentFixture<RadiolearnOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RadiolearnOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RadiolearnOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
