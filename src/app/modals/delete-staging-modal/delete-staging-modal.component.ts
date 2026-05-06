import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-delete-staging-modal',
    templateUrl: './delete-staging-modal.component.html',
    styleUrls: ['./delete-staging-modal.component.css'],
    standalone: false
})
export class DeleteStagingModalComponent implements OnInit {

  constructor() { }
  @Input() changeData;
  @Output() changeStatusConfirmed = new EventEmitter();

  ngOnInit() {
  }

  changeConfirm() {
    this.changeStatusConfirmed.emit(this.changeData);
  }

}
