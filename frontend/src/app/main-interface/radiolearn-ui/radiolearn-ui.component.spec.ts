import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiolearnUiComponent } from './radiolearn-ui.component';

describe('JudgeMatComponent', () => {
  let component: RadiolearnUiComponent;
  let fixture: ComponentFixture<RadiolearnUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RadiolearnUiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RadiolearnUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
