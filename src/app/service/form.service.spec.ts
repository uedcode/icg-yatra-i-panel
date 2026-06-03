import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CommonService } from 'src/app/service/core/common.service';
import { FormService } from 'src/app/service/form/form.service';

describe('FormService', () => {
  let service: FormService;
  let httpMock: HttpTestingController;
  let commonService: jasmine.SpyObj<CommonService>;

  beforeEach(() => {
    commonService = jasmine.createSpyObj<CommonService>('CommonService', [
      'parseResponse',
      'download'
    ]);
    commonService.parseResponse.and.callFake((response) => response);

    TestBed.configureTestingModule({
      providers: [
        FormService,
        { provide: CommonService, useValue: commonService }
      ]
    });

    service = TestBed.inject(FormService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('posts form create or update payload to the form endpoint', () => {
    const payload = { formId: 'FORM-1', claimType: 'PMT' };
    const response = { success: true, formId: 'FORM-1' };
    let actual: unknown;

    service.createOrUpdate(payload).subscribe((value) => (actual = value));

    const req = httpMock.expectOne('form/createOrUpdate');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(response);

    expect(commonService.parseResponse).toHaveBeenCalledWith(response);
    expect(actual).toEqual(response);
  });

  it('gets a single form with the supplied request config', () => {
    const response = { id: 12, status: 'DRAFT' };
    let actual: unknown;

    service.getSingleForm({ headers: { formId: '12' } }).subscribe((value) => (actual = value));

    const req = httpMock.expectOne('form/getSingleForm');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('formId')).toBe('12');
    req.flush(response);

    expect(commonService.parseResponse).toHaveBeenCalledWith(response);
    expect(actual).toEqual(response);
  });

  it('requests form download links with form id and extra headers', () => {
    const response = { formFileUrl: '/api/files/form.pdf' };
    let actual: unknown;

    service
      .getFormDownloadLink('FORM-22', { type: 'SignedDoc', userId: 'U1' })
      .subscribe((value) => (actual = value));

    const req = httpMock.expectOne('form/downloadSingleForm');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('formId')).toBe('FORM-22');
    expect(req.request.headers.get('type')).toBe('SignedDoc');
    expect(req.request.headers.get('userId')).toBe('U1');
    req.flush(response);

    expect(commonService.parseResponse).toHaveBeenCalledWith(response);
    expect(actual).toEqual(response);
  });

  it('uses SignedDoc type for signed form download links', () => {
    service.getSignedFormDownloadLink('SIGNED-1').subscribe();

    const req = httpMock.expectOne('form/downloadSingleForm');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('formId')).toBe('SIGNED-1');
    expect(req.request.headers.get('type')).toBe('SignedDoc');
    req.flush({});
  });

  it('keeps legacy getFromDownloadUrl config behavior for download links', () => {
    service
      .getFromDownloadUrl({ headers: { formId: 'FORM-LEGACY', type: 'UnsignedDoc' } })
      .subscribe();

    const req = httpMock.expectOne('form/downloadSingleForm');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('formId')).toBe('FORM-LEGACY');
    expect(req.request.headers.get('type')).toBe('UnsignedDoc');
    req.flush({});
  });

  it('downloads the first available file url from a form download response', () => {
    service.downloadFormFromResponse({ formFileUrl: '/forms/a.pdf' });

    expect(commonService.download).toHaveBeenCalledOnceWith('/forms/a.pdf');
  });

  it('does not download when a form download response has no usable url', () => {
    service.downloadFormFromResponse({ status: 'NO_FILE' });

    expect(commonService.download).not.toHaveBeenCalled();
  });

  it('calls validation and resubmit endpoints with request headers', () => {
    service.validatePortAndCount({ headers: { formId: 'FORM-9' } }).subscribe();
    service.resubmit({ headers: { formId: 'FORM-9', userId: 'U9' } }).subscribe();

    const validateReq = httpMock.expectOne('form/validatePortAndCount');
    expect(validateReq.request.method).toBe('GET');
    expect(validateReq.request.headers.get('formId')).toBe('FORM-9');
    validateReq.flush({});

    const resubmitReq = httpMock.expectOne('form/resubmit');
    expect(resubmitReq.request.method).toBe('GET');
    expect(resubmitReq.request.headers.get('formId')).toBe('FORM-9');
    expect(resubmitReq.request.headers.get('userId')).toBe('U9');
    resubmitReq.flush({});
  });
});
