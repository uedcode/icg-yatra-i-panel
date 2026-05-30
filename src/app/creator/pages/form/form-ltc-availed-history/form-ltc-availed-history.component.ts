import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { ClaimService } from 'src/app/service/claim.service';
import { CommonService } from 'src/app/service/common.service';

@Component({
  selector: 'app-form-ltc-availed-history',
  templateUrl: './form-ltc-availed-history.component.html',
  styleUrls: ['./form-ltc-availed-history.component.scss'],
  standalone: false,
})
export class FormLtcAvailedHistoryComponent implements OnInit {
  claimId = '';
  disableBtn = false;
  userIdDetails: any;
  unitId = '';

  list: any[] = [];
  entitledData: any = null;

  tempRow: any = {
    year: '',
    ltcType: '',
    ltcSubType: '',
    frmLocation: '',
    toLocation: '',
    reason: '',
    occDate: '',
    availed: 1,
  };

  constructor(
    private $auth: AuthService,
    private $claim: ClaimService,
    private $common: CommonService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    this.unitId = this.userIdDetails?.unitId || '';
    this.route.queryParamMap.subscribe((params) => {
      this.claimId = params.get('id') || '';
      this.loadData();
      this.loadEntitledHistory();
    });
  }

  private loadData() {
    const config = {
      headers: {
        claimId: this.claimId || '',
        userId: this.userIdDetails?.userId || '',
        isFetch: '1',
      },
    };
    this.$common.showLoader();
    this.$claim.getLtcAvailedHistory(config).subscribe(
      (res: any) => {
        this.$common.hideLoader();
        if (res?.status && Array.isArray(res.object) && res.object.length) {
          const obj = res.object[0];
          this.claimId = obj?.claimId || this.claimId;
          this.list = this.flattenTransferToRows(obj);
        } else {
          this.list = [];
        }
      },
      (err) => {
        this.$common.hideLoader();
        console.log(err);
      }
    );
  }

  private loadEntitledHistory() {
    const config = {
      headers: {
        userId: this.userIdDetails?.userId || '',
        unitId: this.unitId || '',
      },
    };
    this.$claim.getLtcAvailedEntitledHistory(config).subscribe(
      (res: any) => {
        if (res?.status) {
          this.entitledData = res?.object || null;
        }
      },
      (err) => console.log(err)
    );
  }

  private flattenTransferToRows(transfer: any): any[] {
    const keys = [
      'hometownSelfLTCList',
      'hometownSingleLTCList',
      'hometownPartialLTCList',
      'allindiaSelfLTCList',
      'allindiaSingleLTCList',
      'allindiaPartialLTCList',
      'specialplaceSelfLTCList',
      'specialplaceSingleLTCList',
      'specialplacePartialLTCList',
      'additionalLTC',
      'ESPLTCList',
      'AFSPLTCList',
    ];
    const out: any[] = [];
    keys.forEach((k) => {
      const rows = Array.isArray(transfer?.[k]) ? transfer[k] : [];
      rows.forEach((r: any) => out.push({ ...r, _bucket: k }));
    });
    return out;
  }

  addRow() {
    if (!this.tempRow.year || !this.tempRow.ltcType || !this.tempRow.occDate) {
      this.$common.showMessage('Year, LTC Type and Occurrence Date are required.', 'danger');
      return;
    }
    const row = {
      ...this.tempRow,
      ltcAvailedHistId: this.tempRow.ltcAvailedHistId || '',
      occDate: Number(this.tempRow.occDate),
      _bucket: this.tempRow._bucket || 'hometownSelfLTCList',
    };
    this.list.push(row);
    this.tempRow = {
      year: '',
      ltcType: '',
      ltcSubType: '',
      frmLocation: '',
      toLocation: '',
      reason: '',
      occDate: '',
      availed: 1,
    };
  }

  editRow(index: number) {
    const row = this.list[index];
    this.tempRow = {
      ...row,
      occDate: row?.occDate ? String(row.occDate) : '',
    };
    this.list.splice(index, 1);
  }

  deleteRow(index: number) {
    this.list.splice(index, 1);
  }

  private buildTransferPayload() {
    const buckets: any = {
      hometownSelfLTCList: [],
      hometownSingleLTCList: [],
      hometownPartialLTCList: [],
      allindiaSelfLTCList: [],
      allindiaSingleLTCList: [],
      allindiaPartialLTCList: [],
      specialplaceSelfLTCList: [],
      specialplaceSingleLTCList: [],
      specialplacePartialLTCList: [],
      additionalLTC: [],
      ESPLTCList: [],
      AFSPLTCList: [],
    };

    this.list.forEach((row) => {
      const key = row._bucket || 'hometownSelfLTCList';
      if (!buckets[key]) buckets[key] = [];
      const clean = { ...row };
      delete clean._bucket;
      buckets[key].push(clean);
    });

    return {
      claimId: this.claimId || '',
      ...buckets,
    };
  }

  save() {
    const payload = this.buildTransferPayload();
    this.disableBtn = true;
    this.$common.showLoader();
    this.$claim.createOrUpdateLtcAvailedHistory(payload).subscribe(
      (res: any) => {
        this.$common.hideLoader();
        this.disableBtn = false;
        if (res?.status) {
          const obj = res?.object || {};
          this.claimId = obj?.claimId || this.claimId;
          this.$common.showMessage(res?.message || 'LTC availed history saved successfully.');
          this.loadData();
        }
      },
      (err) => {
        this.$common.hideLoader();
        this.disableBtn = false;
        console.log(err);
      }
    );
  }

  openPreview() {
    if (!this.claimId) {
      this.$common.showMessage('Please save LTC availed history first.', 'danger');
      return;
    }
    this.router.navigate([`${this.$auth.getModuleName()}/form-ltc-availed-history-detail`], {
      queryParams: { id: this.claimId },
    });
  }
}


