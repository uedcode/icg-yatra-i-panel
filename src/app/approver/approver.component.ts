import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-approver',
    templateUrl: './approver.component.html',
    styleUrls: ['./approver.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ApproverComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
