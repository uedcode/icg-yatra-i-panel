import { Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  ApproverActionRemarkModalConfig,
  ApproverActionRemarkModalService,
} from 'src/app/service/core/approver-action-remark-modal.service';
import { CommonService } from 'src/app/service/core/common.service';

declare var $: any;

@Component({
  selector: 'app-approver-action-remark-modal',
  templateUrl: './approver-action-remark-modal.component.html',
  styleUrls: ['./approver-action-remark-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class ApproverActionRemarkModalComponent implements OnInit, OnDestroy {
  config: ApproverActionRemarkModalConfig | null = null;
  remark = '';
  confirmCheckOne = false;
  confirmCheckTwo = false;

  private resolveCurrent: ((remark: string | null) => void) | null = null;
  private sub?: Subscription;

  constructor(
    private modalService: ApproverActionRemarkModalService,
    private $common: CommonService
  ) {}

  ngOnInit(): void {
    this.sub = this.modalService.requests$.subscribe((request) => {
      this.config = request.config;
      this.remark = request.config.remark || '';
      this.confirmCheckOne = false;
      this.confirmCheckTwo = false;
      this.resolveCurrent = request.resolve;
      setTimeout(() => $('#approverActionRemarkModal').modal('show'), 0);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get shouldRequireForwardDeclarations(): boolean {
    return !!this.config?.requireForwardDeclarations;
  }

  get hasDteBalance(): boolean {
    const value = this.config?.dteBalance;
    return value !== null && value !== undefined && String(value).trim() !== '' && String(value).trim() !== '0';
  }

  get canSubmit(): boolean {
    return !this.shouldRequireForwardDeclarations || (this.confirmCheckOne && this.confirmCheckTwo);
  }

  submit(): void {
    const remark = (this.remark || '').trim();
    if (!remark) {
      this.$common.showMessage('Remarks are required', 'danger');
      return;
    }
    this.finish(remark);
  }

  cancel(): void {
    this.finish(null);
  }

  private finish(remark: string | null): void {
    const resolver = this.resolveCurrent;
    this.resolveCurrent = null;
    $('#approverActionRemarkModal').modal('hide');
    resolver?.(remark);
  }
}
