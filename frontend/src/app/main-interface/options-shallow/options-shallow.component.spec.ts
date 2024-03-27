import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptionsShallowComponent } from './options-shallow.component';

describe('RadiolearnOptionsShallowComponent', () => {
  let component: OptionsShallowComponent;
  let fixture: ComponentFixture<OptionsShallowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OptionsShallowComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OptionsShallowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
