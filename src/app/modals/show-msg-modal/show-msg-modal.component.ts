import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-show-msg-modal',
    templateUrl: './show-msg-modal.component.html',
    styleUrls: ['./show-msg-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ShowMsgModalComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  
  @Input() alertMessage;
}
