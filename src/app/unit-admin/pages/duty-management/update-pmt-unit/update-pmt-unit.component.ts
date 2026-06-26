import { Location } from '@angular/common';
import { Component, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { MarkTyApiService } from 'src/app/service/api/admin/mark-ty-api.service';
import { UpdatePmtApiService } from 'src/app/service/api/admin/update-pmt-api.service';

@Component({
  selector: 'app-update-pmt-unit',
  templateUrl: './update-pmt-unit.component.html',
  styleUrls: ['./update-pmt-unit.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class UpdatePmtUnitComponent implements OnInit {
  @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;

  userIdDetails: any;
  formObj: any = {};
  dataList: any[] = [];
  allUnits: any[] = [];
  allToUnits: any[] = [];
  pnoList: any[] = [];
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
    private $updatePmtApi: UpdatePmtApiService,
    private $markTyApi: MarkTyApiService
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    this.resetForm();
    this.getAll();
    this.getUnits();
    this.getToUnits();
  }

  getAll(): void {
    try {
      this.$common.showLoader();
      this.$updatePmtApi.getAllRecords({ headers: {} }).subscribe(
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

  getUnits(): void {
    this.$updatePmtApi.getAllUnits({ headers: {} }).subscribe(
      (response: any) => {
        this.allUnits = Array.isArray(response?.object) ? response.object : [];
      },
      () => {
        this.allUnits = [];
      }
    );
  }

  getToUnits(): void {
    const gxUnitId = this.userIdDetails?.gxUnitId || this.userIdDetails?.unitId || '';
    this.$updatePmtApi.getAllUnits({ headers: { gxUnitId } }).subscribe(
      (response: any) => {
        this.allToUnits = Array.isArray(response?.object) ? response.object : [];
      },
      () => {
        this.allToUnits = [];
      }
    );
  }

  onFromUnitChange(unit: string): void {
    this.formObj.codeHrDataDTO = {};
    this.formObj.pnoId = '';
    this.pnoList = [];
    const selectedUnit = this.allUnits.find((item: any) => item?.unit === unit);
    this.formObj.fromUnitDTO = selectedUnit ? { ...selectedUnit } : {};
    if (!selectedUnit?.unit) {
      return;
    }
    this.$markTyApi.getPnoList({ headers: { gxUnit: '', unit: selectedUnit.unit } }).subscribe(
      (response: any) => {
        this.pnoList = Array.isArray(response?.object) ? response.object : [];
      },
      () => {
        this.pnoList = [];
      }
    );
  }

  onPnoChange(pid: string): void {
    const selectedPno = this.pnoList.find((item: any) => item?.pid === pid);
    this.formObj.codeHrDataDTO = selectedPno ? { ...selectedPno } : {};
  }

  onToUnitChange(unit: string): void {
    const selectedUnit = this.allToUnits.find((item: any) => item?.unit === unit);
    this.formObj.toUnitDTO = selectedUnit ? { ...selectedUnit } : {};
  }

  saveRecord(): void {
    try {
      if (!this.formObj?.fromUnitDTO?.unit) {
        return this.$common.showMessage('Please select From Unit', 'danger');
      }
      if (!this.formObj?.codeHrDataDTO?.pid) {
        return this.$common.showMessage('Please select PNO', 'danger');
      }
      if (!this.formObj?.toUnitDTO?.unit) {
        return this.$common.showMessage('Please select To Unit', 'danger');
      }

      const payload = {
        codeHrDataDTO: this.formObj.codeHrDataDTO,
        fromUnitDTO: this.formObj.fromUnitDTO,
        toUnitDTO: this.formObj.toUnitDTO,
      };

      this.$common.showLoader();
      this.$updatePmtApi.createOrUpdate(payload).subscribe(
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
      fromUnitId: '',
      toUnitId: '',
      pnoId: '',
      codeHrDataDTO: {},
      fromUnitDTO: {},
      toUnitDTO: {},
    };
    this.pnoList = [];
  }

  openChangeStatusModal(dataObj: any, status: number): void {
    this.tempObj = { ...dataObj, currentStatus: status };
  }

  changeStatus(tempObj: any): void {
    try {
      const config = {
        headers: {
          ids: this.getId(tempObj),
          status: tempObj.currentStatus,
        },
      };
      this.$updatePmtApi.changeFlag(config).subscribe(
        (response: any) => {
          if (response?.status === true) {
            this.$common.showMessage(`${response.message}`);
            this.dataList = this.dataList.map((row: any) =>
              this.getId(row) === this.getId(tempObj)
                ? { ...row, isFlag: tempObj.currentStatus }
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

