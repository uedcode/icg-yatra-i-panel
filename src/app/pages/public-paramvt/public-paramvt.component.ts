import { Component } from '@angular/core';

@Component({
  selector: 'app-public-paramvt',
  templateUrl: './public-paramvt.component.html',
  styleUrls: ['./public-paramvt.component.scss'],
})
export class PublicParamvtComponent {
  readonly videos = [
    { title: 'Advance ICG Modules', file: 'adv-icg.mp4' },
    { title: 'Advance CDA Module', file: 'adv-cda.mp4' },
    { title: 'Claim ICG Module', file: 'clm-icg.mp4' },
    { title: 'Claim CDA Module', file: 'clm-cda.mp4' },
    { title: 'System Admin ICG Module', file: 'sys-icg.mp4' },
    { title: 'System Admin CDA Module', file: 'sys-icg.mp4' },
  ];
}

