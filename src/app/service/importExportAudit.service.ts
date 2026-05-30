
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CommonService } from './common.service';
@Injectable({
  providedIn: 'root'
})
export class ImportExportAuditService {

  constructor(private http: HttpClient, private $common: CommonService) { }

  private adapt<T>(primary$: Observable<any>, fallback$: Observable<any>) {
    return primary$.pipe(
      catchError(() => fallback$),
      map((response: any) => {
        this.$common.parseResponse(response);
        return response as T;
      })
    );
  }

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
    return this.adapt(
      this.http.get<any>(`auditImpExp/adminInbox`, config),
      this.http.get<any>(`claim/readyForExport`, config)
    );
  }
  batchChilds(config) {
    const family = this.getBatchFamily(config);
    const legacy = family === 'DI'
      ? this.http.get<any>(`claim/all`, config)
      : this.http.get<any>(`claim/all`, config);
    return this.adapt(
      this.http.get<any>(`auditImpExp/batchChilds`, config),
      legacy
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
    return this.adapt(
      this.http.get<any>(`auditImpExp/all`, config),
      this.http.get<any>(legacyPath, config)
    );
  }
  getCustomBatch(config) {
    const family = this.getBatchFamily(config);
    const legacyPath = family === 'DI' ? 'batchDiary/all' : 'importExport/getCustomBatch';
    return this.adapt(
      this.http.get<any>(`auditImpExp/getCustomBatch`, config),
      this.http.get<any>(legacyPath, config)
    );
  }
  getAllExported(config) {
    return this.getBatchList(config);
  }
  createExport(config) {
    return this.adapt(
      this.http.post<any>(`auditImpExp/createExport`, null, config),
      this.http.put<any>(`importExport/createExportClaim`, null, config)
    );
  }
  createExportAll(object) {
    return this.adapt(
      this.http.post<any>(`auditImpExp/createExportAll`, object),
      this.http.put<any>(`importExport/createExportClaimAll`, null)
    );
  }
  downloadExportBatch(config) {
    const family = this.getBatchFamily(config);
    const legacyPath = family === 'DI' ? 'batchDiary/downloadExportBatch' : 'importExport/downloadExportBatch';
    return this.adapt(
      this.http.post<any>(`auditImpExp/downloadExportBatch`, null, config),
      this.http.put<any>(legacyPath, null, config)
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
    return this.adapt(
      this.http.post<any>(`auditImpExp/changeStatusArchive`, null, config),
      this.http.put<any>(legacyPath, null, config)
    );
  }
  importBatchStaging(object, config) {
    const family = this.getBatchFamily(config);
    const legacyPath = family === 'DI' ? 'batchDiary/importBatchStaging' : 'importExport/importBatchStaging';
    return this.adapt(
      this.http.post<any>(`auditImpExp/importBatchStaging`, object, config),
      this.http.post<any>(legacyPath, object, config)
    );
  }
  importExcel(payload) {
    return this.adapt(
      this.http.post<any>(`auditImpExp/importExcel`, payload),
      this.http.post<any>(`importExport/importExcel`, payload)
    );
  }
  importBatch(object, config) {
    const family = this.getBatchFamily(config);
    const legacyPath = family === 'DI' ? 'batchDiary/importBatch' : 'importExport/importBatch';
    return this.adapt(
      this.http.post<any>(`auditImpExp/importBatch`, object, config),
      this.http.put<any>(legacyPath, null, config)
    );
  }
  delete(ids) {
    const family = this.getBatchFamily(ids);
    const legacyPath = family === 'DI' ? 'batchDiary' : 'importExport';
    return this.adapt(
      this.http.get<any>(`auditImpExp/deleteByIds`, ids),
      this.http.delete<any>(legacyPath, ids)
    );
  }

}

