import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorOptionsComponent } from '@app/template-editor';

describe('ReportEditOptionsComponent', () => {
  let component: EditorOptionsComponent;
  let fixture: ComponentFixture<EditorOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditorOptionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
