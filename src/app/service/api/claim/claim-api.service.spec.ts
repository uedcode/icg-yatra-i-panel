import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { CommonService } from 'src/app/service/core/common.service';

describe('ClaimApiService', () => {
  let service: ClaimApiService;
  let httpMock: HttpTestingController;
  let commonService: jasmine.SpyObj<CommonService>;

  beforeEach(() => {
    commonService = jasmine.createSpyObj<CommonService>('CommonService', ['parseResponse']);
    commonService.parseResponse.and.callFake((response) => response);

    TestBed.configureTestingModule({
      providers: [
        ClaimApiService,
        { provide: CommonService, useValue: commonService }
      ]
    });

    service = TestBed.inject(ClaimApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('posts advance FormData to the legacy advance create or update endpoint', () => {
    const formData = new FormData();
    formData.append('yatClaimDTO', new Blob(['{}'], { type: 'application/json' }));
    const response = { success: true, claimId: 101 };
    let actual: unknown;

    service
      .createOrUpdateAdvance(formData, { headers: { formId: 'FORM-101', userId: 'U101' } })
      .subscribe((value) => (actual = value));

    const req = httpMock.expectOne('claim/createOrUpdate');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(formData);
    expect(req.request.headers.get('formId')).toBe('FORM-101');
    expect(req.request.headers.get('userId')).toBe('U101');
    req.flush(response);

    expect(commonService.parseResponse).toHaveBeenCalledWith(response);
    expect(actual).toEqual(response);
  });

  it('posts claim create or update payload with workflow headers', () => {
    const payload = { claimId: 101, amount: 4500 };
    const response = { success: true, claimId: 101 };
    let actual: unknown;

    service
      .createOrUpdateClaim(payload, { headers: { formId: 'FORM-101', userId: 'U101' } })
      .subscribe((value) => (actual = value));

    const req = httpMock.expectOne('claim/createOrUpdateClaim');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    expect(req.request.headers.get('formId')).toBe('FORM-101');
    expect(req.request.headers.get('userId')).toBe('U101');
    req.flush(response);

    expect(commonService.parseResponse).toHaveBeenCalledWith(response);
    expect(actual).toEqual(response);
  });

  it('posts claim create or update payload without optional config', () => {
    const payload = { claimId: 102 };

    service.createOrUpdateClaim(payload).subscribe();

    const req = httpMock.expectOne('claim/createOrUpdateClaim');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('gets ready-for-claim and single claim data with headers', () => {
    service.getReadyForClaim({ headers: { formId: 'FORM-201' } }).subscribe();
    service.getSingleClaim({ headers: { claimId: '201' } }).subscribe();

    const readyReq = httpMock.expectOne('claim/readyForClaim');
    expect(readyReq.request.method).toBe('GET');
    expect(readyReq.request.headers.get('formId')).toBe('FORM-201');
    readyReq.flush({});

    const singleReq = httpMock.expectOne('claim/single');
    expect(singleReq.request.method).toBe('GET');
    expect(singleReq.request.headers.get('claimId')).toBe('201');
    singleReq.flush({});
  });

  it('edits and deletes claims using their workflow endpoints', () => {
    service.editClaim({ headers: { claimId: '401' } }).subscribe();
    service.deleteClaim({ headers: { claimId: '401' } }).subscribe();

    const editReq = httpMock.expectOne('claim/editClaim');
    expect(editReq.request.method).toBe('POST');
    expect(editReq.request.body).toBeNull();
    expect(editReq.request.headers.get('claimId')).toBe('401');
    editReq.flush({});

    const deleteReq = httpMock.expectOne('claim');
    expect(deleteReq.request.method).toBe('DELETE');
    expect(deleteReq.request.headers.get('claimId')).toBe('401');
    deleteReq.flush({});
  });

  it('validates claim state transitions', () => {
    service.validateClaimState({ headers: { claimId: '501', action: 'SUBMIT' } }).subscribe();

    const validateReq = httpMock.expectOne('claim/validateClaimState');
    expect(validateReq.request.method).toBe('GET');
    expect(validateReq.request.headers.get('claimId')).toBe('501');
    expect(validateReq.request.headers.get('action')).toBe('SUBMIT');
    validateReq.flush({});
  });

  it('marks voucher files as downloaded with an empty object body', () => {
    service.fileDownloadedVoucher({ headers: { claimId: '601', voucherNo: 'V1' } }).subscribe();

    const req = httpMock.expectOne('claim/fileDownloadedVoucher');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({});
    expect(req.request.headers.get('claimId')).toBe('601');
    expect(req.request.headers.get('voucherNo')).toBe('V1');
    req.flush({});
  });

});


