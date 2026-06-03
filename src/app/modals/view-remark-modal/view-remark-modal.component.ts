import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { CommonService } from 'src/app/service/core/common.service';

@Component({
    selector: 'app-view-remark-modal',
    templateUrl: './view-remark-modal.component.html',
    styleUrls: ['./view-remark-modal.component.scss'],
    standalone: false
})
export class ViewRemarkModalComponent implements OnInit {

  constructor(public $common: CommonService) { }

  ngOnInit() {
  }

  @Input() changeData;
  @Input() innerHtml;
  @Input() remarkModalTitle;
  remark;

  ngOnChanges(changes: SimpleChanges) {
    if (!changes) return;
    if (changes.changeData) {
      let remark = changes.changeData.currentValue;
      if (remark) {
        this.remark = remark;
      }
    }
  }
}

