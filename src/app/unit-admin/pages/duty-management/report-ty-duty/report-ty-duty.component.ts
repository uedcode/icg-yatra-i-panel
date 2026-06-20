import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { MarkTyApiService } from 'src/app/service/api/admin/mark-ty-api.service';

@Component({
  selector: 'app-report-ty-duty',
  templateUrl: './report-ty-duty.component.html',
  styleUrls: ['./report-ty-duty.component.css'],
  standalone: false,
})
export class ReportTyDutyComponent implements OnInit {
  userIdDetails: any;
  formObj: any = {};
  pnoList: any[] = [];
  dataList: any[] = [];
  tempObj: any;
  searchObj: any;
  noOfPage: any = 5;
  p: any = 1;
  key = 'codeHrDataDTO.pno';
  reverse = false;

  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private $markTyApi: MarkTyApiService
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    this.resetForm();
    this.getPnoList();
    this.getAll();
  }

  getPnoList(): void {
    const gxUnit = this.userIdDetails?.gxUnitId || this.userIdDetails?.unitId || '';
    this.$markTyApi.getPnoList({ headers: { gxUnit, unit: '' } }).subscribe(
      (response: any) => {
        this.pnoList = Array.isArray(response?.object) ? response.object : [];
      },
      () => {
        this.pnoList = [];
      }
    );
  }

  getAll(): void {
    try {
      this.$common.showLoader();
      this.$markTyApi.getAllMarkedTyDuty({ headers: { status: '1' } }).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          this.dataList = Array.isArray(response?.object) ? response.object : [];
        },
        () => {
          this.$common.hideLoader();
          this.dataList = [];
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  onPnoChange(pid: string): void {
    const selectedPno = this.pnoList.find((item: any) => item?.pid === pid);
    this.formObj.codeHrDataDTO = selectedPno ? { ...selectedPno } : {};
  }

  saveRecord(): void {
    try {
      if (!this.formObj?.codeHrDataDTO?.pid) {
        return this.$common.showMessage('Please select PNO', 'danger');
      }

      const payload = {
        codeHrDataDTO: this.formObj.codeHrDataDTO,
        status: '1',
      };

      this.$common.showLoader();
      this.$markTyApi.createOrUpdateMarkedTyDuty(payload).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response?.status === true) {
            this.$common.showMessage(`${response.message}`);
            if (Array.isArray(response?.object) && response.object[0]) {
              this.dataList = [...this.dataList, response.object[0]];
            }
            this.resetForm();
            this.p = 1;
          }
        },
        () => {
          this.$common.hideLoader();
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  resetForm(): void {
    this.formObj = {
      pnoId: '',
      codeHrDataDTO: {},
    };
  }

  openChangeStatusModal(dataObj: any, status: string): void {
    this.tempObj = { ...dataObj, currentStatus: status };
  }

  changeStatus(tempObj: any): void {
    try {
      const config = {
        headers: {
          id: this.getId(tempObj),
          status: tempObj.currentStatus,
        },
      };
      this.$markTyApi.changeMarkedTyDutyFlag(config).subscribe(
        (response: any) => {
          if (response?.status === true) {
            this.$common.showMessage(`${response.message}`);
            this.dataList = this.dataList.map((row: any) =>
              this.getId(row) === this.getId(tempObj)
                ? { ...row, status: tempObj.currentStatus }
                : row
            );
          }
        },
        () => {
          this.$common.hideLoader();
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  sort(key: string): void {
    this.key = key;
    this.reverse = !this.reverse;
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      window.close();
    }
  }

  getId(dataObj: any): any {
    return dataObj?.id;
  }
}

