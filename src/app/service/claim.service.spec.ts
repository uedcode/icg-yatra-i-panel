import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ClaimService } from 'src/app/service/claim/claim.service';
import { CommonService } from 'src/app/service/core/common.service';

describe('ClaimService', () => {
  let service: ClaimService;
  let httpMock: HttpTestingController;
  let commonService: jasmine.SpyObj<CommonService>;

  beforeEach(() => {
    commonService = jasmine.createSpyObj<CommonService>('CommonService', ['parseResponse']);
    commonService.parseResponse.and.callFake((response) => response);

    TestBed.configureTestingModule({
      providers: [
        ClaimService,
        { provide: CommonService, useValue: commonService }
      ]
    });

    service = TestBed.inject(ClaimService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('posts claim create or update payload with workflow headers', () => {
    const payload = { claimId: 101, amount: 4500 };
    const response = { success: true, claimId: 101 };
    let actual: unknown;

    service
      .createOrUpdateClaim(payload, { headers: { formId: 'FORM-101', userId: 'U101' } })
      .subscribe((value) => (actual = value));

    const req = httpMock.expectOne('claim/createOrUpdate');
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

    const req = httpMock.expectOne('claim/createOrUpdate');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('posts IFSC create or update payload without response parsing', () => {
    const payload = { ifsc: 'SBIN0000001', bankName: 'State Bank' };
    let actual: unknown;

    service
      .createOrUpdateIfsc(payload, { headers: { userId: 'BANK-USER' } })
      .subscribe((value) => (actual = value));

    const req = httpMock.expectOne('bankIfsc/createOrUpdate');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    expect(req.request.headers.get('userId')).toBe('BANK-USER');
    req.flush({ saved: true });

    expect(commonService.parseResponse).not.toHaveBeenCalled();
    expect(actual).toEqual({ saved: true });
  });

  it('validates claim payloads through validation service', () => {
    const payload = { claimId: 103, fields: ['amount'] };

    service.validateClaims(payload).subscribe();

    const req = httpMock.expectOne('validation/claims');
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

  it('uploads claim form data to the claim create or update endpoint', () => {
    const formData = new FormData();
    formData.append('claim', new Blob(['{}'], { type: 'application/json' }));

    service.createOrUpdateClaimFormData(formData).subscribe();

    const req = httpMock.expectOne('claim/createOrUpdate');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(formData);
    req.flush({});
  });

  it('posts claim workflow status changes', () => {
    const payload = { claimId: 301, status: 'APPROVED', remarks: 'verified' };

    service.changeClaimStatusById(payload).subscribe();

    const req = httpMock.expectOne('claimState/changeStatusById');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('archives claim status with a PUT request and null body', () => {
    service.changeClaimStatusArchive({ headers: { claimId: '302' } }).subscribe();

    const req = httpMock.expectOne('claimState/changeStatusArchive');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toBeNull();
    expect(req.request.headers.get('claimId')).toBe('302');
    req.flush({});
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

  it('sends claims to workflow and validates claim state', () => {
    const payload = { claimIds: [501], action: 'SUBMIT' };

    service.sendToWorkflow(payload).subscribe();
    service.validateClaimState({ headers: { claimId: '501', action: 'SUBMIT' } }).subscribe();

    const workflowReq = httpMock.expectOne('claim/sendToWorkflow');
    expect(workflowReq.request.method).toBe('POST');
    expect(workflowReq.request.body).toEqual(payload);
    workflowReq.flush({});

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

  it('uses eSign endpoints for prepare, perform, and availability checks', () => {
    service.prepareForESign({ claimId: 701 }).subscribe();
    service.performESign({ token: 'signed-token' }).subscribe();
    service.checkEsignAvailability({ headers: { userId: 'U701' } }).subscribe();

    const prepareReq = httpMock.expectOne('esign/prepareForESign');
    expect(prepareReq.request.method).toBe('POST');
    expect(prepareReq.request.body).toEqual({ claimId: 701 });
    prepareReq.flush({});

    const performReq = httpMock.expectOne('esign/performESign');
    expect(performReq.request.method).toBe('POST');
    expect(performReq.request.body).toEqual({ token: 'signed-token' });
    performReq.flush({});

    const availabilityReq = httpMock.expectOne('esign/checkEsignAvailability');
    expect(availabilityReq.request.method).toBe('GET');
    expect(availabilityReq.request.headers.get('userId')).toBe('U701');
    availabilityReq.flush({});
  });
});

