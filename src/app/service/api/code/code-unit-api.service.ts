import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root'
})
export class CodeUnitApiService {
  constructor(private http: HttpClient, private $common: CommonService) {}

  getAllUnits(config?: any) {
    return this.http.get<any>('codeUnit/all', config).pipe(map((response: any) => this.parse(response)));
  }

  getGxUnits(config: any) {
    return this.http.get<any>('codeUnit/gxUnit', config).pipe(map((response: any) => this.parse(response)));
  }

  getPresentUnitStatus(config?: any) {
    return this.http.get<any>('codeUnit/getPresentUnitStatus', config).pipe(map((response: any) => this.parse(response)));
  }

  private parse(response: any) {
    this.$common.parseResponse(response);
    return response;
  }
}
