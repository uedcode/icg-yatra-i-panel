import { DatePipe, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { ClaimService } from 'src/app/service/claim.service';
import { CommonService } from 'src/app/service/common.service';

@Component({
  selector: 'app-form-pmt-detail',
  templateUrl: './form-pmt-detail.component.html',
  styleUrls: ['./form-pmt-detail.component.css'],
  standalone: false,
})
export class FormPmtDetailComponent implements OnInit {
  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private $common: CommonService,
    public $auth: AuthService,
    private $claim: ClaimService
  ) {}

  formObj: any = {};
  claimId: string | null = null;
  documentDtos: any[] = [];
  today: string | null = null;

  ngOnInit() {
    this.today = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    this.route.queryParams.subscribe((params) => {
      this.claimId = params?.claimId || null;
      this.getClaimDetails();
    });
  }

  getClaimDetails() {
    if (!this.claimId) {
      this.$common.showMessage('Missing claim id for PMT preview.', 'danger');
      return;
    }

    const config = {
      headers: {
        claimId: this.claimId,
        subFormId: 'P',
        isPreview: 'true',
      },
    };

    this.$common.showLoader();
    this.$claim.getSingleClaim(config).subscribe({
      next: (response: any) => {
        this.$common.hideLoader();
        if (response?.status !== true) {
          this.$common.showMessage(
            response?.message || 'Unable to load PMT preview.',
            'danger'
          );
          return;
        }

        const obj = Array.isArray(response?.object)
          ? response.object[0]
          : response?.object;
        this.formObj = obj || {};
        this.documentDtos = this.formObj?.yatDocsDTOs || [];
      },
      error: (err) => {
        this.$common.hideLoader();
        console.error(err);
        this.$common.showMessage('Error while loading PMT preview.', 'danger');
      },
    });
  }

  asDate(value: any) {
    if (!value) return null;
    const num = Number(value);
    return Number.isNaN(num)
      ? value
      : this.datePipe.transform(new Date(num), 'yyyy-MM-dd');
  }

  goBack() {
    this.location.back();
  }
}
