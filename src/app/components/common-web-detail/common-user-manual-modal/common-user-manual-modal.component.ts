import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-common-user-manual-modal',
    templateUrl: './common-user-manual-modal.component.html',
    styleUrls: ['./common-user-manual-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CommonUserManualModalComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
