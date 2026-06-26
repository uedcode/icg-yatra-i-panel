import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-web-detail',
    templateUrl: './web-detail.component.html',
    styleUrls: ['./web-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class WebDetailComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
