import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClaimService } from 'src/app/service/claim/claim.service';
import { CommonService } from 'src/app/service/core/common.service';

@Component({
  selector: 'app-form-pay-details-detail',
  templateUrl: './form-pay-details-detail.component.html',
  styleUrls: ['./form-pay-details-detail.component.scss'],
  standalone: false,
})
export class FormPayDetailsDetailComponent implements OnInit {
  payDetails: any = {};

  constructor(
    private route: ActivatedRoute,
    private $claim: ClaimService,
    private $common: CommonService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const id = params.get('id') || '';
      if (!id) return;
      const config = { headers: { id } };
      this.$common.showLoader();
      this.$claim.getPayDetails(config).subscribe(
        (res: any) => {
          this.$common.hideLoader();
          if (res?.status && Array.isArray(res.object) && res.object.length) {
            this.payDetails = res.object[0];
          }
        },
        () => this.$common.hideLoader()
      );
    });
  }
}


