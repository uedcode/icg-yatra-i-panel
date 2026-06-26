import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-change-batch-status',
    templateUrl: './change-batch-status.component.html',
    styleUrls: ['./change-batch-status.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ChangeBatchStatusComponent implements OnInit {

  constructor() { }
  actionMsg;
  @Input() changeData;
  @Output() changeStatusConfirmed = new EventEmitter();

  ngOnInit() {
  }

  changeConfirm() {
    this.changeStatusConfirmed.emit(this.changeData);
  }

}
