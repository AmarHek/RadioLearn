import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddBoxComponent } from './dialog-add-box.component';

describe('DialogAddBoxComponent', () => {
  let component: DialogAddBoxComponent;
  let fixture: ComponentFixture<DialogAddBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogAddBoxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogAddBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
