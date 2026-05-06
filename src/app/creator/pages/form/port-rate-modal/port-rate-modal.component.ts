import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';


@Component({
    selector: 'app-port-rate-modal',
    templateUrl: './port-rate-modal.component.html',
    styleUrls: ['./port-rate-modal.component.css'],
    standalone: false
})
export class PortRateModalComponent implements OnInit {

  constructor() { }
  ngOnInit() {
  }

  actionMsg;
  @Input() changeData;
  @Input() portRateList: any;
  @Output() selectedPortRate = new EventEmitter<any>();


  portRateObj: any;
  selectPilotageRate(dataObj: any) {
    
    this.portRateObj = dataObj;
    this.selectedPortRate.emit(this.portRateObj); // Emit the selected object
  }


  ngOnChanges(changes: SimpleChanges) {
    if (!changes) return;
    if (changes.changeData && changes.changeData.currentValue) {
      this.changeData = changes.changeData.currentValue;
    }
  }

}