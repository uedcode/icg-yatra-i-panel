import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root'
})
export class CodeMiscApiService {
  constructor(private http: HttpClient, private $common: CommonService) {}

  getPieChartData(config?: any) {
    return this.http.get<any>('codeMisc/pieChartData', config).pipe(map((response: any) => this.parse(response)));
  }

  viewReport(config?: any) {
    return this.http.get<any>('codeMisc/viewReport', config).pipe(map((response: any) => this.parse(response)));
  }

  private parse(response: any) {
    this.$common.parseResponse(response);
    return response;
  }
}
