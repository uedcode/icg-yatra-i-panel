import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

import { CommonDocumentComponent } from './common-document.component';
import { AuthService } from 'src/app/service/auth.service';
import { CodeDocInfoService } from 'src/app/service/master/codeDocInfo.service';
import { CommonService } from 'src/app/service/common.service';
import { FormManageService } from 'src/app/service/formManage.service';

describe('CommonDocumentComponent', () => {
  let component: CommonDocumentComponent;
  let fixture: ComponentFixture<CommonDocumentComponent>;
  let commonService: jasmine.SpyObj<CommonService>;
  let authService: jasmine.SpyObj<AuthService>;
  let codeDocInfoService: jasmine.SpyObj<CodeDocInfoService>;
  let routeQueryParams: Subject<any>;
  let formDetail$: Subject<any>;
  let documentList$: Subject<any>;
  let docFileUrl$: Subject<any>;
  let docFileUrlDeleted$: Subject<any>;
  let formManageService: any;

  const billDoc = { id: 1, docName: 'Bill' };
  const ticketDoc = { id: 2, docName: 'Ticket' };
  const otherDoc = { id: 99, docName: 'Other' };

  beforeEach(() => {
    routeQueryParams = new Subject<any>();
    formDetail$ = new Subject<any>();
    documentList$ = new Subject<any>();
    docFileUrl$ = new Subject<any>();
    docFileUrlDeleted$ = new Subject<any>();

    commonService = jasmine.createSpyObj<CommonService>('CommonService', [
      'checkForValidFile',
      'showMessage'
    ]);
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['viewFile']);
    codeDocInfoService = jasmine.createSpyObj<CodeDocInfoService>('CodeDocInfoService', [
      'setDocument'
    ]);
    formManageService = {
      deleteByUrl: jasmine.createSpy('deleteByUrl'),
      docFileUrl: docFileUrl$,
      docFileUrlDeleted: docFileUrlDeleted$,
      documentList: documentList$,
      formDetail: formDetail$,
      getDocument: jasmine.createSpy('getDocument'),
      getSingleForm: jasmine.createSpy('getSingleForm'),
      uploadImg: jasmine.createSpy('uploadImg')
    };

    commonService.checkForValidFile.and.returnValue(true);

    return TestBed.configureTestingModule({
      declarations: [CommonDocumentComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParams: routeQueryParams } },
        { provide: AuthService, useValue: authService },
        { provide: CodeDocInfoService, useValue: codeDocInfoService },
        { provide: CommonService, useValue: commonService },
        { provide: FormManageService, useValue: formManageService }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonDocumentComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads document master data directly when the route has only subFormId', () => {
    component.ngOnInit();

    routeQueryParams.next({ subFormId: 'PMT' });
    documentList$.next([billDoc, otherDoc]);

    expect(component.subFormId).toBe('PMT');
    expect(formManageService.getDocument).toHaveBeenCalledOnceWith('PMT');
    expect(component.documentList).toEqual([billDoc, otherDoc]);
    expect(component.tempDocumentList).toEqual([billDoc, otherDoc]);
  });

  it('loads form details for edit route and publishes existing documents', () => {
    const existingDocuments = [
      {
        formDocsId: 7,
        formDTO: { id: 'FORM-1' },
        codeDocInfoDTO: { id: 1, docName: 'Bill' },
        url: '/docs/bill.pdf'
      }
    ];

    component.ngOnInit();
    routeQueryParams.next({ id: 'FORM-1', subFormId: 'PMT' });
    formDetail$.next({
      formDocsDTOs: existingDocuments,
      codeSubFormDTO: { subFormId: 'PMT' }
    });

    expect(formManageService.getSingleForm).toHaveBeenCalled();
    expect(component.documentDtos).toEqual(existingDocuments);
    expect(codeDocInfoService.setDocument).toHaveBeenCalledWith(existingDocuments);
    expect(component.subFormId).toBe('PMT');
    expect(formManageService.getDocument).toHaveBeenCalledWith('PMT');
  });

  it('clears form references from existing documents for supplementary route', () => {
    const documents = [
      {
        formDocsId: 10,
        formDTO: { id: 'FORM-10' },
        codeDocInfoDTO: { id: 1, docName: 'Bill' }
      }
    ];

    const result = component.clearFormDTOIfSupplementry(documents, 'SUP-1');

    expect(result[0].formDocsId).toBeNull();
    expect(result[0].formDTO).toBeNull();
    expect(result[0].codeDocInfoDTO.docName).toBe('Bill');
  });

  it('filters already uploaded document names case-insensitively and keeps Other available', () => {
    component.formId = 'FORM-2';
    component.subFormId = 'LTC';

    component.getDocument([
      { codeDocInfoDTO: { id: 1, docName: 'bill' } }
    ]);
    documentList$.next([billDoc, ticketDoc, otherDoc]);

    expect(formManageService.getDocument).toHaveBeenCalledOnceWith('LTC');
    expect(component.tempDocumentList).toEqual([ticketDoc, otherDoc]);
  });

  it('rejects invalid uploaded files and clears the pending document url', () => {
    commonService.checkForValidFile.and.returnValue(false);
    component.documentObj = { url: '/old.pdf' };

    component.uploadImg({ currentTarget: { files: [] } }, 'url');

    expect(component.documentObj.url).toBeNull();
    expect(formManageService.uploadImg).not.toHaveBeenCalled();
  });

  it('uploads a valid file and stores the returned document url', () => {
    const event = { currentTarget: { files: [new File(['x'], 'bill.pdf')] } };
    component.documentObj = {};

    component.uploadImg(event, 'url');
    docFileUrl$.next('/uploaded/bill.pdf');

    expect(formManageService.uploadImg).toHaveBeenCalledOnceWith(event);
    expect(component.documentObj.url).toBe('/uploaded/bill.pdf');
  });

  it('deletes an uploaded file url and clears the pending document url', () => {
    component.documentObj = { url: '/uploaded/bill.pdf' };

    component.deleteDoc('url');
    docFileUrlDeleted$.next(true);

    expect(formManageService.deleteByUrl).toHaveBeenCalledOnceWith('/uploaded/bill.pdf');
    expect(component.documentObj.url).toBeNull();
  });

  it('validates document name, upload url, valid selection, and Other document name', () => {
    component.tempDocumentList = [otherDoc];
    component.documentDtos = [];

    component.documentObj = {};
    component.addDocument();
    expect(commonService.showMessage).toHaveBeenCalledWith(
      'Please select a document name.',
      'danger'
    );

    component.documentObj = { docName: 'Bill' };
    component.addDocument();
    expect(commonService.showMessage).toHaveBeenCalledWith(
      'Please upload the document before adding.',
      'danger'
    );

    component.documentObj = { docName: 'Missing', url: '/docs/missing.pdf' };
    component.addDocument();
    expect(commonService.showMessage).toHaveBeenCalledWith(
      'Invalid document selection.',
      'danger'
    );

    component.documentObj = { docName: 'Other', url: '/docs/other.pdf', otherDocName: '   ' };
    component.addDocument();
    expect(commonService.showMessage).toHaveBeenCalledWith(
      'Please enter the other document name.',
      'danger'
    );
  });

  it('adds a selected non-Other document, removes it from choices, publishes, and resets', () => {
    component.tempDocumentList = [billDoc, otherDoc];
    component.documentList = [billDoc, otherDoc];
    component.documentDtos = [];
    component.documentObj = {
      docName: 'Bill',
      url: '/docs/bill.pdf'
    };

    component.addDocument();

    expect(component.documentDtos).toEqual([
      {
        docName: 'Bill',
        url: '/docs/bill.pdf',
        otherDocName: '',
        descr: '',
        codeDocInfoDTO: { id: 1, docName: 'Bill' }
      }
    ]);
    expect(component.tempDocumentList).toEqual([otherDoc]);
    expect(codeDocInfoService.setDocument).toHaveBeenCalledWith(component.documentDtos);
    expect(component.documentObj).toEqual({});
    expect(component.docIndex).toBeNull();
    expect(component.isOtherDoc).toBeFalse();
  });

  it('prevents duplicate uploaded documents by document name', () => {
    component.tempDocumentList = [billDoc];
    component.documentDtos = [
      { codeDocInfoDTO: { id: 1, docName: 'Bill' }, url: '/docs/old-bill.pdf' }
    ];
    component.documentObj = { docName: 'Bill', url: '/docs/new-bill.pdf' };

    component.addDocument();

    expect(commonService.showMessage).toHaveBeenCalledWith(
      'Document already added.',
      'warning'
    );
    expect(component.documentDtos.length).toBe(1);
  });

  it('adds Other documents with trimmed display name and keeps Other selectable', () => {
    component.tempDocumentList = [otherDoc];
    component.documentList = [otherDoc];
    component.documentDtos = [];
    component.documentObj = {
      docName: 'Other',
      otherDocName: '  Boarding Pass  ',
      url: '/docs/boarding-pass.pdf'
    };

    component.addDocument();

    expect(component.documentDtos[0].otherDocName).toBe('Boarding Pass');
    expect(component.documentDtos[0].descr).toBe('Boarding Pass');
    expect(component.documentDtos[0].codeDocInfoDTO).toEqual({ id: 99, docName: 'Other' });
    expect(component.tempDocumentList).toEqual([otherDoc]);
  });

  it('restores selectable document while editing and when deleting existing entries', () => {
    const uploadedBill = {
      codeDocInfoDTO: { id: 1, docName: 'Bill' },
      url: '/docs/bill.pdf'
    };
    component.documentList = [billDoc, otherDoc];
    component.tempDocumentList = [otherDoc];
    component.documentDtos = [uploadedBill];

    component.editDocument(uploadedBill, 0);

    expect(component.documentObj).toEqual({
      docName: 'Bill',
      otherDocName: '',
      url: '/docs/bill.pdf'
    });
    expect(component.tempDocumentList).toEqual([otherDoc, billDoc]);
    expect(component.docIndex).toBe(0);
    expect(component.isEdit).toBeTrue();

    component.deleteDocument(uploadedBill, 0);

    expect(component.documentDtos).toEqual([]);
    expect(codeDocInfoService.setDocument).toHaveBeenCalledWith([]);
    expect(component.documentObj).toEqual({});
    expect(component.isEdit).toBeFalse();
  });
});
