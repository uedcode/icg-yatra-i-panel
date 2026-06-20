import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonDocumentDetailComponent } from './common-document-detail.component';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CodeDocInfoApiService } from 'src/app/service/api/code/code-doc-info-api.service';
import { CommonService } from 'src/app/service/core/common.service';

describe('CommonDocumentDetailComponent', () => {
  let component: CommonDocumentDetailComponent;
  let fixture: ComponentFixture<CommonDocumentDetailComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['viewFile']);

    return TestBed.configureTestingModule({
      declarations: [CommonDocumentDetailComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: CodeDocInfoApiService, useValue: {} },
        { provide: CommonService, useValue: {} }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonDocumentDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not render the document detail section when no form documents exist', () => {
    component.formDocsDTOs = [];

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('DOCUMENTS');
  });

  it('renders document rows including Other document names', () => {
    component.formDocsDTOs = [
      {
        codeDocInfoDTO: { docName: 'Bill' },
        url: '/docs/bill.pdf'
      },
      {
        codeDocInfoDTO: { docName: 'Other' },
        otherDocName: 'Boarding Pass',
        url: '/docs/boarding-pass.pdf'
      }
    ];

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');
    expect(text).toContain('DOCUMENTS');
    expect(text).toContain('Bill');
    expect(text).toContain('Other (Boarding Pass)');
  });

  it('opens a document through AuthService viewFile when View is clicked', () => {
    component.formDocsDTOs = [
      {
        codeDocInfoDTO: { docName: 'Bill' },
        url: '/docs/bill.pdf'
      }
    ];
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[title="View"]');
    button.click();

    expect(authService.viewFile).toHaveBeenCalledOnceWith('/docs/bill.pdf');
  });
});

