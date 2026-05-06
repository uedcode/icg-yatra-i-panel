import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-show-msg-modal',
    templateUrl: './show-msg-modal.component.html',
    styleUrls: ['./show-msg-modal.component.scss'],
    standalone: false
})
export class ShowMsgModalComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  
  @Input() alertMessage;
}
