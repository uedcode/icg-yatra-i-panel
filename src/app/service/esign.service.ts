
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from './common.service';
@Injectable({
  providedIn: 'root'
})
export class EsignService {

  constructor(private http: HttpClient, private $common: CommonService) { }

  prepareForESign(body) {
    return this.http.post<any>(`esignPil/prepareForESign`, body).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  
  performESign(body) {
    return this.http.post<any>(`esignPil/performESign`, body).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

}
