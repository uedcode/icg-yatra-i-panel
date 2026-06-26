import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-system-admin',
    templateUrl: './system-admin.component.html',
    styleUrls: ['./system-admin.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class SystemAdminComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
