import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CommonService } from './common.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DropdownService {
  constructor(private http: HttpClient, private $common: CommonService) {}

  getPurposeTypes(config: any) {
    return this.http.get<any>(`tyDutyPurpose/all`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  getCodeRoles() {
    return this.http.get<any>(`dropdown/roles`).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  supplies(config) {
    return this.http.get<any>(`dropdown/supplies`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  subDeposMapped(config) {
    return this.http.get<any>(`dropdown/subDeposMapped`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  subDeposForCombinedDemand(config) {
    return this.http
      .get<any>(`dropdown/subDeposForCombinedDemand`, config)
      .pipe(
        map((response: any) => {
          this.$common.parseResponse(response);
          return response;
        })
      );
  }

  clubs(config) {
    return this.http.get<any>(`dropdown/clubs`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  firms(config) {
    return this.http.get<any>(`dropdown/firms`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  getDropdown(config) {
    return this.http.get<any>(`dropdown/getFormWiseDropdown`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  getCodeRoleType(config) {
    return this.http.get<any>(`aclPilCodeRoleType/all`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  getCodeDesignation(config) {
    return this.http.get<any>(`aclPilCodeDesignation/all`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
}
