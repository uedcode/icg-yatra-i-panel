import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root'
})
export class BatchDiaryApiService {
  constructor(private http: HttpClient, private $common: CommonService) {}

  getBatchList(config: any) {
    return this.http.get<any>('batchDiary/all', config).pipe(map(response => this.parse(response)));
  }

  getBatchClaims(config: any) {
    return this.http.get<any>('claim/all', config).pipe(map(response => this.parse(response)));
  }

  getBatchChildren(importExportObject: any) {
    return this.getBatchClaims({
      headers: {
        batchDiaryId: importExportObject.importExportId,
        type: 'DI'
      }
    });
  }

  importBatchStaging(object: any, config: any) {
    return this.http.post<any>('batchDiary/importBatchStaging', object, config).pipe(map(response => this.parse(response)));
  }

  importBatch(object: any, config: any) {
    return this.http.put<any>('batchDiary/importBatch', null, config).pipe(map(response => this.parse(response)));
  }

  changeStatusArchive(config: any) {
    return this.http.put<any>('batchDiary/changeStatus', null, config).pipe(map(response => this.parse(response)));
  }

  delete(config: any) {
    return this.http.delete<any>('batchDiary', config).pipe(map(response => this.parse(response)));
  }

  private parse(response: any) {
    this.$common.parseResponse(response);
    return response;
  }
}
