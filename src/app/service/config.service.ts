import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { CommonService } from './common.service';

@Injectable({
    providedIn: 'root'
})
export class ConfigService {

    constructor(private comm: CommonService, private http: HttpClient) { }
    createOrUpdate(config) {
        return this.http.post<any>(`config/createOrUpdate`, config).pipe(
            map((response: any) => {
                this.comm.parseResponse(response);
                return response;
            })
        );
    }

    getAll(config) {
        return this.http.get<any>(`config/all`, config).pipe(
            map((response: any) => {
                this.comm.parseResponse(response);
                return response;
            })
        );
    }

}
