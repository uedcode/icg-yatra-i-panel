import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-change-status-staging-modal',
    templateUrl: './change-status-staging-modal.component.html',
    styleUrls: ['./change-status-staging-modal.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ChangeStatusStagingModalComponent implements OnInit {

  constructor() { }
  @Input() changeData;
  @Output() changeStatusConfirmed = new EventEmitter();

  ngOnInit() {
  }

  changeConfirm() {
    this.changeStatusConfirmed.emit(this.changeData);
  }

}
