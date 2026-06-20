import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root',
})
export class FormApiService {
  constructor(private http: HttpClient, private $common: CommonService) {}

  getFormDownloadLink(formId: string, extraHeaders: Record<string, any> = {}) {
    const config = {
      headers: {
        formId,
        ...extraHeaders,
      },
    };

    return this.http.get<any>(`form/downloadSingleForm`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  getSignedFormDownloadLink(formId: string) {
    return this.getFormDownloadLink(formId, { type: 'SignedDoc' });
  }

  downloadFormFromResponse(responseObject: any) {
    const downloadUrl =
      responseObject?.formFileUrl ||
      responseObject?.url ||
      responseObject?.fileUrl;

    if (downloadUrl) {
      this.$common.download(downloadUrl);
    }
  }

  createOrUpdate(object) {
    return this.http.post<any>(`form/createOrUpdate`, object).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  get(config) {
    return this.http.get<any>(`form/all`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  getSingleForm(config) {
    return this.http.get<any>(`form/getSingleForm`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  delete(ids) {
    return this.http.get<any>(`form/deleteByIds`, ids).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  getFromDownloadUrl(config) {
    const headers = config?.headers || {};
    return this.getFormDownloadLink(headers.formId, headers);
  }

  getWardList(config) {
    return this.http.get<any>(`form/getListOfWards`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  getIhqList(config) {
    return this.http.get<any>(`form/getIHQAPFormState`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  getTxnDetails(config) {
    return this.http.get<any>(`form/getTxnDetails`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  validatePortAndCount(config) {
    return this.http.get<any>(`form/validatePortAndCount`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  resubmit(config) {
    return this.http.get<any>(`form/resubmit`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
}
