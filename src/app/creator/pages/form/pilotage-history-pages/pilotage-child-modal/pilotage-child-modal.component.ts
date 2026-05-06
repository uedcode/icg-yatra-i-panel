import { Component, Input, OnInit,  SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-pilotage-child-modal',
    templateUrl: './pilotage-child-modal.component.html',
    styleUrls: ['./pilotage-child-modal.component.css'],
    standalone: false
})
export class PilotageChildModalComponent implements OnInit {

  @Input() pilotageHistoryChildDTOs: any[] = []; // Or use the proper type

  constructor() { }

  parsedData: any; // To store the parsed data
  id: any;
  pageType: any;
  searchObj: any;
  config: any;
  formObj: any = {};
  noOfPage: any = 10;
  p: any = 1;
  tempObj;
  subFormId;

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    
      if (!changes) return;
      if (changes.pilotageHistoryChildDTOs && changes.pilotageHistoryChildDTOs.currentValue) {
        this.pilotageHistoryChildDTOs = changes.pilotageHistoryChildDTOs.currentValue;
      }
    }

  // data shorting start
  key: string = 'descr';
  reverse: boolean = false;
  sort(key) {
    this.key = key;
    this.reverse = !this.reverse;
  }
}

