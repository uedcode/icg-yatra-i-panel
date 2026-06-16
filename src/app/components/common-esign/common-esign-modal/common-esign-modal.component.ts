import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';
import { EsignService } from 'src/app/service/admin/esign.service';
import { environment } from 'src/environments/environment';
declare var $: any;

@Component({
    selector: 'app-common-esign-modal',
    templateUrl: './common-esign-modal.component.html',
    styleUrls: ['./common-esign-modal.component.css'],
    standalone: false
})
export class CommonEsignModalComponent implements OnInit {
  private readonly gatewayStorageKey = environment.esignConfig.gatewayStorageKey;
  private readonly redirectStorageKey = environment.esignConfig.redirectStorageKey;

  constructor(
    private router: Router,
    private $common: CommonService,
    private $esign: EsignService,
    public $auth: AuthService,
  ) { }

  @Input() tempFormObj: any;
  fileUrl = environment.fileUrl;
  userIdDetails;
  documentList: any = [];
  isAgree: boolean = false;

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
    // this.prepareForESign();
  }

  private buildESignRequest(eSignTransDocDTOs?: any[]) {
    return {
      "claimId": this.tempFormObj?.claimId ?? this.tempFormObj?.id,
      "roleTypeId": this.tempFormObj?.roleTypeId ?? this.userIdDetails?.roleTypeId,
      "desigId": this.userIdDetails?.desigId,
      "userId": this.tempFormObj?.userId ?? this.userIdDetails?.userId,
      "status": this.tempFormObj?.status ?? "OB",
      "remark": this.tempFormObj?.remark ?? this.tempFormObj?.formRemarks,
      "financialYear": this.tempFormObj?.financialYear ?? this.userIdDetails?.financialYear,
      "moduleId": this.tempFormObj?.moduleId ?? this.userIdDetails?.moduleId,
      "redPercent": this.tempFormObj?.redPercent,
      "redAmount": this.tempFormObj?.redAmount,
      "redRemarks": this.tempFormObj?.redRemarks,
      "unitId": this.userIdDetails?.unitId,
      "formId": this.tempFormObj?.formId ?? this.tempFormObj?.id,
      "recommendedAmount": this.tempFormObj?.recommendedAmount,
      "allotedBudget": this.tempFormObj?.allotedBudget,
      "balanceAmt": this.tempFormObj?.balanceAmount,
      "progressiveExpenditureAmt": this.tempFormObj?.progressiveExpenditureAmt,
      "balance": this.tempFormObj?.balance,
      ...(eSignTransDocDTOs ? { "eSignTransDocDTOs": eSignTransDocDTOs } : {}),
    };
  }

  prepareForESign() {
    this.$common.showLoader();
    try {
      let req = this.buildESignRequest();

      this.$esign.prepareForESign(req).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            this.documentList = response?.object;
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

  performESign() {
    this.$common.showLoader();
    try {
      let req = {
        ...this.buildESignRequest(this.documentList),
        "codeFormId": "",
        "name": this.userIdDetails?.personName,
      }
      
      this.$esign.performESign(req).subscribe(
        (response: any) => {
          this.$common.hideLoader();
          if (response.status === true) {
            $("#esign_modal").modal("hide");
            let moduleUrl = this.$auth.getModuleName();
            if (response?.object) {
              localStorage.setItem(this.gatewayStorageKey, response?.object);
              localStorage.setItem(
                this.redirectStorageKey,
                this.router.url || (moduleUrl ? `${moduleUrl}/dashboard` : '/login')
              );
              this.router.navigateByUrl(moduleUrl + `/esign`);
            }
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

  ngOnChanges(changes: SimpleChanges) {
    if (!changes) return;
    if (changes.tempFormObj && changes.tempFormObj.currentValue) {
      this.tempFormObj = changes.tempFormObj.currentValue;
      if (this.tempFormObj?.id) {
        this.prepareForESign();
      }
    }
  }

  handleIsCheck() {
    this.isAgree = !this.isAgree;
  }

}

