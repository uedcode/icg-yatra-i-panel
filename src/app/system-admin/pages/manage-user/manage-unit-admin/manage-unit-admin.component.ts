import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CodeUnitApiService } from 'src/app/service/api/code/code-unit-api.service';
import { RoleApiService } from 'src/app/service/api/admin/role-api.service';
import { UserApiService } from 'src/app/service/api/admin/user-api.service';

@Component({
  selector: 'app-manage-unit-admin',
  templateUrl: './manage-unit-admin.component.html',
  styleUrls: ['./manage-unit-admin.component.scss'],
  standalone: false
})
export class ManageUnitAdminComponent implements OnInit {

  constructor(
    private location: Location,
    public $auth: AuthService,
    private $common: CommonService,
    private $roleApi: RoleApiService,
    private $codeUnitApi: CodeUnitApiService,
    private $user: UserApiService
  ) { }

  @Input() dataList: Array<any> = [];
  @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;
  @ViewChild('authDocInput') authDocInput: ElementRef<HTMLInputElement>;

  searchObj: any;
  config: any;
  formObj: any = {};
  noOfPage: any = 5;
  p: any = 1;
  disableBtn = true;

  userIdDetails: any;
  codeRoleList: any;
  codeStatusList: any;
  userObj: any = {};
  unitList: any[] = [];
  userList: any[] = [];
  authDocFile: File | null = null;
  tempObj: any;
  key = 'descr';
  reverse = false;

  cadreList = [
    { id: 'OP', descr: 'Officers' },
    { id: 'EP', descr: 'Enrolled Personnel' },
    { id: 'CP', descr: 'Civilian Staff' }
  ];

  ngOnInit(): void {
    this.codeRoleList = this.$auth.codeRoleType();
    this.codeStatusList = this.$auth.codeStatus();
    this.userIdDetails = this.$auth.getUserDetails();
    this.reset();
    this.getUnitList();
    this.getAll();
  }

  onUnitChange() {
    this.formObj.cadre = '';
    this.userList = [];
    this.clearSelectedUser();
  }

  onCadreChange() {
    this.clearSelectedUser();
    this.loadUsersForSelectedUnitAndCadre();
  }

  loadUsersForSelectedUnitAndCadre() {
    try {
      if (!this.formObj?.unit || !this.formObj?.cadre) {
        this.userList = [];
        return;
      }

      this.$common.showLoader();
      this.config = {
        headers: {
          unitId: this.formObj.unit,
          cadre: this.formObj.cadre
        },
      };
      this.$user.getAll(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.userList = this.normalizeUserList(response.object || []);
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

  onUserChange(userId: string) {
    if (!userId) {
      this.clearSelectedUser(false);
      return;
    }

    try {
      this.$common.showLoader();
      this.config = {
        headers: {
          userId
        },
      };
      this.$user.getSingle(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.userObj = this.normalizeUserOption(response.object?.[0] || this.findUserById(userId) || {});
            this.disableBtn = false;
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

  clearSelectedUser(clearUserId = true) {
    if (clearUserId) {
      this.formObj.userId = '';
    }
    this.userObj = {};
    this.disableBtn = true;
  }

  reset() {
    this.formObj = {
      unit: '',
      cadre: '',
      userId: '',
      authNo: '',
      authDate: '',
      fromDateTime: ''
    };
    this.userList = [];
    this.userObj = {};
    this.authDocFile = null;
    this.disableBtn = true;
    if (this.authDocInput?.nativeElement) {
      this.authDocInput.nativeElement.value = '';
    }
    this.requiredForm?.resetForm(this.formObj);
  }

  saveRecord() {
    try {
      const validationMessage = this.validateSave();
      if (validationMessage) {
        return this.$common.showMessage(validationMessage, 'danger');
      }

      this.$common.showLoader();
      const req = {
        aclCodeRoleTypeDTO: {
          roleTypeId: this.codeRoleList?.unitAdmin || 'UN'
        },
        aclCodeStatusDTO: {
          statusId: this.codeStatusList?.activate || 'AC'
        },
        aclUserDTO: {
          userId: this.getSelectedUserId(),
          cadre: this.formObj?.cadre
        },
        codeUnitDTO: {
          unit: this.formObj?.unit
        },
        roleName: 'Unit Admin',
        authNo: this.formObj?.authNo,
        authDate: this.toMillis(this.formObj?.authDate),
        fromDateTime: this.toMillis(this.formObj?.fromDateTime),
      };

      this.$roleApi.createOrUpdateRole(this.buildRoleFormData(req)).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.$common.showMessage(`${response.message}`);
            this.reset();
            this.getAll();
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

  getAll() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: {
          userId: '',
          roleTypeId: this.codeRoleList?.unitAdmin || 'UN',
          unitId: '',
          statusId: '',
          verAppIndicator: '0',
          isArchive: '0'
        },
      };
      this.$roleApi.getAllRoles(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.dataList = response.object || [];
          }
        },
        (err) => {
          this.$common.hideLoader();
          console.log(err);
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  getUnitList() {
    try {
      this.$common.showLoader();
      this.$codeUnitApi.getGxUnits({ headers: {} }).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.unitList = response.object || [];
          }
        },
        (err) => {
          this.$common.hideLoader();
          console.log(err);
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  onAuthDocSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    if (file && file.type !== 'application/pdf') {
      this.$common.showMessage('Please select PDF file', 'danger');
      input.value = '';
      this.authDocFile = null;
      return;
    }
    this.authDocFile = file;
  }

  viewAuthDoc(dataObj: any) {
    if (dataObj?.authDocUrl) {
      this.$auth.viewFile(dataObj.authDocUrl);
    }
  }

  validateSave(): string {
    if (!this.formObj?.unit) return 'Please Select Unit';
    if (!this.formObj?.cadre) return 'Please Select Cadre';
    if (!this.getSelectedUserId()) return 'Please Select User';
    if (!this.formObj?.authNo) return 'Please Enter Authorization No';
    if (!this.formObj?.authDate) return 'Please Select Authorization Date';
    if (!this.authDocFile) return 'Please Select Scanned copy of Authorization';
    if (!this.formObj?.fromDateTime) return 'Please Select From Date and Time';
    const duplicate = this.dataList.some((row: any) => row?.aclUserDTO?.userId === this.getSelectedUserId());
    if (duplicate) return 'User already exist as Unit Admin';
    return '';
  }

  buildRoleFormData(req: any): FormData {
    const formData = new FormData();
    formData.append('aclRoleDTO', JSON.stringify(req));
    if (this.authDocFile) {
      formData.append('authDocUrl', this.authDocFile);
    }
    return formData;
  }

  goBack() {
    if (window.history.length > 1) {
      this.reset();
      this.location.back();
    } else {
      window.close();
    }
  }

  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }

  getRoleId(dataObj: any) {
    return dataObj?.roleId || dataObj?.id;
  }

  openChangeStatusModal(data, statusCode) {
    this.tempObj = { ...data };
    this.tempObj.currentStatus = statusCode;
  }

  changeStatus(tempObj) {
    try {
      const config = {
        headers: {
          roleId: this.getRoleId(tempObj),
          statusId: tempObj.currentStatus
        }
      };
      this.$roleApi.changeRoleStatus(config).subscribe((response: any) => {
        if (response.status === true) {
          this.updateRowStatus(tempObj);
          this.$common.showMessage(`${response.message}`);
        }
      }, () => {
        this.$common.hideLoader();
      });
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  getSelectedUserId(): string {
    return this.formObj?.userId || this.userObj?.selectId || this.userObj?.userId || this.userObj?.pid || this.userObj?.id || '';
  }

  getUserName(dataObj: any): string {
    return dataObj?.aclUserDTO?.name || dataObj?.name || dataObj?.nameDescr || dataObj?.nameShort || '';
  }

  getUserPno(dataObj: any): string {
    const nested = dataObj?.aclUserDTO?.pno;
    if (nested) return nested;
    if (dataObj?.pno && dataObj?.suf) return `${dataObj.pno}-${dataObj.suf}`;
    return dataObj?.pno || dataObj?.pNo || '';
  }

  getUserPhone(dataObj: any): string {
    return dataObj?.aclUserDTO?.phone || dataObj?.phone || dataObj?.mobileNo || '';
  }

  getUserRank(dataObj: any): string {
    return dataObj?.aclUserDTO?.rank || dataObj?.rank || dataObj?.rankDescr || '';
  }

  getUserOptionLabel(dataObj: any): string {
    if (dataObj?.selectLabel) return dataObj.selectLabel;
    const name = this.getUserName(dataObj);
    const pno = this.getUserPno(dataObj);
    if (name && pno) return `${name} (${pno})`;
    return name || pno || dataObj?.selectId || '';
  }

  findUserById(userId: string): any {
    return (this.userList || []).find((user: any) => {
      return (user?.selectId || user?.userId || user?.pid || user?.id) === userId;
    });
  }

  normalizeUserList(users: any[]): any[] {
    return (users || []).map((user: any) => this.normalizeUserOption(user));
  }

  normalizeUserOption(user: any): any {
    const selectId = user?.userId || user?.pid || user?.id || '';
    return {
      ...user,
      selectId,
      selectLabel: this.getUserOptionLabel({ ...user, selectId })
    };
  }

  toMillis(value: any): number {
    if (!value) return 0;
    if (typeof value === 'number') return value;
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? 0 : time;
  }

  updateRowStatus(tempObj: any) {
    const roleId = this.getRoleId(tempObj);
    this.dataList = this.dataList.map((row: any) => {
      if (this.getRoleId(row) !== roleId) return row;
      return {
        ...row,
        aclCodeStatusDTO: {
          ...(row?.aclCodeStatusDTO || {}),
          statusId: tempObj.currentStatus
        }
      };
    });
  }
}
