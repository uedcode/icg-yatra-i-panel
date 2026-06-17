import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root'
})
export class ExcelImportService {
  constructor(private http: HttpClient, private $common: CommonService) { }

  importExcel(payload: any) {
    return this.http.post<any>('importExport/importExcel', payload).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
}
