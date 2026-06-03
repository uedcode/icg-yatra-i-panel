
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from 'src/app/service/core/common.service';
@Injectable({
  providedIn: 'root'
})
export class MisService {

  constructor(private http: HttpClient, private $common: CommonService) { }


  saveFileUrl(body) {
    return this.http.post<any>(`formSupportDocUrl/saveFileUrl`, body).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }


  deleteByUrl(config) {
    return this.http.get<any>(`formSupportDocUrl/deleteByUrl`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

}

