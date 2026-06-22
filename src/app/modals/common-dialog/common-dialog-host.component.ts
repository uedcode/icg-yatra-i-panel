import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonDialogService, CommonDialogState } from 'src/app/service/core/common-dialog.service';

@Component({
  selector: 'app-common-dialog-host',
  templateUrl: './common-dialog-host.component.html',
  styleUrls: ['./common-dialog-host.component.scss'],
  standalone: false,
})
export class CommonDialogHostComponent implements OnInit, OnDestroy {
  dialog: CommonDialogState | null = null;
  private subscription: Subscription | null = null;

  constructor(private dialogService: CommonDialogService) {}

  ngOnInit(): void {
    this.subscription = this.dialogService.state$.subscribe((dialog) => {
      this.dialog = dialog;
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  confirm(): void {
    this.dialogService.resolve(true);
  }

  cancel(): void {
    this.dialogService.resolve(false);
  }

  get iconClass(): string {
    if (!this.dialog) {
      return '';
    }

    if (this.dialog.type === 'delete' || this.dialog.type === 'danger') {
      return 'fa fa-trash';
    }
    if (this.dialog.type === 'success') {
      return 'fa fa-check-circle';
    }
    if (this.dialog.type === 'warning') {
      return 'fa fa-exclamation-triangle';
    }
    return 'fa fa-info-circle';
  }
}
