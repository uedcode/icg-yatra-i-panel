import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root',
})
export class EsignApiService {
  constructor(
    private http: HttpClient,
    private $common: CommonService
  ) {}

  getAll(config?: any) {
    return this.http.get<any>('esign/all', config).pipe(map((response: any) => this.parse(response)));
  }

  prepareForESign(payload: any) {
    return this.http.post<any>('esign/prepareForESign', payload).pipe(map((response: any) => this.parse(response)));
  }

  performESign(payload: any) {
    return this.http.post<any>('esign/performESign', payload).pipe(map((response: any) => this.parse(response)));
  }

  checkEsignAvailability(config?: any) {
    return this.http.get<any>('esign/checkEsignAvailability', config).pipe(map((response: any) => this.parse(response)));
  }

  private parse(response: any) {
    this.$common.parseResponse(response);
    return response;
  }
}
