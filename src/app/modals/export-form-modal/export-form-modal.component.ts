import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-export-form-modal',
    templateUrl: './export-form-modal.component.html',
    styleUrls: ['./export-form-modal.component.scss'],
    standalone: false
})
export class ExportFormModalComponent implements OnInit {

  constructor() { }
  exportType;
  @Input() changeData;
  @Output() changeStatusConfirmed = new EventEmitter();

  ngOnInit() {
  }

  changeConfirm() {
    this.changeStatusConfirmed.emit(this.changeData);
  }

}
