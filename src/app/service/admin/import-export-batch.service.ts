import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root'
})
export class ImportExportBatchService {
  constructor(private http: HttpClient, private $common: CommonService) { }

  private parse(response: any) {
    this.$common.parseResponse(response);
    return response;
  }

  getProcess(config: any) {
    return this.http.get<any>('dropdown/getProcess', config).pipe(map(response => this.parse(response)));
  }

  getAdminForms(config: any) {
    return this.http.get<any>('claim/readyForExport', config).pipe(map(response => this.parse(response)));
  }

  getBatchClaims(config: any) {
    return this.http.get<any>('claim/all', config).pipe(map(response => this.parse(response)));
  }

  getBatchChildren(importExportObject: any, codeStatus: any) {
    const config: any = { headers: {} };
    if (importExportObject?.type == codeStatus?.imported) {
      config.headers.importBatchId = importExportObject.importExportId;
    } else if (importExportObject?.type == codeStatus?.exported) {
      config.headers.exportBatchId = importExportObject.importExportId;
    }
    return this.getBatchClaims(config);
  }

  getBatchList(config: any) {
    return this.http.get<any>('importExport/all', config).pipe(map(response => this.parse(response)));
  }

  getCustomBatch(config: any) {
    return this.http.get<any>('importExport/getCustomBatch', config).pipe(map(response => this.parse(response)));
  }

  createExport(config: any) {
    return this.http.put<any>('importExport/createExportClaim', null, config).pipe(map(response => this.parse(response)));
  }

  createExportAll() {
    return this.http.put<any>('importExport/createExportClaimAll', null).pipe(map(response => this.parse(response)));
  }

  downloadExportBatch(config: any) {
    return this.http.put<any>('importExport/downloadExportBatch', null, config).pipe(map(response => this.parse(response)));
  }

  downloadBatchFromResponse(batchResponse: any) {
    if (!batchResponse?.batchUrl || !batchResponse?.batchNo) {
      return;
    }
    const fullUrl = `${this.$common.fileUrl}${batchResponse.batchUrl}`;
    this.$common.downloadAbsolute(fullUrl, `${batchResponse.batchNo}.zip`);
  }

  changeStatusArchive(config: any) {
    return this.http.put<any>('importExport/changeStatus', null, config).pipe(map(response => this.parse(response)));
  }

  importBatchStaging(object: any, config: any) {
    return this.http.post<any>('importExport/importBatchStaging', object, config).pipe(map(response => this.parse(response)));
  }

  importBatch(object: any, config: any) {
    return this.http.put<any>('importExport/importBatch', null, config).pipe(map(response => this.parse(response)));
  }

  delete(config: any) {
    return this.http.delete<any>('importExport', config).pipe(map(response => this.parse(response)));
  }
}
