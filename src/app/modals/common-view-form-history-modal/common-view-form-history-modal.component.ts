import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';
import { environment } from 'src/environments/environment';
import { FormStateApiService } from 'src/app/service/api/form/form-state-api.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { AuthService } from 'src/app/service/auth/auth.service';

declare var $: any;

@Component({
  selector: 'app-common-view-form-history-modal',
  templateUrl: './common-view-form-history-modal.component.html',
  styleUrls: ['./common-view-form-history-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class CommonViewFormHistoryModalComponent implements OnInit {

   constructor(
    private $common: CommonService,
    private $formState: FormStateApiService,
    private $claimApi: ClaimApiService,
    private $auth: AuthService
  ) { }

  @Input() stateList: Array<any> = [];
  @Input() formId: any;
  @Input() claimId: any;
  id: any;
  dataObj: any = {};
  noOfPage: any = 10;
  pageType: any;
  p = 1;
  searchObj;
  fileUrl = environment.fileUrl;
  page = 1;
  currentPageBulk = 1;
  ngOnInit() {
    $('#selected_files').on('hidden.bs.modal', () => {
      this.currentPageBulk = 1;
    });
    this.getAll();
  }
  config: any;
  getAll() {

    try {
      if (!this.formId && !this.claimId) {
        this.stateList = [];
        return;
      }

      this.$common.showLoader();
      if (this.claimId) {
        this.config = {
          headers: {
            claimId: this.claimId,
          },
        };
        this.$claimApi.getClaimHistory(this.config).subscribe(
          (response: any) => {
            this.$common.hideLoader();
            this.stateList = response?.status === true && Array.isArray(response?.object)
              ? response.object
              : [];
          },
          (err) => {
            this.$common.hideLoader();
            console.log(err);
          }
        );
        return;
      }

      this.config = {
        headers: { formId: this.formId },
      };
      this.$formState.getHistory(this.config).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.stateList = response.object;
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

  // data shorting start
  key: string = 'createdOn';
  reverse: boolean = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes) return;

    if (changes.formId && !changes.formId.currentValue && !this.claimId) {
      this.stateList = [];
      return;
    }

    if (changes.claimId && !changes.claimId.currentValue && !this.formId) {
      this.stateList = [];
      return;
    }

    if (
      (changes.formId && changes.formId.currentValue !== changes.formId.previousValue) ||
      (changes.claimId && changes.claimId.currentValue !== changes.claimId.previousValue)
    ) {
      this.p = 1;
      this.getAll();
    }
  }

  isClaimHistoryMode(): boolean {
    return !!this.claimId;
  }

  openClaimHistoryItem(row: any): void {
    const targetUrl = this.resolveClaimHistoryUrl(row);
    if (!targetUrl) {
      return;
    }
    window.open(targetUrl, '_blank');
  }

  private resolveClaimHistoryUrl(row: any): string | null {
    const userDetails = this.$auth.getUserDetails();
    const roleCodes = this.$auth.codeRoleType();
    const roleTypeId = userDetails?.roleTypeId;

    if (
      roleTypeId === roleCodes?.verifier ||
      roleTypeId === roleCodes?.verifier1 ||
      roleTypeId === roleCodes?.verifier2 ||
      roleTypeId === roleCodes?.approver
    ) {
      return this.$auth.getApproverPreviewUrl(row);
    }

    const moduleUrl = this.$auth.getModuleName();
    const viewUrl = String(row?.codeSubFormDTO?.viewUrl || '').replace(/^\/+/, '');
    const claimId = row?.claimId;
    if (!moduleUrl || !viewUrl || !claimId) {
      return null;
    }
    return `${moduleUrl}/${viewUrl}?id=${encodeURIComponent(String(claimId))}`;
  }
  // data shorting end
}


