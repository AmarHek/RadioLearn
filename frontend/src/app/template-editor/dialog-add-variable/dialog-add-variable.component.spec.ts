import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddVariableComponent } from './dialog-add-variable.component';

describe('DialogAddVariableComponent', () => {
  let component: DialogAddVariableComponent;
  let fixture: ComponentFixture<DialogAddVariableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogAddVariableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogAddVariableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
