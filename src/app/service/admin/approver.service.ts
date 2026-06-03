import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';

@Injectable({
  providedIn: 'root'
})
export class ApproverService {

  constructor(private $common: CommonService, private http: HttpClient) { }

getAll(config) {
  return this.http.get<any>(`codeUser/all`, config).pipe(
    map((response: any) => {
      this.$common.parseResponse(response);
      return response;
    })
  );
}


createOrUpdate(object) {
  return this.http.post<any>(`codeUser/createOrUpdate`, object).pipe(
    map((response: any) => {
      this.$common.parseResponse(response);
      return response;
    })
  );
}

changeStatus(config) {
  return this.http.post<any>(`codeUser/changeStatus`, null, config).pipe(
    map((response: any) => {
      this.$common.parseResponse(response);
      return response;
    })
  );
}

}

