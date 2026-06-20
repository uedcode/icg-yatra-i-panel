import { Component, OnInit } from '@angular/core';
import { ClaimStateApiService } from 'src/app/service/api/claim-state/claim-state-api.service';
import { AuthService } from 'src/app/service/auth/auth.service';

@Component({
  selector: 'app-executor-esign-report',
  templateUrl: './esign-report.component.html',
  styleUrls: ['./esign-report.component.css'],
  standalone: false,
})
export class EsignReportComponent implements OnInit {
  rows: any[] = [];
  user: any;

  constructor(private claimStateApi: ClaimStateApiService, private $auth: AuthService) {}

  ngOnInit(): void {
    this.user = this.$auth.getUserDetails();
    this.load();
  }

  load(): void {
    const config = {
      headers: {
        roleTypeId: this.user?.roleTypeId,
        unitId: this.user?.unitId,
        userId: this.user?.userId,
      },
    };
    this.claimStateApi.getEsignReportData(config).subscribe({
      next: (res: any) => {
        this.rows = Array.isArray(res?.object) ? res.object : [];
      },
      error: () => {
        this.rows = [];
      },
    });
  }
}
