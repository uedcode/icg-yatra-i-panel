import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root',
})
export class TempDocInfoApiService {
  constructor(
    private http: HttpClient,
    private $common: CommonService
  ) {}

  createOrUpdate(formData: FormData) {
    return this.http.post<any>('tempDocInfo/createOrUpdate', formData).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
}
