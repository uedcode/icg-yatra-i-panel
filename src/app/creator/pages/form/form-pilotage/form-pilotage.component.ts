import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { NgForm } from '@angular/forms';
import { Location, DatePipe } from '@angular/common';
import { AuthService } from 'src/app/service/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormService } from 'src/app/service/form.service';
import { FormManageService } from 'src/app/service/formManage.service';
import { DropdownManageService } from 'src/app/service/dropdownManage.service';
import { ManagePortService } from 'src/app/service/managePort.service';
import { MasterShipService } from 'src/app/service/master/master-ship.service';
import { FormStateService } from 'src/app/service/formState.service';
import { MasterPortRateService } from 'src/app/service/master/master-port-rate.service';
import { UserService } from 'src/app/service/user.service';

declare var $: any;

type RateContext = {
  portId: number;
  unitGrtNo: string;
  entryDateTs: number;
};

@Component({
    selector: 'app-form-pilotage',
    templateUrl: './form-pilotage.component.html',
    styleUrls: ['./form-pilotage.component.css'],
    standalone: false
})
export class FormPilotageComponent implements OnInit {
  today: any;

  constructor(
    private location: Location,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private $common: CommonService,
    public $auth: AuthService,
    public $form: FormService,
    public $formState: FormStateService,
    public $formManage: FormManageService,
    private $dropdownManage: DropdownManageService,
    private $port: ManagePortService,
    private $portRate: MasterPortRateService,
    private router: Router,
    private $ship: MasterShipService,
    private $user: UserService,
  ) { }

  @Input() dataList: Array<any> = [];
  @ViewChild('requiredForm', { static: true }) requiredForm: NgForm;
  @ViewChild('pilotageForm', { static: true }) pilotageForm: NgForm;

  id: any;
  searchObj: any;
  config: any;
  formObj: any = {};
  noOfPage: any;
  p: any;

  isEditPilotage: boolean = false;
  initialPortRate: number = 0;
  isManualRateEntry: boolean = false;

  shipList = [];
  portList: any[] = [];
  portRateList: any[] = [];
  isRateBlocked: boolean = false;

  selectedTimeOfDay = [
    { id: 'Day', descr: 'Day' },
    { id: 'Night', descr: 'Night' }
  ];
  userIdDetails: any;

  passageList = [
    { id: 1, descr: 'In' },
    { id: 2, descr: 'Out' },
    { id: 3, descr: 'Sb' },
    { id: 4, descr: 'Anchoring In' },
    { id: 5, descr: 'Anchoring Out' },
  ];

  operationTypeList = [
    { id: 'ENT', descr: 'Entrance/Entry (ENT)' },
    { id: 'MNT', descr: 'Movement (MNT)' },
  ];

  codeStatus: any;
  formId: any;
  tempFormObj: any;
  subFormId: any;
  documentDtos: any[] = [];
  supplementryId: any;
  supplementryClaim: any;

  // child details
  pilotageObj: any = {
    portName: null,
    anchorBearing: null,
    entryAuth: null,
    entryDate: null,      // yyyy-MM-dd
    entryTime: null,      // HHMM
    movementTime: null,   // Day/Night
    puaPassage: null,     // In/Out/Sb/Anchoring ...
    maxDraughtInMtr: null,
    maxDraughtInFt: null,
    operationType: null,  // if Night
    operationTime: null,  // if Night HHMM
    portRate: null,
    amount: null,
    noOfSimilarMovement: null,
  };
  portRate: number = 0;
  portRateObj: any = null;

  formChildPilotageDTOs: any[] = [];
  addIndex: number | null = null;

  // GRT + ship data
  selecteGrtList: any[] = [];
  selecteShipList: any[] = [];

  // -------- Rate Context Cache / Debounce Guards ----------
  private currentCtxKey: string | null = null;     // the ctx we last applied
  private inFlightCtxKey: string | null = null;    // the ctx currently fetching

  private buildCtx(): RateContext | null {
    // Need all 3: portId + unitGrtNo + entryDateTs
    const foundPort = this.portList.find(p => p.portName === this.pilotageObj?.portName);
    const portId = foundPort?.id;
    const unitGrtNo = this.formObj?.unitGrtNo;
    const entryDateStr = this.pilotageObj?.entryDate;

    if (!portId || !unitGrtNo || !entryDateStr) return null;

    const ts = new Date(entryDateStr).getTime();
    if (!isFinite(ts)) return null;

    return { portId, unitGrtNo, entryDateTs: ts };
  }

  private keyOf(ctx: RateContext): string {
    return `${ctx.portId}|${ctx.unitGrtNo}|${ctx.entryDateTs}`;
  }

  private sameKey(a: string | null, b: string | null): boolean {
    return !!a && !!b && a === b;
  }
  // -------------------------------------------------------

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    this.today = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.codeStatus = this.$auth?.codeStatus();

    this.route.queryParams.subscribe((params) => {
      this.formId = params?.id;
      this.subFormId = params?.subFormId;
      this.supplementryId = params?.supId;
      if (this.supplementryId) this.supplementryClaim = 'Supplementary ';
    });

    this.reset();
    this.getPortDetails();
    this.getShipName();
    this.getRoleById();
  }

  // -------------------- Submit & State --------------------
  saveRecord(actionType: string) {
    const formObj = { ...this.formObj };
    const initReq = this.$auth?.getFormDetails('PIL', actionType);
    if (this.supplementryId) formObj.supClaimId = this.supplementryId;

    const req: any = { ...formObj, ...initReq, id: this.formId };

    if (this.formChildPilotageDTOs.length > 0) {
      this.formChildPilotageDTOs.forEach(item => {
        item.entryDate = new Date(item?.entryDate).getTime();
      });
      req.formChildPilotageDTOs = this.formChildPilotageDTOs;
    }

    if (actionType === 'OB' && !this.formChildPilotageDTOs.length) {
      this.$common.showMessage('Please fill in pilotage details before submitting!', 'danger');
      return;
    }

    this.$formManage?.handleSubmit(req);

    this.$formManage?.formSubmitStatus.subscribe((res) => {
      if (!res) return;
      const formStateInputDTO = res.obj.formStateInputDTO;
      const status = formStateInputDTO?.status;
      const moduleUrl = this.$auth.getModuleName();

      if (status === 'OB') {
        this.tempFormObj = res?.obj;
        this.validationStateMgt(this.tempFormObj.formStateInputDTO)
          .then(() => {
            this.formId = this.tempFormObj.id;
            $("#esign_modal").modal("show");
          })
          .catch((e) => console.error(e));
      } else if (status === 'DR') {
        this.router.navigateByUrl(moduleUrl + `/draft`);
      } else if (status === 'SB') {
        this.$common.showMessage('Form submitted successfully!', 'success');
        this.router.navigateByUrl(moduleUrl + `/submitted`);
      }
    });
  }

  validationStateMgt(req) {
    return new Promise((resolve, reject) => {
      try {
        this.$formState.validationStateMgt(req).subscribe(
          (response) => {
            if (response.status === true) resolve(response);
          },
          (err) => { this.$common.hideLoader(); reject(err); }
        );
      } catch (error) {
        this.$common.hideLoader();
        reject(error);
      }
    });
  }
  // -------------------- Load Form --------------------
  getFormDetails() {
    this.$formManage?.getSingleForm();
    this.$formManage?.formDetail.subscribe((res) => {
      if (!res) return;
      this.formObj = res;

      if (this.formObj.refSupClaimId !== null && this.formObj.refSupClaimId !== undefined) {
        this.supplementryClaim = 'Supplementary ';
      }
      this.onSelectClaimTypeDefault();

      this.documentDtos = this.formObj?.formDocsDTOs || [];

      // this.formChildPilotageDTOs = this.formObj?.formChildPilotageDTOs || [];
      this.formChildPilotageDTOs = this.clearFormDTOIfSupplementry(
        this.formObj?.formChildPilotageDTOs,
        this.supplementryId
      );
      if (this.supplementryId) {
        // this.formObj.supClaimNo ="Supplementary "+ this.formObj?.claimNo;
        this.formObj.claimNo = null;
      }
      if (!this.selecteGrtList.some(s => s.shipName === this.formObj?.shipName)) {
        this.selecteGrtList.push({ shipName: this.formObj?.shipName });
      }

      this.getGrtNo();
    });
  }
  clearFormDTOIfSupplementry(formChildPilotageDTOs: any[], supplementryId: any): any[] {
    if (!supplementryId || !Array.isArray(formChildPilotageDTOs)) {
      return formChildPilotageDTOs;
    }
    return formChildPilotageDTOs.map(child => {
      return {
        ...child,
        id: null,
        formDTO: null   // 👈 formDTO empty kar diya
      };
    });
  }
  selecteClaimType: any = [
    { id: 'NO', descr: 'NO' },
    { id: 'CO', descr: 'CO' }
  ];

  onSelectClaimTypeDefault() {
    if (this.userIdDetails?.desigId == 'CO') {
      this.formObj.claimType = 'Commanding officer';
    } else if (this.userIdDetails?.desigId == 'NO') {
      this.formObj.claimType = 'Navigating officer';
    }
  }

  // -------------------- Master Loads --------------------
  getShipName() {
    try {
      this.$common.showLoader();
      const config = { headers: {} };
      this.$ship.get(config).subscribe(
        (response) => {
          this.$common.hideLoader();
          if (response.status === true) {
            const arr = response.object || [];
            this.selecteShipList = arr.filter(
              (item, index, array) => array.findIndex(obj => obj.unitGrtNo === item.unitGrtNo) === index
            );
          }
        },
        (err) => { this.$common.hideLoader(); console.log(err); }
      );
    } catch (e) {
      this.$common.hideLoader();
    }
  }

  getPortDetails() {
    try {
      this.$common.showLoader();
      this.config = { headers: { visibilityIndicator: '1' } };
      this.$port.get(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) this.portList = response.object || [];
        },
        (err) => { this.$common.hideLoader(); console.log(err); }
      );
    } catch (e) {
      this.$common.hideLoader();
    }
  }

  getRoleById() {
    try {
      this.$common.showLoader();
      const config = { headers: { id: this.userIdDetails?.roleId } };
      this.$user.rolesById(config).subscribe(
        (response) => {
          this.$common.hideLoader();
          if (response.status === true && (response.object?.length || 0) > 0) {
            if (response.object[0].aclCodeStatusDTO.statusId === 'DA') {
              this.$common.showMessage('You are not allowed to fill pilotage form as you are deactived creator', 'danger');
              const moduleUrl = this.$auth.getModuleName();
              this.router.navigateByUrl(moduleUrl + `/new`);
            }
          }
        },
        (err) => { this.$common.hideLoader(); console.log(err); }
      );
    } catch (e) {
      this.$common.hideLoader();
    }
  }

  // -------------------- GRT Change --------------------
  getGrtNo(grtNo?: any) {
    try {
      if (!grtNo && this.formObj?.unitGrtNo) grtNo = this.formObj.unitGrtNo;

      this.$common.showLoader();
      const config = { headers: { unitGrtNo: grtNo } };
      this.$ship.get(config).subscribe(
        (response) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.selecteGrtList = response.object || [];
            // Do NOT clear cached rate obj here; just recompute if context complete
            this.updatePortRateMaybe(); // recompute based on current fields
          }
        },
        (err) => { this.$common.hideLoader(); console.log(err); }
      );
    } catch (e) {
      this.$common.hideLoader();
    }
  }


  // -------------------- Add/Edit/Delete Pilotage rows --------------------
  addPilotage() {
    // 🚫 FINAL SAFETY CHECK
    if (this.isRateBlocked || Number(this.pilotageObj.portRate) === -1) {
      return this.$common.showMessage(
        'Entry cannot be added for this Port / Passage / Day-Night combination.',
        'danger'
      );
    }

    if (!(this.pilotageObj.amount > 0)) {
      return this.$common.showMessage('Amount must be greater than 0.', 'danger');
    }
    // --- helpers ---
    const norm = (v: any) => (v ?? '').toString().trim().toLowerCase();
    const normalizePassage = (val: any) => {
      const p = norm(val);
      if (p === 'in' || p === 'anchoring in') return 'in';
      if (p === 'out' || p === 'anchoring out') return 'out';
      return p; // 'sb' or others stay distinct
    };

    // --- validations ---
    const regex = /^([01][0-9]|2[0-3])[0-5][0-9]$/;
    const entryTime = Number(this.pilotageObj.entryTime) || 0;

    if (entryTime < 0 || entryTime > 2359) {
      return this.$common.showMessage(
        'Time of completion movement must be between 0000 and 2359 (24-hour format).',
        'danger'
      );
    }
    if (!regex.test(this.pilotageObj.entryTime)) {
      return this.$common.showMessage(
        'Time of completion movement must be in HHMM format (e.g., 1530 for 3:30 PM).',
        'danger'
      );
    }
    if (!(this.pilotageObj.amount > 0)) {
      return this.$common.showMessage('Amount should be greator than 0.', 'danger');
    }

    if (this.pilotageObj.movementTime === 'Night') {
      const operationTime = Number(this.pilotageObj.operationTime) || 0;
      if (operationTime < 0 || operationTime > 2359) {
        return this.$common.showMessage(
          'ENT/MNT Time must be between 0000 and 2359 (24-hour format).',
          'danger'
        );
      }
      if (!regex.test(this.pilotageObj.operationTime)) {
        return this.$common.showMessage(
          'ENT/MNT Time must be in HHMM format (e.g., 1530 for 3:30 PM).',
          'danger'
        );
      }
    }

    const mv = Number(this.pilotageObj.noOfSimilarMovement) || 0;
    if (mv < 0 || mv > 5) {
      return this.$common.showMessage(
        'Total number of similar movements for each entry must be between 0 and 5.',
        'danger'
      );
    }

    // --- duplicate check with grouped passage (works for add & edit; skips current index on edit) ---
    const curPort = norm(this.pilotageObj.portName);
    const curPassageGrouped = normalizePassage(this.pilotageObj.puaPassage);
    const curCount = mv;
    const isDuplicate = this.formChildPilotageDTOs.some((entry, idx) => {
      if (this.addIndex != null && idx === this.addIndex) return false; // skip self on edit
      return (
        norm(entry.portName) === curPort &&
        normalizePassage(entry.puaPassage) === curPassageGrouped &&
        (Number(entry.noOfSimilarMovement) || 0) === curCount
      );
    });

    if (isDuplicate) {
      return this.$common.showMessage(
        'An entry with the same Port Name, Passage (In/Anchoring In or Out/Anchoring Out), and Similar Movement Count already exists.',
        'danger'
      );
    }

    // --- proceed ---
    try {
      this.$common.showLoader();

      // NOTE: server ko original passage bhej rahe hain (grouped nahi),
      // kyunki server-side rules alag ho sakte hain.
      const config = {
        headers: {
          portName: this.pilotageObj.portName,
          puaPassage: this.pilotageObj.puaPassage,
          count: this.pilotageObj.noOfSimilarMovement,
          claimType: this.userIdDetails.desigId,
          unitId: this.userIdDetails.unitId,
          userId: this.userIdDetails.userId,
        },
      };

      this.$form.validatePortAndCount(config).subscribe(
        (response) => {
          this.$common.hideLoader();
          if (response.status === true) {
            const obj = { ...this.pilotageObj };
            if (this.addIndex == null) {
              this.formChildPilotageDTOs.push(obj);
            } else {
              this.formChildPilotageDTOs[this.addIndex] = obj;
            }

            this.formChildPilotageDTOs.sort(
              (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
            );

            this.resetPilotage();
          }
        },
        (err) => {
          this.$common.hideLoader();
          console.log(err);
        }
      );
    } catch (e) {
      this.$common.hideLoader();
    }
  }



  editPilotage(data, i) {

    this.isEditPilotage = true;
    this.pilotageObj = { ...data };
    this.portRate = Number(this.pilotageObj.portRate) || 0;
    this.initialPortRate = 0;
    this.isManualRateEntry = this.hasExistingRateValues();
    this.isRateBlocked = false;
    this.formObj.portName = this.pilotageObj.portName;

    if (this.pilotageObj?.entryDate) {
      this.pilotageObj.entryDate = this.datePipe.transform(this.pilotageObj.entryDate, 'yyyy-MM-dd');
    }
    this.addIndex = i;

    // recompute for current fields
    this.updatePortRateMaybe();
  }

  deletePilotage(i) {
    this.formChildPilotageDTOs.splice(i, 1);
  }

  resetPilotage() {
    this.pilotageForm.resetForm();
    this.addIndex = null;
    this.isEditPilotage = false;
    this.initialPortRate = 0;
    this.isManualRateEntry = false;
    this.isRateBlocked = false;
    this.portRate = 0;
    this.portRateObj = null;
  }

  // -------------------- Navigation/UI --------------------
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

  key: string = 'descr';
  reverse: boolean = false;
  sort(key) { this.key = key; this.reverse = !this.reverse; }

  isCertified: boolean = true;
  certified(event) { this.isCertified = !event.checked; }

  reset() {
    this.formObj = {};
    this.formChildPilotageDTOs = [];
    this.requiredForm.resetForm();
    this.pilotageForm.resetForm();
    this.isEditPilotage = false;
    this.currentCtxKey = null;
    this.inFlightCtxKey = null;
    this.portRateObj = null;
    this.portRate = 0;
    this.isManualRateEntry = false;
    this.getFormDetails();
  }

  private hasExistingRateValues(): boolean {
    return this.isEditPilotage && (
      (this.pilotageObj?.portRate !== null && this.pilotageObj?.portRate !== undefined) ||
      (this.pilotageObj?.amount !== null && this.pilotageObj?.amount !== undefined)
    );
  }

  private preserveExistingManualRateValues() {
    this.isRateBlocked = false;
    this.isManualRateEntry = true;
    this.portRate = Number(this.pilotageObj?.portRate) || 0;
    this.initialPortRate = 0;
  }

  // -------------------- Rate Fetching (Context-based) --------------------
  /**
   * Call this whenever any of the 3 context fields change:
   * - pilotageObj.portName
   * - formObj.unitGrtNo
   * - pilotageObj.entryDate
   */
  private updatePortRateMaybe() {
    const ctx = this.buildCtx();
    if (!ctx) return; // don't fetch until all present

    const ctxKey = this.keyOf(ctx);

    // If same context already applied, just recompute rate from cached object
    if (this.sameKey(this.currentCtxKey, ctxKey)) {
      if (this.portRateObj) this.setPortRate();
      return;
    }

    // If a fetch is already in-flight for same ctx, ignore
    if (this.sameKey(this.inFlightCtxKey, ctxKey)) return;

    // Trigger API fetch
    this.fetchPortRateForContext(ctx, ctxKey);
  }

  private fetchPortRateForContext(ctx: RateContext, ctxKey: string) {
    this.inFlightCtxKey = ctxKey;

    try {
      this.$common.showLoader();
      const headers = {
        bothParentChildId: ctx.portId,
        unitGrtNo: ctx.unitGrtNo,
        entryDate: String(ctx.entryDateTs),
      };
      this.$portRate.get({ headers }).subscribe(
        (response: any) => {
          this.$common.hideLoader();

          // If while we were fetching, user changed inputs -> ignore stale response
          if (!this.sameKey(this.inFlightCtxKey, ctxKey)) return;

          this.inFlightCtxKey = null;
          this.currentCtxKey = ctxKey;

          if (response?.status === true) {
            this.portRateList = response.object || [];

            if (this.portRateList.length > 1) {
              $('#portRateModal').modal('show');
              // Do NOT clear; user will pick -> onPortRateSelected will set & compute
            } else if (this.portRateList.length === 1) {
              this.portRateObj = this.portRateList[0];
              this.setPortRate(); // immediate compute
            } else {
              // No results for this valid context
              // Clear only now (since context is new & truly empty)
              if (this.hasExistingRateValues()) {
                this.preserveExistingManualRateValues();
                return;
              }
              this.portRateObj = null;
              this.portRate = 0;
              this.pilotageObj.portRate = null;
              this.pilotageObj.amount = null;
            }
          } else {
            // API said failure: don't keep stale obj for a NEW context
            if (this.hasExistingRateValues()) {
              this.preserveExistingManualRateValues();
              return;
            }
            this.portRateObj = null;
            this.portRate = 0;
            this.pilotageObj.portRate = null;
            this.pilotageObj.amount = null;
          }
        },
        (err) => {
          this.$common.hideLoader();

          // Network/error: treat as empty for this NEW context
          if (this.sameKey(this.inFlightCtxKey, ctxKey)) {
            this.inFlightCtxKey = null;
            this.currentCtxKey = ctxKey;
            if (this.hasExistingRateValues()) {
              this.preserveExistingManualRateValues();
              return;
            }
            this.portRateObj = null;
            this.portRate = 0;
            this.pilotageObj.portRate = null;
            this.pilotageObj.amount = null;
          }
        }
      );
    } catch (e) {
      this.$common.hideLoader();
      // also fail the context
      if (this.sameKey(this.inFlightCtxKey, ctxKey)) {
        this.inFlightCtxKey = null;
        this.currentCtxKey = ctxKey;
        if (this.hasExistingRateValues()) {
          this.preserveExistingManualRateValues();
          return;
        }
        this.portRateObj = null;
        this.portRate = 0;
        this.pilotageObj.portRate = null;
        this.pilotageObj.amount = null;
      }
    }
  }

  onPortRateSelected(selectedRate: any) {
    // user picked rate for current context
    this.portRateObj = selectedRate;
    this.setPortRate();
    $('#portRateModal').modal('hide');
  }

  // Compute portRate from cached object + current Day/Night + Passage
  private setPortRate() {
    if (!this.pilotageObj?.puaPassage || !this.pilotageObj?.movementTime || !this.portRateObj) return;

    const passage = String(this.pilotageObj.puaPassage).toLowerCase();
    const tod = String(this.pilotageObj.movementTime).toLowerCase();

    let newRate: number | null = null;
    const existingPortRate = Number(this.pilotageObj?.portRate);
    const hasExistingValues = this.hasExistingRateValues();

    if (['in', 'out', 'anchoring in', 'anchoring out'].includes(passage)) {
      newRate = (tod === 'day')
        ? this.portRateObj.inOutDayAmount
        : this.portRateObj.inOutNightAmount;
    } else if (passage === 'sb') {
      newRate = (tod === 'day')
        ? this.portRateObj.shiftingDayAmount
        : this.portRateObj.shiftingNightAmount;
    }
    if (hasExistingValues && (newRate === null || newRate === -1 || existingPortRate !== Number(newRate))) {
      this.preserveExistingManualRateValues();
      return;
    }
    // 🚫 BLOCK WHEN RATE = -1
    if (newRate === -1) {
      this.isRateBlocked = true;
      this.isManualRateEntry = false;
      this.pilotageObj.portRate = -1;
      this.portRate = -1;
      this.pilotageObj.amount = null;

      this.$common.showMessage(
        'This Port / Passage / Day-Night combination is not allowed.',
        'danger'
      );
      return;
    }

    // ✅ VALID RATE
    this.isRateBlocked = false;
    this.isManualRateEntry = false;

    if (newRate != null) {
      this.pilotageObj.portRate = newRate;
      this.portRate = newRate;
      this.initialPortRate = Number(newRate) || 0;
      if (!(hasExistingValues && existingPortRate === Number(newRate))) {
        this.pilotageObj.amount = null;
      }
    }
  }

  // -------------------- Field change handlers --------------------
  // Template calls these three when value changes:
  // (ngModelChange) on portName, unitGrtNo (via getGrtNo), entryDate input.
  getPortRate(portName: string, shipGrtNo: string, eventDate: string) {
    // Keep the signature the same as your template call, but delegate to updatePortRateMaybe()
    this.updatePortRateMaybe();
  }

  onMovementTimeChange(selectedTime: string): void {
    if (selectedTime !== 'Night') {
      this.pilotageObj.operationType = null;
      this.pilotageObj.operationTime = null;
    }
    this.pilotageObj.movementTime = selectedTime;
    this.setPortRate();
  }

  onInOutChange(selectedInput: string) {
    this.pilotageObj.puaPassage = selectedInput;
    this.setPortRate();
  }

  checkAmountIsValid(amount) {
    const amountNum = parseFloat(String(amount));
    const portRateNum = parseFloat(String(this.pilotageObj?.portRate));

    // keep the runtime cache aligned with current field value
    this.portRate = isNaN(portRateNum) ? 0 : portRateNum;

    if (isNaN(amountNum) || isNaN(portRateNum) || portRateNum === 0) return; // admin allowed 0 => skip

    if (amountNum > portRateNum) {
      this.pilotageObj.amount = null;
      this.$common.showMessage('Amount cannot exceed the amount allowed by the system admin', 'danger');
    }
  }
}
