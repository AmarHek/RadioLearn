import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogListVariablesComponent } from './dialog-list-variables.component';

describe('DialogListVariablesComponent', () => {
  let component: DialogListVariablesComponent;
  let fixture: ComponentFixture<DialogListVariablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogListVariablesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogListVariablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
