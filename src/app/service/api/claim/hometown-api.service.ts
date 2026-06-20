import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root',
})
export class HometownApiService {
  constructor(private http: HttpClient, private $common: CommonService) {}

  init(config?: any) {
    return this.http.get<any>('hometown/initHometown', config).pipe(map((response: any) => this.parse(response)));
  }

  createOrUpdate(payload: any) {
    return this.http.post<any>('hometown/createOrUpdate', payload).pipe(map((response: any) => this.parse(response)));
  }

  private parse(response: any) {
    this.$common.parseResponse(response);
    return response;
  }
}
