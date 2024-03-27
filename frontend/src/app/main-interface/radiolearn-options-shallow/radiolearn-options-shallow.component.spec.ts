import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadiolearnOptionsShallowComponent } from './radiolearn-options-shallow.component';

describe('RadiolearnOptionsShallowComponent', () => {
  let component: RadiolearnOptionsShallowComponent;
  let fixture: ComponentFixture<RadiolearnOptionsShallowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RadiolearnOptionsShallowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RadiolearnOptionsShallowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
