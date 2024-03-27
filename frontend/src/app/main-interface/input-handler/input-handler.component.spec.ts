import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputHandlerComponent } from './input-handler.component';

describe('InputMaterialHandlerComponent', () => {
  let component: InputHandlerComponent;
  let fixture: ComponentFixture<InputHandlerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputHandlerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputHandlerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
