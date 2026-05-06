import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-view-error-modal',
    templateUrl: './view-error-modal.component.html',
    styleUrls: ['./view-error-modal.component.scss'],
    standalone: false
})
export class ViewErrorModalComponent implements OnInit {

  constructor() { }

  @Input() errorMessage;

  ngOnInit() {
  }

}
