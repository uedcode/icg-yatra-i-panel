import { DatePipe, Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormClaimDetailComponent } from '../../detail/form-claim-detail.component';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { ClaimStateApiService } from 'src/app/service/api/claim/claim-state-api.service';
import { AuthService } from 'src/app/service/auth/auth.service';
import { CommonService } from 'src/app/service/core/common.service';

@Component({
  selector: 'app-form-pmt-duty-claim',
  templateUrl: '../../detail/form-claim-detail.component.html',
  styleUrls: ['../../detail/form-claim-detail.component.css'],
  standalone: false,
})
export class FormPmtDutyClaimComponent extends FormClaimDetailComponent {
  constructor(
    route: ActivatedRoute,
    router: Router,
    location: Location,
    datePipe: DatePipe,
    $auth: AuthService,
    $claimApi: ClaimApiService,
    $claimStateApi: ClaimStateApiService,
    $common: CommonService
  ) {
    super(route, router, location, datePipe, $auth, $claimApi, $claimStateApi, $common);
  }
}
