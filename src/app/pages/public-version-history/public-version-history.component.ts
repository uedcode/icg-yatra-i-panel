import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/service/common.service';
import { VersionhistoryService } from 'src/app/service/master/versionhistory.service';

@Component({
  selector: 'app-public-version-history',
  templateUrl: './public-version-history.component.html',
  styleUrls: ['./public-version-history.component.scss'],
  standalone: false
})
export class PublicVersionHistoryComponent implements OnInit {
  dataList: Array<any> = [];

  constructor(
    private $common: CommonService,
    private $versionhistory: VersionhistoryService
  ) {}

  ngOnInit(): void {
    this.getAll();
  }

  private getAll(): void {
    this.$common.showLoader();
    const config = { headers: {} };
    this.$versionhistory.get(config).subscribe(
      (response: any) => {
        this.$common.hideLoader();
        if (response?.status === true) {
          this.dataList = Array.isArray(response.object) ? response.object : [];
        }
      },
      () => {
        this.$common.hideLoader();
      }
    );
  }
}

