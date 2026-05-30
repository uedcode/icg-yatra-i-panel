import { Injectable } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { FormService } from './form.service';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { DropdownService } from './dropdown.service';
import { HttpClient } from '@angular/common/http';

declare var $: any;

@Injectable({
  providedIn: 'root',
})
export class DropdownManageService {
  constructor(
    private $common: CommonService,
    public $dropdown: DropdownService,
    public $auth: AuthService,
    private http: HttpClient
  ) {}

  config: any;
  dropdownList = new Subject<[]>();

  getPurposeTypes(config: any) {
    try {
      this.$common.showLoader();

      return this.$dropdown.getPurposeTypes(config);
    } catch (error) {
      console.error('Error in getPurposeTypes()', error);
      this.$common.hideLoader();
      throw error;
    }
  }

  getDropdown() {
    try {
      this.$common.showLoader();

      this.config = {
        headers: {},
      };

      this.$dropdown.getDropdown(this.config).subscribe(
        (response) => {
          this.$common.hideLoader();

          if (response.status === true) {
            this.dropdownList.next(response?.object);
          }
        },
        (err) => {
          console.log(err);
          this.$common.hideLoader();
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }
}

