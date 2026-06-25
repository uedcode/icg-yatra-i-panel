import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CommonParallelFileViewerComponent } from './common-parallel-file-viewer.component';
import { AuthService } from 'src/app/service/auth/auth.service';

describe('CommonParallelFileViewerComponent', () => {
  let component: CommonParallelFileViewerComponent;
  let fixture: ComponentFixture<CommonParallelFileViewerComponent>;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['viewFile']);

    return TestBed.configureTestingModule({
      declarations: [CommonParallelFileViewerComponent],
      providers: [{ provide: AuthService, useValue: auth }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonParallelFileViewerComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should detect pdf files for inline PDF rendering', () => {
    component.fileUrl = 'http://localhost:8084/yatra-i/data/sample.pdf?t=1';

    expect(component.isPdf).toBeTrue();
  });

  it('should detect non-pdf files for image rendering', () => {
    component.fileUrl = 'http://localhost:8084/yatra-i/data/sample.png?t=1';

    expect(component.isPdf).toBeFalse();
  });

  it('should open the current file through centralized view-file flow', () => {
    component.fileUrl = 'claim/123/support_doc/sample.pdf';

    component.openInNewTab();

    expect(auth.viewFile).toHaveBeenCalledOnceWith('claim/123/support_doc/sample.pdf');
  });

  it('should emit close when viewer is closed', () => {
    spyOn(component.closeViewer, 'emit');

    component.close();

    expect(component.closeViewer.emit).toHaveBeenCalled();
  });
});
