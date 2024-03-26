import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogNoMaterialsComponent } from './dialog-no-materials.component';

describe('DialogNoMaterialsComponent', () => {
  let component: DialogNoMaterialsComponent;
  let fixture: ComponentFixture<DialogNoMaterialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogNoMaterialsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogNoMaterialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
