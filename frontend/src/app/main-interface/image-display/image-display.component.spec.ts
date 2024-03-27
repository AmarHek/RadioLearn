import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ImageDisplayStudentComponent } from "@app/shared";

describe("InlineImageDisplayStudentComponent", () => {
  let component: ImageDisplayStudentComponent;
  let fixture: ComponentFixture<ImageDisplayStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageDisplayStudentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageDisplayStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
