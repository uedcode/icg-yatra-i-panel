import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CommonService } from 'src/app/service/core/common.service';
import { DocumentService } from 'src/app/service/form/document.service';

describe('DocumentService', () => {
  let service: DocumentService;
  let httpMock: HttpTestingController;
  let commonService: jasmine.SpyObj<CommonService>;

  beforeEach(() => {
    commonService = jasmine.createSpyObj<CommonService>('CommonService', ['parseResponse']);
    commonService.parseResponse.and.callFake((response) => response);

    TestBed.configureTestingModule({
      providers: [
        DocumentService,
        { provide: CommonService, useValue: commonService }
      ]
    });

    service = TestBed.inject(DocumentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('gets configured document info list', () => {
    const response = [{ code: 'PMT_DOC' }];
    let actual: unknown;

    service.get({ headers: { formType: 'PMT' } }).subscribe((value) => (actual = value));

    const req = httpMock.expectOne('codeDocInfo/all');
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('formType')).toBe('PMT');
    req.flush(response);

    expect(commonService.parseResponse).toHaveBeenCalledWith(response);
    expect(actual).toEqual(response);
  });

  it('posts document info create or update payload', () => {
    const payload = { code: 'BILL', mandatory: true };

    service.createOrUpdate(payload).subscribe();

    const req = httpMock.expectOne('codeDocInfo/createOrUpdate');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('deletes document info records with supplied ids config', () => {
    service.delete({ headers: { ids: '10,11' } }).subscribe();

    const req = httpMock.expectOne('codeDocInfo');
    expect(req.request.method).toBe('DELETE');
    expect(req.request.headers.get('ids')).toBe('10,11');
    req.flush({});
  });
});
