
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from './common.service';
@Injectable({
  providedIn: 'root'
})
export class ImportExportAuditService {

  constructor(private http: HttpClient, private $common: CommonService) { }

  private getBatchFamily(config?: any): 'DI' | 'IM' | 'EX' {
    const t = (config?.headers?.type || '').toString().toUpperCase();
    if (t === 'DI') return 'DI';
    if (t === 'EX') return 'EX';
    return 'IM';
  }

  getProcess(config) {
    return this.http.get<any>(`dropdown/getProcess`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  getAdminForms(config) {
    return this.http.get<any>(`claim/readyForExport`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  batchChilds(config) {
    return this.http.get<any>(`claim/all`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  getBatchChildren(importExportObject: any, codeStatus: any, batchFamily: 'DI' | 'IM' | 'EX' = 'IM') {
    const config: any = {
      headers: {}
    };
    if (batchFamily === 'DI') {
      config.headers.batchDiaryId = importExportObject.importExportId;
      config.headers.type = 'DI';
    } else if (importExportObject?.type == codeStatus?.imported) {
      config.headers.importBatchId = importExportObject.importExportId;
    } else if (importExportObject?.type == codeStatus?.exported) {
      config.headers.exportBatchId = importExportObject.importExportId;
    }
    return this.batchChilds(config);
  }
  getBatchList(config) {
    const family = this.getBatchFamily(config);
    const legacyPath = family === 'DI' ? 'batchDiary/all' : 'importExport/all';
    return this.http.get<any>(legacyPath, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  getCustomBatch(config) {
    const family = this.getBatchFamily(config);
    const legacyPath = family === 'DI' ? 'batchDiary/all' : 'importExport/getCustomBatch';
    return this.http.get<any>(legacyPath, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  getAllExported(config) {
    return this.getBatchList(config);
  }
  createExport(config) {
    return this.http.put<any>(`importExport/createExportClaim`, null, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  createExportAll(object) {
    return this.http.put<any>(`importExport/createExportClaimAll`, null).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  downloadExportBatch(config) {
    const family = this.getBatchFamily(config);
    const legacyPath = family === 'DI' ? 'batchDiary/downloadExportBatch' : 'importExport/downloadExportBatch';
    return this.http.put<any>(legacyPath, null, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  downloadBatchFromResponse(batchResponse: any) {
    if (!batchResponse?.batchUrl || !batchResponse?.batchNo) {
      return;
    }
    const fullUrl = `${this.$common.fileUrl}${batchResponse.batchUrl}`;
    this.$common.downloadAbsolute(fullUrl, `${batchResponse.batchNo}.zip`);
  }
  changeStatusArchive(config) {
    const family = this.getBatchFamily(config);
    const legacyPath = family === 'DI' ? 'batchDiary/changeStatus' : 'importExport/changeStatus';
    return this.http.put<any>(legacyPath, null, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  importBatchStaging(object, config) {
    const family = this.getBatchFamily(config);
    const legacyPath = family === 'DI' ? 'batchDiary/importBatchStaging' : 'importExport/importBatchStaging';
    return this.http.post<any>(legacyPath, object, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  importExcel(payload) {
    return this.http.post<any>(`importExport/importExcel`, payload).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  importBatch(object, config) {
    const family = this.getBatchFamily(config);
    const legacyPath = family === 'DI' ? 'batchDiary/importBatch' : 'importExport/importBatch';
    return this.http.put<any>(legacyPath, null, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  delete(ids) {
    const family = this.getBatchFamily(ids);
    const legacyPath = family === 'DI' ? 'batchDiary' : 'importExport';
    return this.http.delete<any>(legacyPath, ids).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

}

