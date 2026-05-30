import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-change-status-modal',
    templateUrl: './change-status-modal.component.html',
    styleUrls: ['./change-status-modal.component.css'],
    standalone: false
})
export class ChangeStatusModalComponent implements OnInit {

  constructor() { }
  ngOnInit() {
  }

  actionMsg;
  @Input() changeData;
  @Output() changeStatusConfirmed = new EventEmitter();

  changeConfirm() {
    this.changeStatusConfirmed.emit(this.changeData);
  }


  ngOnChanges(changes: SimpleChanges) {
    if (!changes) return;
    if (changes.changeData && changes.changeData.currentValue) {
      this.changeData = changes.changeData.currentValue;
      let statusId = this.changeData?.currentStatus;
      this.actionMsg = "Are you sure to make Changes?";
      if (statusId == 'AP') {
        this.actionMsg = "Are you sure want to approve this request?";
      } else if (statusId == 'RJ') {
        this.actionMsg = "Are you sure want to reject this request?";
      } else if (statusId == 'PRO') {
        this.actionMsg = "Are you sure want to move this request inprocess?";
      } else if (statusId == 'CA') {
        this.actionMsg = "Are you sure want to request for cancel?";
      } else if (statusId == 'AC') {
        this.actionMsg = "Are you sure want to enable it?";
      } else if (statusId == 'DA') {
        this.actionMsg = "Are you sure want to disable it?";
      }
    }
  }

}
