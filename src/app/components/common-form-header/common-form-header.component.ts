import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-common-form-header',
  templateUrl: './common-form-header.component.html',
  standalone: false,
})
export class CommonFormHeaderComponent {
  @Input() pageTitle = '';
  @Input() homeLabel = 'Yatra';
  @Input() homeLink: any[] | string | null = ['../dashboard'];
  @Input() sectionLabel = '';
  @Input() sectionLink: any[] | string | null = null;
}
