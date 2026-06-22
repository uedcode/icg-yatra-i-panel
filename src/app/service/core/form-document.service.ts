import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CodeDocInfoApiService } from 'src/app/service/api/code/code-doc-info-api.service';
import { TempDocInfoApiService } from 'src/app/service/api/form/temp-doc-info-api.service';

@Injectable({
  providedIn: 'root',
})
export class FormDocumentService {
  constructor(
    private $tempDocInfoApi: TempDocInfoApiService,
    private $codeDocInfo: CodeDocInfoApiService
  ) {}

  loadRequiredDocuments(subFormId: string): Observable<any> {
    return this.$codeDocInfo.getDocument({
      headers: this.getDocumentClaimFlags(subFormId),
    });
  }

  uploadSupportDoc(file: File): Observable<string | null> {
    return this.uploadTempDocument(file);
  }

  uploadTempDocument(file: File, folderId?: string): Observable<string | null> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append(
      'tempDocInfoDTO',
      JSON.stringify(folderId ? { folderId } : {})
    );

    return this.$tempDocInfoApi.createOrUpdate(formData).pipe(
      map((response: any) =>
        response?.status === true ? response.object?.[0]?.fileUrl || null : null
      )
    );
  }

  /**
   * Legacy claim/advance document flow only removes temp document references
   * from the DTO. The backend moves/copies temp files during claim save.
   */
  deleteSupportDocByUrl(_docFileUrl: string): Observable<boolean> {
    return of(true);
  }

  private getDocumentClaimFlags(subFormId: string) {
    const flags: any = {
      tyClaim: '',
      pmtClaim: '',
      ltcClaim: '',
      resettleClm: '',
      fteClaim: '',
    };

    if (subFormId === 'T' || subFormId === 'TYD') {
      flags.tyClaim = '1';
    } else if (subFormId === 'P' || subFormId === 'PMT') {
      flags.pmtClaim = '1';
    } else if (subFormId === 'L' || subFormId === 'LTC') {
      flags.ltcClaim = '1';
    } else if (subFormId === 'RS') {
      flags.resettleClm = '1';
    } else if (subFormId === 'F' || subFormId === 'FTE') {
      flags.fteClaim = '1';
    }

    return flags;
  }
}
