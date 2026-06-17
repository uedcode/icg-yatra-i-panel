import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root',
})
export class ReportAnalyticsService {
  constructor(private $common: CommonService, private http: HttpClient) {}

  getEsignReportData(config?: any) {
    return this.http.get<any>(`claimState/esignReportData`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  getPieChartData(config?: any) {
    return this.http.get<any>(`codeMisc/pieChartData`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  viewReport(config?: any) {
    return this.http.get<any>(`codeMisc/viewReport`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  getCodeUnits(config?: any) {
    return this.http.get<any>(`codeUnit/all`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  getGxUnits(config?: any) {
    return this.http.get<any>(`codeUnit/gxUnit`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
}


