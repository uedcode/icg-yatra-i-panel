import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ESignFlowService } from 'src/app/service/core/esign-flow.service';
declare var $: any;

@Component({
    selector: 'app-common-esign-modal',
    templateUrl: './common-esign-modal.component.html',
    styleUrls: ['./common-esign-modal.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CommonEsignModalComponent implements OnInit, OnChanges, OnDestroy {
  private prepareSubscription?: Subscription;
  private performSubscription?: Subscription;

  constructor(
    public $auth: AuthService,
    private eSignFlow: ESignFlowService,
  ) { }

  @Input() tempFormObj: any;
  userIdDetails;
  documentList: any = [];
  isAgree: boolean = false;
  prepareMessage = '';
  isPreparing = false;
  isPerforming = false;

  ngOnInit() {
    this.userIdDetails = this.$auth.getUserDetails();
  }

  prepareForESign() {
    this.resetConsentState();
    this.isPreparing = true;
    this.prepareSubscription?.unsubscribe();
    this.prepareSubscription = this.eSignFlow.start(this.tempFormObj).subscribe((prepared) => {
      this.isPreparing = false;
      if (!prepared) {
        return;
      }

      this.tempFormObj = prepared.context;
      this.prepareMessage = prepared.message;
      this.documentList = prepared.documents;
      if (typeof $ !== 'undefined') {
        $('#esign_modal').modal('show');
      }
    });
  }

  performESign() {
    if (!this.isAgree || this.isPerforming) {
      return;
    }

    this.isPerforming = true;
    this.performSubscription?.unsubscribe();
    this.performSubscription = this.eSignFlow.perform(this.tempFormObj, this.documentList).subscribe((isStarted) => {
      this.isPerforming = false;
      if (isStarted && typeof $ !== 'undefined') {
        $('#esign_modal').modal('hide');
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes) return;
    if (changes.tempFormObj && changes.tempFormObj.currentValue) {
      this.tempFormObj = changes.tempFormObj.currentValue;
      if (this.tempFormObj?.id || this.tempFormObj?.claimId) {
        this.prepareForESign();
      }
    }
  }

  private resetConsentState(): void {
    this.isAgree = false;
    this.documentList = [];
    this.prepareMessage = '';
  }

  ngOnDestroy(): void {
    this.prepareSubscription?.unsubscribe();
    this.performSubscription?.unsubscribe();
  }

}

