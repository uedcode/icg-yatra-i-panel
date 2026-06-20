import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root',
})
export class CodeDocInfoApiService {
  documentDtos = new Subject<[]>();

  constructor(
    private http: HttpClient,
    private $common: CommonService
  ) {}

  getDocument(config) {
    return this.getAll(config);
  }

  setDocument(list) {
    this.documentDtos.next(list);
  }

  getAll(config?: any) {
    return this.http.get<any>('codeDocInfo/all', config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  createOrUpdate(payload: any) {
    return this.http.post<any>('codeDocInfo/createOrUpdate', payload).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  delete(config: any) {
    return this.http.delete<any>('codeDocInfo', config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
}
