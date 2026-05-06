import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { NgForm } from '@angular/forms';
import { Location } from '@angular/common';
import { AuthService } from 'src/app/service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from 'src/app/service/form.service';
import { FormManageService } from 'src/app/service/formManage.service';
import { DatePipe } from '@angular/common';
import { DropdownManageService } from 'src/app/service/dropdownManage.service';
import { CodeDocInfoService } from 'src/app/service/master/codeDocInfo.service';
import stateJson from 'src/app/creator/json/stateList.json';
import martialStatusJson from 'src/app/creator/json/martialStatus.json';
import relationJson from 'src/app/creator/json/relationLIst.json';
import genderJson from 'src/app/creator/json/genderList.json';
import shipJson from 'src/app/creator/json/shipList.json';
import catListJson from 'src/app/creator/json/categoryList.json';
import * as crypto from 'crypto-js';
import { ManagePortService } from 'src/app/service/managePort.service';
import { MasterShipService } from 'src/app/service/master/master-ship.service';
import { FormStateService } from 'src/app/service/formState.service';
import { PilotageHistoryService } from 'src/app/service/pilotage-history.service';

declare var $: any;
@Component({
    selector: 'app-pilotage-history',
    templateUrl: './pilotage-history.component.html',
    styleUrls: ['./pilotage-history.component.scss'],
    standalone: false
})
export class PilotageHistoryComponent implements OnInit {
  today: any;
  constructor(
    private location: Location,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private $common: CommonService,
    public $auth: AuthService,
    public $form: FormService,
    public $pilotageService: PilotageHistoryService,
    public $formManage: FormManageService,
    private $dropdownManage: DropdownManageService,
    private $codeDocInfo: CodeDocInfoService,
    private $port: ManagePortService,
    private router: Router,
  ) { }

  @Input() dataList: Array<any> = [];
  @ViewChild('pilotageForm', { static: true }) pilotageForm: NgForm;

  id: any;
  searchObj: any;
  config: any;
  formObj: any = {};
  noOfPage: any;
  p: any;

  portList = [];
  userIdDetails;
  
  passageList = [
    { id: 1, descr: 'In' },
    { id: 2, descr: 'Out' },
    { id: 3, descr: 'Sb' },
    { id: 4, descr: 'Anchoring In' },
    { id: 5, descr: 'Anchoring Out' },
  ];

  formId: any;
  claimType: any;
  tempFormObj: any;

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.reset();
    this.getPortDetails();
  }

  formdate: any;

  reset() {
    this.formObj = {};
    this.pilotageHistoryChildDTOs = [];
    this.pilotageForm.resetForm();
  }

  // Add Pilotage details start
  pilotageObj: any = {};
  pilotageHistoryChildDTOs: any = [];
  addIndex: any = null;

  selectPortName(portName) {
    this.portList.forEach(element => {
      if (element.portName == portName) {
        this.pilotageObj.portName = element.portName;
      }
    });
  }

  saveRecord() {
    try {
      this.$common.showLoader();
      let formObj = {
        aclUserDTO: {
          userId: this.userIdDetails.userId
        },
        codeUnitDTO: {
          unit: this.userIdDetails?.unitId
        },
        claimType: this.userIdDetails.desigId,
        claimState: "PE",
        pilotageHistoryChildDTOs: this.pilotageHistoryChildDTOs
      }
      this.$pilotageService.createOrUpdate(formObj).subscribe(
        (response) => {
          this.$common.hideLoader();
          if (response.status === true) {
            let object = response.object[0];
            this.$common.showMessage(`${response.message}`);
            let moduleUrl = this.$auth.getModuleName();
            this.router.navigateByUrl(
              moduleUrl + `/${'pilotage-history-status'}`
            );
            this.reset();
          } else {
            this.$common.showMessage(`${response.message}`);
          }
        },
        (error) => {
          this.$common.hideLoader();
          console.log(error);
        }
      );
    } catch (error) {
      this.$common.hideLoader();
      console.log(error);
    }
  }

 addPilotage() {
  // required validations
  if (!this.formObj?.portName) {
    this.$common.showMessage('Channel/Port is required', 'danger');
    return;
  }
  if (!this.formObj?.puaPassage) {
    this.$common.showMessage('IN/OUT Passage is required', 'danger');
    return;
  }

  // 0–5 validation (as-is)
  const currentInputMovement = Number(this.pilotageObj.count) || 0;
  if (currentInputMovement < 0 || currentInputMovement > 5) {
    this.$common.showMessage(
      'Total number of similar movements for each entry must be between 0 and 5.',
      'danger'
    );
    return;
  }

  // -------- DUPLICATE CHECK (same rule as form) ----------
  const curPort = this.norm(this.formObj.portName);
  const curPassageGrouped = this.normalizePassage(this.formObj.puaPassage);
  const curCount = currentInputMovement;

  const isDuplicate = this.pilotageHistoryChildDTOs.some((entry, idx) => {
    // edit mode me current index skip
    if (this.addIndex != null && idx === this.addIndex) return false;

    return (
      this.norm(entry.portName) === curPort &&
      this.normalizePassage(entry.puaPassage) === curPassageGrouped &&
      (Number(entry.count) || 0) === curCount
    );
  });

  if (isDuplicate) {
    this.$common.showMessage(
      'An entry with the same Port, Passage (In/Anchoring In or Out/Anchoring Out), and Similar Movement Count already exists.',
      'danger'
    );
    return;
  }
  // -------------------------------------------------------

  // map form-bound fields into the object you actually push
  this.pilotageObj.puaPassage = this.formObj.puaPassage; // original passage bhej rahe hain
  this.pilotageObj.portName   = this.formObj.portName || this.pilotageObj.portName;

  const obj = { ...this.pilotageObj };

  if (this.addIndex == null) {
    this.pilotageHistoryChildDTOs.push(obj);
  } else {
    this.pilotageHistoryChildDTOs[this.addIndex] = obj;
  }

  // optional: sort by port/pass/count for stable view
  this.pilotageHistoryChildDTOs.sort((a, b) => {
    const ap = this.norm(a.portName), bp = this.norm(b.portName);
    if (ap !== bp) return ap < bp ? -1 : 1;
    const apg = this.normalizePassage(a.puaPassage), bpg = this.normalizePassage(b.puaPassage);
    if (apg !== bpg) return apg < bpg ? -1 : 1;
    return (Number(a.count) || 0) - (Number(b.count) || 0);
  });

  this.resetPilotage();
}


// --- helpers (same as in form) ---
private norm(v: any): string {
  return (v ?? '').toString().trim().toLowerCase();
}
private normalizePassage(val: any): string {
  const p = this.norm(val);
  if (p === 'in' || p === 'anchoring in') return 'in';
  if (p === 'out' || p === 'anchoring out') return 'out';
  return p; // 'sb' or others stay distinct
}


editPilotage(data, i) {
  this.pilotageObj = { ...data };
  this.formObj.portName   = this.pilotageObj.portName;
  this.formObj.puaPassage = this.pilotageObj.puaPassage; // ✅ prefill dropdown
  this.addIndex = i;
}

  deletePilotage(i) {
    this.pilotageHistoryChildDTOs.splice(i, 1);
  }

resetPilotage() {
  this.pilotageForm.resetForm();
  this.addIndex = null;
  // optional: ensure model cleared
  if (this.formObj) {
    this.formObj.portName = null;
    this.formObj.puaPassage = null;
  }
  // also clear the working obj if you want
  this.pilotageObj = {};
}

  // Add Pilotage details end

  goBack() {
    if (window.history.length > 1) {
      this.reset();
      this.location.back();
    } else {
      window.close();
    }
  }

  actionPage(data) {
    let moduleUrl = this.$auth.getModuleName();
    let url = moduleUrl + `/preview-details`;
    this.$auth.openLink(url, `id=${data.id}`);
  }

  // data shorting start
  key: string = 'descr';
  reverse: boolean = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }
  // data shorting end

  getPortDetails() {
    try {
      this.$common.showLoader();
      this.config = {
        headers: {},
      };
      this.$port.get(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            let list = response.object;
            this.portList = list;
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

}
