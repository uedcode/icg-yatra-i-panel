import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from 'src/app/service/core/common.service';

@Component({
  selector: 'app-public-preview-update-pno',
  templateUrl: './public-preview-update-pno.component.html',
  styleUrls: ['./public-preview-update-pno.component.scss'],
  standalone: false
})
export class PublicPreviewUpdatePnoComponent implements OnInit {
  statusMessage = '';

  constructor(private http: HttpClient, private $common: CommonService) {}

  ngOnInit(): void {
    this.updatePno();
  }

  private updatePno(): void {
    this.$common.showLoader();
    this.http.get<any>('utilPno/updatePno').subscribe(
      (response: any) => {
        this.$common.hideLoader();
        this.statusMessage = response?.message || '';
      },
      () => {
        this.$common.hideLoader();
        this.statusMessage = 'Unable to update PNO.';
      }
    );
  }
}

