
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from './common.service';
@Injectable({
  providedIn: 'root'
})
export class ImportExportAuditService {

  constructor(private http: HttpClient, private $common: CommonService) { }

  getProcess(config) {
    return this.http.get<any>(`dropdown/getProcess`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  getAdminForms(config) {
    return this.http.get<any>(`auditImpExp/adminInbox`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  batchChilds(config) {
    return this.http.get<any>(`auditImpExp/batchChilds`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  getAllExported(config) {
    return this.http.get<any>(`auditImpExp/all`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  createExport(config) {
    return this.http.post<any>(`auditImpExp/createExport`, null, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  createExportAll(object) {
    return this.http.post<any>(`auditImpExp/createExportAll`, object).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  downloadExportBatch(config) {
    return this.http.post<any>(`auditImpExp/downloadExportBatch`, null, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  changeStatusArchive(config) {
    return this.http.post<any>(`auditImpExp/changeStatusArchive`, null, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  importBatchStaging(object, config) {
    return this.http.post<any>(`auditImpExp/importBatchStaging`, object, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  importBatch(object, config) {
    return this.http.post<any>(`auditImpExp/importBatch`, object, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
  delete(ids) {
    return this.http.get<any>(`auditImpExp/deleteByIds`, ids).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

}
