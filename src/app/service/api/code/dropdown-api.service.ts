import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root'
})
export class DropdownApiService {
  constructor(private http: HttpClient, private $common: CommonService) {}

  getCodeRoles() {
    return this.http.get<any>('dropdown/roles').pipe(map((response: any) => this.parse(response)));
  }

  supplies(config: any) {
    return this.http.get<any>('dropdown/supplies', config).pipe(map((response: any) => this.parse(response)));
  }

  subDeposMapped(config: any) {
    return this.http.get<any>('dropdown/subDeposMapped', config).pipe(map((response: any) => this.parse(response)));
  }

  subDeposForCombinedDemand(config: any) {
    return this.http.get<any>('dropdown/subDeposForCombinedDemand', config).pipe(map((response: any) => this.parse(response)));
  }

  clubs(config: any) {
    return this.http.get<any>('dropdown/clubs', config).pipe(map((response: any) => this.parse(response)));
  }

  firms(config: any) {
    return this.http.get<any>('dropdown/firms', config).pipe(map((response: any) => this.parse(response)));
  }

  getFormWiseDropdown(config: any) {
    return this.http.get<any>('dropdown/getFormWiseDropdown', config).pipe(map((response: any) => this.parse(response)));
  }

  getProcess(config: any) {
    return this.http.get<any>('dropdown/getProcess', config).pipe(map((response: any) => this.parse(response)));
  }

  private parse(response: any) {
    this.$common.parseResponse(response);
    return response;
  }
}
