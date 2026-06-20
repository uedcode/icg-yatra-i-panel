import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root',
})
export class LtcAdvApiService {
  constructor(private http: HttpClient, private $common: CommonService) {}

  getBlockYears(config?: any) {
    return this.http.get<any>('ltcAdv/blockYear', config).pipe(map((response: any) => this.parse(response)));
  }

  validateAdditionalLtc(config?: any) {
    return this.http.get<any>('ltcAdv/validateAdditionalLTC', config).pipe(map((response: any) => this.parse(response)));
  }

  private parse(response: any) {
    this.$common.parseResponse(response);
    return response;
  }
}
