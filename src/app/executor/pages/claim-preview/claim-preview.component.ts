import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/service/auth/auth.service';
import { ClaimApiService } from 'src/app/service/api/claim/claim-api.service';
import { ClaimStateApiService } from 'src/app/service/api/claim-state/claim-state-api.service';
import { CommonService } from 'src/app/service/core/common.service';

@Component({
  selector: 'app-executor-claim-preview',
  templateUrl: './claim-preview.component.html',
  styleUrls: ['./claim-preview.component.css'],
  standalone: false,
})
export class ClaimPreviewComponent implements OnInit {
  claimId: string | null = null;
  subFormId: string | null = null;
  formObj: any = null;
  documentDtos: any[] = [];
  stateHistory: any[] = [];
  userIdDetails: any;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    public $auth: AuthService,
    private $claimApi: ClaimApiService, private $claimStateApi: ClaimStateApiService,
    private $common: CommonService
  ) {}

  ngOnInit(): void {
    this.userIdDetails = this.$auth.getUserDetails();
    this.route.queryParamMap.subscribe((params) => {
      this.claimId = params.get('claimId') || params.get('id');
      this.subFormId = params.get('subFormId');
      if (this.claimId && this.subFormId) {
        this.loadClaim();
        this.loadStateHistory();
      }
    });
  }

  loadClaim(): void {
    const config = {
      headers: {
        claimId: this.claimId,
        subFormId: this.subFormId,
        isPreview: 'true',
      },
    };
    this.$claimApi.getSingleClaimPreview(config).subscribe({
      next: (response: any) => {
        let obj = response?.object;
        if (Array.isArray(obj)) obj = obj[0] || null;
        this.formObj = obj;
        this.documentDtos = Array.isArray(obj?.yatDocsDTOs) ? obj.yatDocsDTOs : [];
      },
      error: () => {
        this.formObj = null;
        this.documentDtos = [];
      },
    });
  }

  loadStateHistory(): void {
    const config = {
      headers: {
        claimId: this.claimId,
        roleTypeId: this.userIdDetails?.roleTypeId,
        userId: this.userIdDetails?.userId,
        unitId: this.userIdDetails?.unitId,
      },
    };

    this.$claimStateApi.getAll(config).subscribe({
      next: (response: any) => {
        this.stateHistory = Array.isArray(response?.object) ? response.object : [];
      },
      error: () => {
        this.stateHistory = [];
      },
    });
  }

  goBack(): void {
    this.location.back();
  }

  display(value: any): string {
    if (value === null || value === undefined) return '-';
    const str = String(value).trim();
    return str ? str : '-';
  }

  asDate(value: any): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}


