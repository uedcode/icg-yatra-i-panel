import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-common-new-device',
    templateUrl: './common-new-device.component.html',
    styleUrls: ['./common-new-device.component.scss'],
    standalone: false
})
export class CommonNewDeviceComponent implements OnInit {

  constructor() { }
  formObj: any = {};
  ngOnInit() {
  }
  submit(){
    
  }
}
