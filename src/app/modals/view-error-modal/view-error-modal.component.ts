import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-view-error-modal',
    templateUrl: './view-error-modal.component.html',
    styleUrls: ['./view-error-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ViewErrorModalComponent implements OnInit {

  constructor() { }

  @Input() errorMessage;

  ngOnInit() {
  }

}
