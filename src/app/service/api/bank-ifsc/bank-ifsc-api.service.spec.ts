import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { BankIfscApiService } from './bank-ifsc-api.service';

describe('BankIfscApiService', () => {
  let service: BankIfscApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BankIfscApiService],
    });

    service = TestBed.inject(BankIfscApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('posts IFSC create or update payload without response parsing', () => {
    const payload = { ifsc: 'SBIN0000001', bankName: 'State Bank' };
    let actual: unknown;

    service
      .createOrUpdate(payload, { headers: { userId: 'BANK-USER' } })
      .subscribe((value) => (actual = value));

    const req = httpMock.expectOne('bankIfsc/createOrUpdate');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    expect(req.request.headers.get('userId')).toBe('BANK-USER');
    req.flush({ saved: true });

    expect(actual).toEqual({ saved: true });
  });
});
