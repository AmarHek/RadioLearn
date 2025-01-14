import { ComponentFixture, TestBed } from "@angular/core/testing";

import { InputModalComponent } from "./inputModal.component";

describe("ModalComponent", () => {
  let component: InputModalComponent;
  let fixture: ComponentFixture<InputModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InputModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InputModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
