import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root',
})
export class ClaimRemarkApiService {
  constructor(
    private http: HttpClient,
    private $common: CommonService
  ) {}

  getAll(config?: any) {
    return this.http.get<any>('claimRemark/all', config).pipe(
      map((response) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }
}
