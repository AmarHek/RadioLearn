import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportUiComponent } from './report-ui.component';

describe('WorkspaceComponent', () => {
  let component: ReportUiComponent;
  let fixture: ComponentFixture<ReportUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportUiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
