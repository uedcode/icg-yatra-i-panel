import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-common-contact-detail-modal',
    templateUrl: './common-contact-detail-modal.component.html',
    styleUrls: ['./common-contact-detail-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CommonContactDetailModalComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
