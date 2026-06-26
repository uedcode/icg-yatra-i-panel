import { Component, Input, OnInit, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';

import { AuthService } from 'src/app/service/auth/auth.service';
import { DesignationApiService } from 'src/app/service/api/code/designation-api.service';
import { RoleApiService } from 'src/app/service/api/admin/role-api.service';
import { RoleTypeApiService } from 'src/app/service/api/code/role-type-api.service';
import { UserApiService } from 'src/app/service/api/admin/user-api.service';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class RoleComponent implements OnInit {
  constructor(
    private location: Location,
    public $auth: AuthService,
    public $common: CommonService,
    private $roleApi: RoleApiService,
    private $roleTypeApi: RoleTypeApiService,
    private $designationApi: DesignationApiService,
    private $user: UserApiService
  ) { }

  @Input() dataList: Array<any> = [];
  @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;

  searchObj: any;
  config: any;
  userObj: any = {};
  noOfPage: any = 10;
  p: any = 1;
  disableBtn = true;

  userIdDetails: any;
  codeRoleList: any;
  codeStatusList: any;
  formObj: any = {};
  userList: any[] = [];
  roleList: any = [];
  allRoleList: any = [];
  desigList: any = [];
  authDocFile: File | null = null;
  tempObj: any;
  archiveObj: any;
  key = 'descr';
  reverse = false;

  cadreList = [
    { id: 'OP', descr: 'Officer' },
    { id: 'EP', descr: 'Enrolled Personnel' },
    { id: 'CP', descr: 'Civilian Staff' }
  ];

  ngOnInit(): void {
    this.codeRoleList = this.$auth.codeRoleType();
    this.codeStatusList = this.$auth.codeStatus();
    this.userIdDetails = this.$auth.getUserDetails();
    this.reset();
    this.getAll();
    this.roleList = [];
    this.desigList = [];
  }

  loadUsersForCadre() {
    try {
      if (!this.formObj?.cadre) {
        this.userList = [];
        this.clearSelectedUser();
        return;
      }
      this.$common.showLoader();
      this.config = {
        headers: {
          unitId: this.userIdDetails?.unitId,
          cadre: this.formObj?.cadre
        },
      };
      this.$user.getAll(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status == true) {
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
          if (response.status == true) {
            this.userObj = this.normalizeUserOption(response.object?.[0] || this.findUserById(userId) || {});
            this.formObj.pno = this.getUserPno(this.userObj);
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
    this.formObj.pno = '';
    this.userObj = {};
    this.disableBtn = true;
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
          roleTypeId: this.formObj.role
        },
        aclCodeDesignationDTO: {
          desigId: this.formObj.desig
        },
        aclCodeStatusDTO: {
          statusId: this.codeStatusList?.activate || 'AC'
        },
        aclUserDTO: {
          userId: this.getSelectedUserId(),
          cadre: this.formObj?.cadre
        },
        codeUnitDTO: {
          unit: this.userIdDetails?.unitId
        },
        authNo: this.formObj?.authNo,
        authDate: this.toMillis(this.formObj?.authDate),
        fromDateTime: this.toMillis(this.formObj?.fromDateTime),
      };

      const formData = this.buildRoleFormData(req);
      this.$roleApi.createOrUpdateRole(formData).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.$common.showMessage(`${response.message}`);
            this.disableBtn = true;
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
          unitId: this.getLegacyUnitId(),
          verAppIndicator: '1'
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

  getLegacyUnitId(): string {
    return this.userIdDetails?.gxUnitId || this.userIdDetails?.unitId || '';
  }

  openChangeStatusModal(data, statusCode) {
    this.tempObj = { ...data };
    this.tempObj.currentStatus = statusCode;
  }

  changeStatus(tempObj) {
    try {
      if (this.getRoleId(tempObj) == this.userIdDetails?.roleId) {
        return this.$common.showMessage("You can't Deactivate yourself.", 'danger');
      }
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

  openArchiveModal(data: any) {
    this.archiveObj = { ...data, isArchive: '1' };
  }

  changeStatusArchive(tempObj = this.archiveObj) {
    try {
      const roleId = this.getRoleId(tempObj);
      const config = {
        headers: {
          ids: roleId,
          isArchive: tempObj?.isArchive || '1'
        }
      };
      this.$roleApi.changeRoleArchiveStatus(config).subscribe((response: any) => {
        if (response.status === true) {
          this.$common.showMessage(`${response.message}`);
          this.dataList = this.dataList.filter((row: any) => this.getRoleId(row) !== roleId);
        }
      }, () => {
        this.$common.hideLoader();
      });
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

  getRoleTypeList() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: {
          visibilityIndicator: '1',
          cadre: this.formObj?.cadre || '',
          moduleId: this.userIdDetails?.moduleId || ''
        },
      };
      this.$roleTypeApi.getAll(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.allRoleList = (response.object || []).map((role: any) => ({
              ...role,
              selectId: role?.roleTypeId || role?.id || ''
            }));
            this.roleList = [...this.allRoleList];
            this.filterRoles(this.formObj?.desig);
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

  getDesignationList() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: {
          visibilityIndicator: '1',
          cadre: this.formObj?.cadre || '',
          moduleId: this.userIdDetails?.moduleId || ''
        },
      };
      this.$designationApi.getAll(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.desigList = (response.object || []).map((desig: any) => ({
              ...desig,
              selectId: desig?.desigId || desig?.id || ''
            }));
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

  onCadreChange() {
    this.clearSelectedUser();
    this.formObj.desig = '';
    this.formObj.role = '';
    this.userList = [];
    this.desigList = [];
    this.roleList = [];
    this.allRoleList = [];
    this.loadUsersForCadre();
    this.getDesignationList();
    this.getRoleTypeList();
  }

  filterRoles(desig: string) {
    const list = [...(this.allRoleList || [])];
    if (!desig) {
      this.roleList = list;
      return;
    }
    if (String(desig).includes('CO')) {
      this.roleList = list.filter((role: any) => !String(role?.selectId || role?.roleTypeId || role?.id || '').includes('VE'));
    } else if (String(desig).includes('LOGO')) {
      this.roleList = list.filter((role: any) => String(role?.selectId || role?.roleTypeId || role?.id || '').includes('VE'));
    } else {
      this.roleList = list;
    }
  }

  reset() {
    this.formObj = {
      cadre: '',
      userId: '',
      pno: '',
      role: '',
      desig: '',
      authNo: '',
      authDate: '',
      fromDateTime: ''
    };
    this.userList = [];
    this.userObj = {};
    this.authDocFile = null;
    this.disableBtn = true;
    this.requiredForm?.resetForm(this.formObj);
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
    const url = dataObj?.authDocUrl;
    if (url) {
      this.$auth.viewFile(url);
    }
  }

  validateSave(): string {
    if (!this.formObj?.cadre) return 'Please Select Cadre';
    if (!this.getSelectedUserId()) return 'Please Select User';
    if (!this.formObj?.desig) return 'Please Select Designation';
    if (!this.formObj?.role) return 'Please Select Role';
    if (!this.formObj?.authNo) return 'Please Enter Authorization No';
    if (!this.formObj?.authDate) return 'Please Select Authorization Date';
    if (!this.authDocFile) return 'Please Select Scanned copy of Authorization';
    if (!this.formObj?.fromDateTime) return 'Please Select From Date and Time';
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
    return name || pno || this.getSelectedUserId();
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
