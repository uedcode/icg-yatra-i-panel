import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/service/auth.service';
import { CommonService } from 'src/app/service/common.service';
import { SystemAdminService } from 'src/app/service/systemAdmin.service';
import { UserService } from 'src/app/service/user.service';

@Component({
  selector: 'app-manage-paylevel-transaction',
  templateUrl: './manage-paylevel-transaction.component.html',
  styleUrls: ['./manage-paylevel-transaction.component.css'],
  standalone: false,
})
export class ManagePaylevelTransactionComponent implements OnInit {
  userIdDetails: any;
  formObj: any = {};
  userObj: any = {};
  dataList: any[] = [];
  searchObj: any;
  noOfPage: any = 10;
  p: any = 1;
  key = 'aclUserDTO.pno';
  reverse = false;
  disableBtn = true;
  isEdit = false;
  payLevelOptions = [
    'L01', 'L02', 'L03', 'L04', 'L05', 'L06', 'L07', 'L08', 'L09',
    'L10', 'L11', 'L12', 'L13', 'L13A', 'L14', 'L15', 'L16', 'L17'
  ];

  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private $systemAdmin: SystemAdminService,
    private $user: UserService
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    this.resetForm();
    this.getAll();
  }

  getAll(): void {
    try {
      this.$common.showLoader();
      this.$systemAdmin.getPayLevelTransactions({ headers: {} }).subscribe(
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

  doSearch(): void {
    try {
      if (!this.formObj?.pno) {
        return this.$common.showMessage('Please Enter PNO', 'danger');
      }
      this.$common.showLoader();
      const config = {
        headers: {
          pNo: this.formObj?.pno,
        },
      };
      this.$user.getUserByPno(config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response?.status === true && response?.object?.[0]) {
            this.userObj = response.object[0];
            this.disableBtn = false;
          }
        },
        () => {
          this.$common.hideLoader();
          this.userObj = {};
          this.disableBtn = true;
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  saveRecord(): void {
    try {
      if (!this.userObj?.pid) {
        return this.$common.showMessage('Please search valid PNO', 'danger');
      }
      if (!this.formObj?.paylevel) {
        return this.$common.showMessage('Please select Pay Level', 'danger');
      }
      if (!this.formObj?.fromDt) {
        return this.$common.showMessage('Please select From Date', 'danger');
      }
      if (!this.formObj?.basicPay) {
        return this.$common.showMessage('Please enter Basic Pay', 'danger');
      }

      const payload = {
        payId: this.formObj?.payId || '',
        aclUserDTO: {
          userId: this.userObj?.pid,
          pno: this.userObj?.pno,
          name: this.userObj?.nameShort || this.userObj?.nameDescr,
          codeUnitDTO: {
            descr: this.userObj?.unitDescr || this.userObj?.unitName,
          },
        },
        paylevel: this.formObj.paylevel,
        fromDt: this.toTime(this.formObj.fromDt),
        toDt: this.formObj?.toDt ? this.toTime(this.formObj.toDt) : 0,
        basicPay: Number(this.formObj.basicPay),
      };

      this.$common.showLoader();
      this.$systemAdmin.createOrUpdatePayLevelTransaction(payload).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response?.status === true) {
            this.$common.showMessage(`${response.message}`);
            const saved = response?.object?.[0];
            if (saved) {
              if (this.isEdit) {
                this.dataList = this.dataList.map((row: any) =>
                  row?.payId === saved?.payId ? { ...row, ...saved } : row
                );
              } else {
                this.dataList = [...this.dataList, saved];
              }
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

  editObject(dataObj: any): void {
    this.formObj = {
      payId: dataObj?.payId,
      pno: dataObj?.aclUserDTO?.pno,
      paylevel: dataObj?.paylevel,
      fromDt: this.toDateInput(dataObj?.fromDt),
      toDt: this.toDateInput(dataObj?.toDt),
      basicPay: dataObj?.basicPay,
    };
    this.userObj = {
      pid: dataObj?.aclUserDTO?.userId,
      pno: dataObj?.aclUserDTO?.pno,
      nameShort: dataObj?.aclUserDTO?.name,
      unitDescr: dataObj?.aclUserDTO?.codeUnitDTO?.descr,
    };
    this.disableBtn = false;
    this.isEdit = true;
  }

  resetForm(): void {
    this.formObj = {
      payId: '',
      pno: '',
      paylevel: '',
      fromDt: '',
      toDt: '',
      basicPay: '',
    };
    this.userObj = {};
    this.disableBtn = true;
    this.isEdit = false;
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

  private toTime(value: string): number {
    return value ? new Date(value).getTime() : 0;
  }

  private toDateInput(value: number): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }
}

