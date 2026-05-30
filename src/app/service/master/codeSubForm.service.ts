import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from '../common.service';

@Injectable({
  providedIn: 'root'
})
export class CodeSubFormService {

  constructor(private $common: CommonService, private http: HttpClient) { }

  get(config) {
    return this.http.get<any>(`codeSubForm/all`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

}


