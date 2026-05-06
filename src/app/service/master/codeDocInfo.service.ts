
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from '../common.service';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CodeDocInfoService {

  constructor(private http: HttpClient, private $common: CommonService) { }

  documentDtos = new Subject<[]>();

  getDocument(config) {
    
    return this.http.get<any>(`codePilDocInfo/all`, config).pipe(
      map((response: any) => {
        this.$common.parseResponse(response);
        return response;
      })
    );
  }

  setDocument(list) {
    this.documentDtos.next(list);
  }

}
