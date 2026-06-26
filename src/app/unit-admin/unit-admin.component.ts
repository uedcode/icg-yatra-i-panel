import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-unit-admin',
    templateUrl: './unit-admin.component.html',
    styleUrls: ['./unit-admin.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class UnitAdminComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
