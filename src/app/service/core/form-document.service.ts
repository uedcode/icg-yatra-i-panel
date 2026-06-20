import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CodeDocInfoApiService } from 'src/app/service/api/code/code-doc-info-api.service';
import { FormSupportDocUrlApiService } from 'src/app/service/api/form/form-support-doc-url-api.service';

@Injectable({
  providedIn: 'root',
})
export class FormDocumentService {
  constructor(
    private $formSupportDocUrl: FormSupportDocUrlApiService,
    private $codeDocInfo: CodeDocInfoApiService
  ) {}

  loadRequiredDocuments(subFormId: string): Observable<any> {
    return this.$codeDocInfo.getDocument({
      headers: this.getDocumentClaimFlags(subFormId),
    });
  }

  uploadSupportDoc(file: File): Observable<string | null> {
    const formData = new FormData();
    formData.append('docFile', file);
    formData.append('SupportDocDTO', '{}');

    return this.$formSupportDocUrl.saveFileUrl(formData).pipe(
      map((response: any) =>
        response?.status === true ? response.object?.[0]?.docFileUrl || null : null
      )
    );
  }

  deleteSupportDocByUrl(docFileUrl: string): Observable<boolean> {
    if (!docFileUrl || docFileUrl.includes('fakepath')) {
      return of(true);
    }

    return this.$formSupportDocUrl
      .deleteByUrl({
        headers: {
          url: docFileUrl,
        },
      })
      .pipe(map((response: any) => response?.status === true));
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
