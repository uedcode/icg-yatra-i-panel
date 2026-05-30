import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CommonService } from './common.service';
import { FormStateService } from './formState.service';

describe('FormStateService', () => {
  let service: FormStateService;
  let httpMock: HttpTestingController;
  let commonService: jasmine.SpyObj<CommonService>;

  beforeEach(() => {
    commonService = jasmine.createSpyObj<CommonService>('CommonService', ['parseResponse']);
    commonService.parseResponse.and.callFake((response) => response);

    TestBed.configureTestingModule({
      providers: [
        FormStateService,
        { provide: CommonService, useValue: commonService }
      ]
    });

    service = TestBed.inject(FormStateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('posts status changes to the form state endpoint', () => {
    const payload = { formId: 15, status: 'APPROVED', remarks: 'ok' };
    const response = { success: true };
    let actual: unknown;

    service.changeStatusById(payload).subscribe((value) => (actual = value));

    const req = httpMock.expectOne('formState/changeStatusById');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(response);

    expect(commonService.parseResponse).toHaveBeenCalledWith(response);
    expect(actual).toEqual(response);
  });

  it('posts IHQ status changes to the form endpoint', () => {
    const payload = { formId: 18, status: 'RETURNED' };

    service.changeStatusByIhq(payload).subscribe();

    const req = httpMock.expectOne('form/changeStatusById');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('moves a form to draft with null body and supplied headers', () => {
    service.moveToDraft({ headers: { formId: 'FORM-77', userId: 'U77' } }).subscribe();

    const req = httpMock.expectOne('formState/moveToDraft');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    expect(req.request.headers.get('formId')).toBe('FORM-77');
    expect(req.request.headers.get('userId')).toBe('U77');
    req.flush({});
  });

  it('saves draft state with null body and supplied headers', () => {
    service.saveAsDraft({ headers: { formId: 'FORM-88' } }).subscribe();

    const req = httpMock.expectOne('formState/saveAsDraft');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    expect(req.request.headers.get('formId')).toBe('FORM-88');
    req.flush({});
  });

  it('gets state, state count, and return users using request headers', () => {
    service.getState({ headers: { formId: 'FORM-1' } }).subscribe();
    service.getStateCount({ headers: { userId: 'U1' } }).subscribe();
    service.getReturnUsers({ headers: { formId: 'FORM-1', role: 'APPROVER' } }).subscribe();

    const stateReq = httpMock.expectOne('formState/getState');
    expect(stateReq.request.method).toBe('GET');
    expect(stateReq.request.headers.get('formId')).toBe('FORM-1');
    stateReq.flush({});

    const countReq = httpMock.expectOne('formState/getStateCount');
    expect(countReq.request.method).toBe('GET');
    expect(countReq.request.headers.get('userId')).toBe('U1');
    countReq.flush({});

    const returnUsersReq = httpMock.expectOne('formState/getReturnUsers');
    expect(returnUsersReq.request.method).toBe('GET');
    expect(returnUsersReq.request.headers.get('role')).toBe('APPROVER');
    returnUsersReq.flush({});
  });

  it('validates state management and retrieves form history', () => {
    const payload = { formId: 31, nextState: 'VERIFIER' };

    service.validationStateMgt(payload).subscribe();
    service.getHistory({ headers: { formId: '31' } }).subscribe();

    const validationReq = httpMock.expectOne('formState/validationStateMgt');
    expect(validationReq.request.method).toBe('POST');
    expect(validationReq.request.body).toEqual(payload);
    validationReq.flush({});

    const historyReq = httpMock.expectOne('formState/getHistory');
    expect(historyReq.request.method).toBe('GET');
    expect(historyReq.request.headers.get('formId')).toBe('31');
    historyReq.flush({});
  });
});

